import { NextRequest, NextResponse } from "next/server";

// ─── Nominatim (OSM) for geocoding — free, no key required ───────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q       = searchParams.get("q");
  const lat     = searchParams.get("lat");
  const lng     = searchParams.get("lng");
  const reverse = searchParams.get("reverse");

  if (reverse === "true" && lat && lng) {
    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { "User-Agent": "Rodamos/1.0 (rodamos.app)" } }
      );
      const data = await res.json();
      const name =
        data.address?.city ??
        data.address?.town ??
        data.address?.village ??
        data.display_name?.split(",")[0] ??
        "Mi ubicación";
      return NextResponse.json({ name, address: data.display_name });
    } catch {
      return NextResponse.json({ name: "Mi ubicación", address: "" });
    }
  }

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // Check for Mapbox token (preferred, either server-only or public)
  const mapboxToken = process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken && mapboxToken.length > 10) {
    return mapboxGeocode(q, mapboxToken);
  }

  // Fall back to Nominatim
  return nominatimGeocode(q);
}

async function mapboxGeocode(q: string, token: string) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(q)}&access_token=${token}&language=es&limit=5`,
      { headers: { "User-Agent": "Rodamos/1.0" } }
    );
    const data = await res.json();
    const results = (data.features ?? []).map((f: Record<string, unknown>) => {
      const props = f.properties as Record<string, unknown>;
      const geom  = f.geometry  as { coordinates: [number, number] };
      return {
        id:          props.mapbox_id ?? Math.random().toString(36),
        name:        props.name ?? props.place_name ?? "",
        address:     (props.full_address ?? props.place_name ?? "") as string,
        coordinates: { lat: geom.coordinates[1], lng: geom.coordinates[0] },
      };
    });
    return NextResponse.json({ results });
  } catch {
    return nominatimGeocode(q);
  }
}

async function nominatimGeocode(q: string) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&accept-language=es&limit=5&addressdetails=1`,
      { headers: { "User-Agent": "Rodamos/1.0 (rodamos.app)" } }
    );
    const data = await res.json();
    const results = data.map((item: Record<string, unknown>) => {
      const address = item.address as Record<string, string> | undefined;
      // Build a clean short name (city > town > village > municipality > first part of display_name)
      const name =
        address?.city ??
        address?.town ??
        address?.village ??
        address?.municipality ??
        address?.county ??
        (item.display_name as string)?.split(",")[0] ??
        "";
      // Build a readable address (name + region + country)
      const region = address?.state ?? address?.province ?? "";
      const country = address?.country ?? "";
      const shortAddress = [region, country].filter(Boolean).join(", ");
      return {
        id:          item.place_id ?? Math.random().toString(36),
        name,
        address:     shortAddress || (item.display_name as string),
        coordinates: {
          lat: parseFloat(item.lat as string),
          lng: parseFloat(item.lon as string),
        },
      };
    });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
