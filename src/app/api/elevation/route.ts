import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { locations } = await request.json() as { locations: { lat: number; lng: number }[] };

  if (!locations?.length) {
    return NextResponse.json({ elevations: [] });
  }

  try {
    // OpenTopoData expects a pipe-separated "lat,lng|lat,lng" string
    const locationStr = locations.map(l => `${l.lat},${l.lng}`).join("|");
    const res = await fetch("https://api.opentopodata.org/v1/srtm30m", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations: locationStr }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json({ elevations: [] });
    const data = await res.json();
    const elevations: number[] = (data.results ?? []).map((r: { elevation?: number }) => r.elevation ?? 0);
    return NextResponse.json({ elevations });
  } catch {
    return NextResponse.json({ elevations: [] });
  }
}
