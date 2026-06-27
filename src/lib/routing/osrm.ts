import type { Coordinates } from "@/types";

export interface RouteData {
  distanceKm: number;
  durationMin: number;
  durationFormatted: string;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export async function getRouteData(
  origin: Coordinates,
  destination: Coordinates
): Promise<RouteData | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?overview=false`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Rodamos/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.[0]) return null;

    const distanceKm = Math.round(data.routes[0].distance / 1000);
    const durationMin = Math.round(data.routes[0].duration / 60);

    return { distanceKm, durationMin, durationFormatted: formatDuration(durationMin) };
  } catch {
    return null;
  }
}

// Haversine straight-line distance as fallback when no origin coordinates
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}
