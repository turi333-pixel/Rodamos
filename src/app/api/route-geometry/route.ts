import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const olng = searchParams.get("olng");
  const olat = searchParams.get("olat");
  const dlng = searchParams.get("dlng");
  const dlat = searchParams.get("dlat");

  if (!olng || !olat || !dlng || !dlat) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${olng},${olat};${dlng},${dlat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Rodamos/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return NextResponse.json({ error: "OSRM error" }, { status: 502 });

    const data = await res.json();
    const coordinates = data.routes?.[0]?.geometry?.coordinates ?? null;

    return NextResponse.json({ coordinates });
  } catch {
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 502 });
  }
}
