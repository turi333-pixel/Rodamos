"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Coordinates, BestStop } from "@/types";
import type { ElevPoint } from "./ElevationProfileCard";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface RouteMapCardProps {
  origin?: Coordinates;
  destination: Coordinates;
  destinationName: string;
  originName?: string;
  bestStops?: BestStop[];
  totalKm?: number;
  onElevationLoaded?: (points: ElevPoint[], totalKm: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function sampleIndices(len: number, n: number): number[] {
  if (len <= n) return Array.from({ length: len }, (_, i) => i);
  const step = (len - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => Math.round(i * step));
}

async function fetchGeometry(origin: Coordinates, dest: Coordinates): Promise<[number, number][] | null> {
  try {
    const p = new URLSearchParams({
      olng: String(origin.lng), olat: String(origin.lat),
      dlng: String(dest.lng),   dlat: String(dest.lat),
    });
    const res = await fetch(`/api/route-geometry?${p}`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    return data.coordinates ?? null;
  } catch { return null; }
}

async function fetchElevation(latlngs: { lat: number; lng: number }[]): Promise<number[]> {
  try {
    const res = await fetch("/api/elevation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations: latlngs }),
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json();
    return data.elevations ?? [];
  } catch { return []; }
}

// ─── Stop colours ─────────────────────────────────────────────────────────────

const STOP_COLOUR: Record<string, string> = {
  cafe: "#f59e0b",
  restaurante: "#f59e0b",
  "moto-cafe": "#f59e0b",
  mirador: "#a78bfa",
  foto: "#a78bfa",
  combustible: "#fb923c",
  descanso: "#34d399",
};

// ─── Inner map (client-only) ──────────────────────────────────────────────────

function MapInner({
  origin, destination, destinationName, originName,
  bestStops = [], totalKm, onElevationLoaded,
}: RouteMapCardProps) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const centerLat = origin ? (origin.lat + destination.lat) / 2 : destination.lat;
      const centerLng = origin ? (origin.lng + destination.lng) / 2 : destination.lng;

      const map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: origin ? 9 : 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
        .addTo(map);

      const makePin = (color: string, size = 12) =>
        L.divIcon({
          className: "",
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 0 8px ${color}88,0 2px 6px rgba(0,0,0,.6)"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

      L.marker([destination.lat, destination.lng], { icon: makePin("#ef4444", 14) })
        .bindPopup(`<b>${destinationName}</b>`).addTo(map);

      if (origin) {
        L.marker([origin.lat, origin.lng], { icon: makePin("#22c55e", 14) })
          .bindPopup(`<b>${originName ?? "Origen"}</b>`).addTo(map);

        for (const stop of bestStops) {
          if (!stop.coordinates) continue;
          const color = STOP_COLOUR[stop.type] ?? "#94a3b8";
          L.marker([stop.coordinates.lat, stop.coordinates.lng], { icon: makePin(color, 10) })
            .bindPopup(`<b>${stop.name}</b>`).addTo(map);
        }

        const osrmCoords = await fetchGeometry(origin, destination);
        if (cancelled) return;

        if (osrmCoords && osrmCoords.length > 1) {
          const latlngs: [number, number][] = osrmCoords.map(([lng, lat]) => [lat, lng]);

          L.polyline(latlngs, { color: "#1a6fff", weight: 8, opacity: 0.18 }).addTo(map);
          L.polyline(latlngs, { color: "#3b82f6", weight: 3.5, opacity: 0.95 }).addTo(map);
          map.fitBounds(L.polyline(latlngs).getBounds(), { padding: [32, 32] });

          // Compute actual km from geometry
          let km = 0;
          for (let i = 1; i < latlngs.length; i++) km += haversineKm(latlngs[i - 1], latlngs[i]);
          const actualKm = totalKm ?? Math.round(km);

          // Fetch elevation and pass up via callback
          if (onElevationLoaded) {
            const indices = sampleIndices(osrmCoords.length, 50);
            const sampled = indices.map(i => ({ lat: osrmCoords[i][1], lng: osrmCoords[i][0] }));
            const elevs = await fetchElevation(sampled);
            if (cancelled) return;

            if (elevs.length === sampled.length) {
              let cumKm = 0;
              const pts: ElevPoint[] = sampled.map((pt, idx) => {
                if (idx > 0) {
                  const prev = sampled[idx - 1];
                  cumKm += haversineKm([prev.lat, prev.lng], [pt.lat, pt.lng]);
                }
                return { km: parseFloat(cumKm.toFixed(2)), elev: elevs[idx] };
              });
              onElevationLoaded(pts, actualKm);
            }
          }
        } else {
          map.fitBounds(
            [[origin.lat, origin.lng], [destination.lat, destination.lng]],
            { padding: [32, 32] }
          );
        }
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 230 }}>
      {loading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(8,8,18,0.88)" }}
        >
          <div className="w-6 h-6 border-2 border-bmw-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400">Cargando mapa…</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

const MapInnerDynamic = dynamic(() => Promise.resolve(MapInner), { ssr: false });

// ─── Public card ─────────────────────────────────────────────────────────────

export function RouteMapCard(props: RouteMapCardProps) {
  const { origin, destination, destinationName, originName, bestStops } = props;

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <span className="text-base">🗺️</span>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Mapa de ruta</p>
          {origin && (
            <p className="text-2xs text-zinc-500 leading-tight mt-0.5">
              {originName ?? "Origen"} → {destinationName}
            </p>
          )}
        </div>
      </div>

      <MapInnerDynamic {...props} />

      {origin && (
        <div className="flex items-center gap-4 px-4 pt-2 pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px #22c55e88" }} />
            <span className="text-2xs text-zinc-400">{originName ?? "Origen"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: "0 0 6px #ef444488" }} />
            <span className="text-2xs text-zinc-400">{destinationName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-5 rounded-full bg-blue-500" />
            <span className="text-2xs text-zinc-400">Ruta</span>
          </div>
          {bestStops?.some(s => s.coordinates) && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b", boxShadow: "0 0 5px #f59e0b88" }} />
              <span className="text-2xs text-zinc-400">Paradas</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
