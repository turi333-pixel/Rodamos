import type { BestStop } from "@/types";

export interface OSMPlace {
  id: string;
  name: string;
  type: string;          // amenity / tourism / shop value
  lat: number;
  lng: number;
  phone?: string;
  address?: string;
  distanceKm?: number;
}

async function overpassQuery(ql: string): Promise<{ elements: Record<string, unknown>[] }> {
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(ql)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

function dist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

function elementCoords(el: Record<string, unknown>): { lat: number; lng: number } | null {
  if (typeof el.lat === "number") return { lat: el.lat as number, lng: el.lon as number };
  const center = el.center as Record<string, number> | undefined;
  if (center?.lat) return { lat: center.lat, lng: center.lon };
  return null;
}

function toOSMPlace(el: Record<string, unknown>, refLat: number, refLng: number): OSMPlace | null {
  const tags = (el.tags ?? {}) as Record<string, string>;
  const name = tags.name;
  if (!name) return null;
  const coords = elementCoords(el);
  if (!coords) return null;
  return {
    id:         String(el.id),
    name,
    type:       tags.amenity ?? tags.tourism ?? tags.shop ?? "place",
    lat:        coords.lat,
    lng:        coords.lng,
    phone:      tags.phone ?? tags["contact:phone"],
    address:    [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]].filter(Boolean).join(", "),
    distanceKm: dist(refLat, refLng, coords.lat, coords.lng),
  };
}

// Nearby stops — tourist attractions, viewpoints, historic sites, cafes, restaurants
export async function getNearbyStops(lat: number, lng: number, radiusM = 15000): Promise<OSMPlace[]> {
  const half = Math.round(radiusM / 2);
  const wide = radiusM * 3;
  const q = `[out:json][timeout:15];
(
  node["tourism"="viewpoint"]["name"](around:${radiusM},${lat},${lng});
  node["tourism"="attraction"]["name"](around:${radiusM},${lat},${lng});
  way["tourism"="attraction"]["name"](around:${radiusM},${lat},${lng});
  node["tourism"="museum"]["name"](around:${radiusM},${lat},${lng});
  node["historic"]["name"](around:${radiusM},${lat},${lng});
  way["historic"]["name"](around:${radiusM},${lat},${lng});
  node["natural"="peak"]["name"](around:${wide},${lat},${lng});
  node["natural"="waterfall"]["name"](around:${radiusM},${lat},${lng});
  node["amenity"="cafe"]["name"](around:${half},${lat},${lng});
  node["amenity"="restaurant"]["name"]["cuisine"](around:${half},${lat},${lng});
  node["amenity"="fuel"]["name"](around:${radiusM},${lat},${lng});
  node["shop"="motorcycle"]["name"](around:${wide},${lat},${lng});
);
out center body 40;`;

  const OSM_STOP_TYPE: Record<string, BestStop["type"]> = {
    viewpoint: "mirador", attraction: "mirador", museum: "descanso",
    castle: "mirador", monument: "mirador", ruins: "mirador", historic: "mirador",
    peak: "mirador", waterfall: "foto",
    cafe: "cafe", restaurant: "restaurante", fuel: "combustible", motorcycle: "moto-cafe",
  };

  try {
    const data = await overpassQuery(q);
    return data.elements
      .map(el => {
        const tags = (el.tags ?? {}) as Record<string, string>;
        const name = tags.name;
        if (!name || name.length < 3) return null;
        const coords = elementCoords(el);
        if (!coords) return null;
        const rawType = tags.tourism ?? tags.historic ?? tags.natural ?? tags.amenity ?? tags.shop ?? "place";
        return {
          id:         String(el.id),
          name,
          type:       OSM_STOP_TYPE[rawType] ?? rawType,
          lat:        coords.lat,
          lng:        coords.lng,
          phone:      tags.phone ?? tags["contact:phone"],
          address:    [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]].filter(Boolean).join(", "),
          distanceKm: dist(lat, lng, coords.lat, coords.lng),
        } as OSMPlace;
      })
      .filter((p): p is OSMPlace => p !== null)
      .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
  } catch {
    return [];
  }
}

// Emergency services near destination
export async function getNearbyEmergency(lat: number, lng: number): Promise<{
  hospitals: OSMPlace[];
  dealers: OSMPlace[];
  workshops: OSMPlace[];
}> {
  const q = `[out:json][timeout:15];
(
  node["amenity"="hospital"]["name"](around:40000,${lat},${lng});
  way["amenity"="hospital"]["name"](around:40000,${lat},${lng});
  node["amenity"="clinic"]["name"](around:20000,${lat},${lng});
  node["shop"="motorcycle"]["name"](around:50000,${lat},${lng});
  way["shop"="motorcycle"]["name"](around:50000,${lat},${lng});
);
out center body 30;`;
  try {
    const data = await overpassQuery(q);
    const hospitals: OSMPlace[] = [];
    const dealers: OSMPlace[] = [];

    for (const el of data.elements) {
      const place = toOSMPlace(el, lat, lng);
      if (!place) continue;
      if (place.type === "hospital" || place.type === "clinic") hospitals.push(place);
      else if (place.type === "motorcycle") dealers.push(place);
    }

    const byDist = (a: OSMPlace, b: OSMPlace) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
    return {
      hospitals: hospitals.sort(byDist).slice(0, 3),
      dealers:   dealers.sort(byDist).slice(0, 2),
      workshops: [],
    };
  } catch {
    return { hospitals: [], dealers: [], workshops: [] };
  }
}
