import { NextRequest, NextResponse } from "next/server";
import { getOpenMeteoWeather } from "@/lib/weather/openmeteo";
import { getWeather } from "@/lib/weather";
import { getRouteData } from "@/lib/routing/osrm";
import { getNearbyStops, getNearbyEmergency } from "@/lib/pois/overpass";
import { buildAnalysisResult } from "@/lib/analysis/builder";
import { analyzeWithAI } from "@/lib/ai/engine";
import type { RouteInput, Location } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination: rawDest, origin, date, motorcycle } = body;

    if (!rawDest?.name) {
      return NextResponse.json({ error: "Se requiere un destino" }, { status: 400 });
    }

    // ── 1. Geocode destination if coordinates are missing ─────────────────────
    let destination: Location = rawDest;
    if (!destination.coordinates) {
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination.name)}&format=json&limit=1`,
          { headers: { "User-Agent": "Rodamos/1.0" }, signal: AbortSignal.timeout(6000) }
        );
        const geoData = await geo.json();
        if (geoData?.[0]) {
          destination = {
            ...destination,
            coordinates: { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) },
          };
        }
      } catch { /* continue */ }
    }

    if (!destination.coordinates) {
      return NextResponse.json({ error: "No se pudo localizar el destino. Por favor, selecciónalo del autocompletado." }, { status: 400 });
    }

    const routeDate = new Date(date);
    const coords = destination.coordinates;
    const route: RouteInput = { destination, origin, date: routeDate };

    // ── 2. Fetch all real data in parallel ────────────────────────────────────
    // Emergency runs in background with short timeout — don't block AI on it
    const emergencyPromise = Promise.race([
      getNearbyEmergency(coords.lat, coords.lng),
      new Promise<Awaited<ReturnType<typeof getNearbyEmergency>>>(
        resolve => setTimeout(() => resolve({ hospitals: [], dealers: [], workshops: [] }), 5000)
      ),
    ]);

    const [weather, routeData, stops] = await Promise.all([
      getOpenMeteoWeather(coords.lat, coords.lng, routeDate).then(
        w => w ?? getWeather(coords, routeDate)
      ),
      origin?.coordinates ? getRouteData(origin.coordinates, coords) : Promise.resolve(null),
      getNearbyStops(coords.lat, coords.lng),
    ]);

    // Emergency: use whatever arrived, default to empty if still pending
    const emergency = await Promise.race([
      emergencyPromise,
      Promise.resolve({ hospitals: [], dealers: [], workshops: [] }),
    ]);

    if (!weather) {
      return NextResponse.json(
        { error: "No se pudo obtener el clima para este destino. Inténtalo de nuevo." },
        { status: 503 }
      );
    }

    // ── 3. Build real algorithmic analysis ────────────────────────────────────
    const baseResult = buildAnalysisResult(route, weather, routeData, stops, emergency, motorcycle);

    // ── 4. Optionally enrich text fields with AI ──────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    const hasAI  = !!apiKey && apiKey.length > 20;

    if (hasAI) {
      try {
        const enriched = await Promise.race([
          analyzeWithAI(baseResult, weather, routeData, stops),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 14000)),
        ]);
        return NextResponse.json(enriched);
      } catch (aiErr) {
        console.warn("AI enrichment failed, returning algorithmic result:", aiErr instanceof Error ? aiErr.message : aiErr);
      }
    }

    // Return real data with algorithmic text (no mock, no AI required)
    return NextResponse.json(baseResult);
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Error al analizar la ruta. Por favor, inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
