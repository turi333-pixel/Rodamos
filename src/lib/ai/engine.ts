import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, WeatherData, BestStop } from "@/types";
import type { RouteData } from "@/lib/routing/osrm";
import type { OSMPlace } from "@/lib/pois/overpass";
import { buildEnrichmentPrompt } from "./prompts";

const MODEL = "claude-haiku-4-5-20251001";

async function callClaude(prompt: string, maxTokens = 2000): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: 0.5,
    system: "Eres Rodamos AI. Respondes SIEMPRE en español. Cuando se pide JSON, devuelves SOLO JSON válido, sin texto, sin comentarios, sin backticks.",
    messages: [{ role: "user", content: prompt }],
  });
  const content = msg.content[0];
  if (content.type !== "text") throw new Error("Respuesta inesperada");
  return content.text;
}

function parseJSON<T>(raw: string): T {
  const clean = raw.trim()
    .replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,(\s*[}\]])/g, "$1");
  const match = clean.match(/[\[{][\s\S]*[\]}]/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]) as T;
}

// ─── Dedicated stops generator ────────────────────────────────────────────────

async function generateStops(
  origin: string,
  dest: string,
  distKm: number,
  destCoords?: { lat: number; lng: number }
): Promise<BestStop[]> {
  const coordsHint = destCoords
    ? `Coordenadas exactas del destino: ${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}.`
    : "";
  const prompt = `Soy motociclista y voy de ${origin} a ${dest} (${distKm > 0 ? `${distKm} km` : "ruta corta"}).
${coordsHint}
IMPORTANTE: Sugiere ÚNICAMENTE lugares que existan físicamente en el trayecto entre ${origin} y ${dest} o muy cerca de esa ruta. NO uses lugares de otras ciudades o regiones. Si no conoces lugares reales en esa zona específica, usa nombres genéricos descriptivos del tipo "Mirador cerca de ${dest}".

Sugiere 4 paradas reales: miradores, restaurantes locales, cafeterías, spots de foto.

Devuelve SOLO este array JSON:
[
  {"id":"ai-1","name":"Nombre real","type":"mirador","description":"Descripción breve","why":"Por qué parar","distanceFromStart":${Math.round(distKm * 0.25)},"distanceRemaining":${Math.round(distKm * 0.75)},"rating":4.5},
  {"id":"ai-2","name":"Nombre real","type":"cafe","description":"Descripción breve","why":"Por qué parar","distanceFromStart":${Math.round(distKm * 0.5)},"distanceRemaining":${Math.round(distKm * 0.5)},"rating":4.4},
  {"id":"ai-3","name":"Nombre real","type":"restaurante","description":"Descripción breve","why":"Por qué parar","distanceFromStart":${Math.round(distKm * 0.7)},"distanceRemaining":${Math.round(distKm * 0.3)},"rating":4.5},
  {"id":"ai-4","name":"Nombre real","type":"foto","description":"Descripción breve","why":"Por qué parar","distanceFromStart":${Math.round(distKm * 0.9)},"distanceRemaining":${Math.round(distKm * 0.1)},"rating":4.3}
]
Tipos válidos: mirador, cafe, restaurante, foto, descanso, moto-cafe, combustible`;

  const raw = await callClaude(prompt, 700);
  const stops = parseJSON<Array<{
    id: string; name: string; type: string; description: string;
    why: string; distanceFromStart: number; distanceRemaining: number; rating: number;
  }>>(raw);

  return stops.map(s => ({
    id: s.id,
    name: s.name,
    type: (s.type as BestStop["type"]) ?? "descanso",
    description: s.description,
    why: s.why,
    distanceFromStart: s.distanceFromStart ?? 0,
    distanceRemaining: s.distanceRemaining ?? 0,
    rating: s.rating ?? 4.5,
  }));
}

// ─── Main enrichment ──────────────────────────────────────────────────────────

export async function analyzeWithAI(
  base: AnalysisResult,
  weather: WeatherData,
  routeData: RouteData | null,
  stops: OSMPlace[]
): Promise<AnalysisResult> {
  const origin = base.route.origin?.name ?? "origen";
  const dest   = base.route.destination.name;
  const destCoords = base.route.destination.coordinates;
  const distKm = routeData?.distanceKm ?? 0;

  // Real OSM stops (trustworthy, geographically accurate)
  const osmStops = base.bestStops.filter(s => !s.id.startsWith("ai-"));

  // Only ask AI for stops when OSM found fewer than 2 real places
  const needsAIStops = osmStops.length < 2;

  const [enrichment, aiStops] = await Promise.allSettled([
    callClaude(buildEnrichmentPrompt(base, weather, routeData, stops), 1400).then(raw => parseJSON<Partial<{
      recommendation: string;
      weather: Partial<AnalysisResult["weather"]>;
      roadConditions: Partial<Pick<AnalysisResult["roadConditions"], "interpretation" | "surface">>;
      riderPrep: Partial<AnalysisResult["riderPrep"]>;
      motoPrep: Partial<Pick<AnalysisResult["motoPrep"], "summary">>;
      routeInsights: Partial<AnalysisResult["routeInsights"]>;
      dangers: Array<{ id: string; description: string; advice: string }>;
      aiRecommendations: string[];
      aiSummary: string;
      summary: Partial<Pick<AnalysisResult["summary"], "recommendation">>;
    }>>(raw)),
    needsAIStops
      ? generateStops(origin, dest, distKm, destCoords)
      : Promise.resolve([] as BestStop[]),
  ]);

  const e = enrichment.status === "fulfilled" ? enrichment.value : {};
  const aiStopsList = aiStops.status === "fulfilled" ? aiStops.value : [];

  // Prefer real OSM stops; only use AI stops if OSM couldn't find anything
  const mergedStops = osmStops.length >= 2 ? osmStops : (aiStopsList.length > 0 ? aiStopsList : base.bestStops);

  return {
    ...base,
    recommendation:    e.recommendation    ?? base.recommendation,
    aiRecommendations: e.aiRecommendations ?? base.aiRecommendations,
    aiSummary:         e.aiSummary         ?? base.aiSummary,
    summary: { ...base.summary, recommendation: e.summary?.recommendation ?? base.summary.recommendation },
    weather: {
      ...base.weather,
      interpretation: e.weather?.interpretation ?? base.weather.interpretation,
      riderImpact:    e.weather?.riderImpact    ?? base.weather.riderImpact,
      bestWindow:     e.weather?.bestWindow     ?? base.weather.bestWindow,
      alerts:         e.weather?.alerts         ?? base.weather.alerts,
    },
    roadConditions: {
      ...base.roadConditions,
      interpretation: e.roadConditions?.interpretation ?? base.roadConditions.interpretation,
      surface:        e.roadConditions?.surface        ?? base.roadConditions.surface,
    },
    riderPrep: e.riderPrep ? { ...base.riderPrep, ...e.riderPrep } : base.riderPrep,
    motoPrep: { ...base.motoPrep, summary: e.motoPrep?.summary ?? base.motoPrep.summary },
    routeInsights: e.routeInsights ? { ...base.routeInsights, ...e.routeInsights } : base.routeInsights,
    bestStops: mergedStops,
    dangers: base.dangers.map(danger => {
      const ai = e.dangers?.find(d => d.id === danger.id);
      return ai ? { ...danger, description: ai.description ?? danger.description, advice: ai.advice ?? danger.advice } : danger;
    }),
  };
}
