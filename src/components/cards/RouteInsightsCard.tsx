"use client";
import { motion } from "framer-motion";
import { CardShell } from "@/components/ui/CardShell";
import type { RouteInsights } from "@/types";

const ROAD_QUALITY: Record<string, { color: string; bar: string; pct: number }> = {
  "Excelente": { color: "#00d97e", bar: "linear-gradient(90deg,#00d97e,#00a85a)", pct: 95 },
  "Bueno":     { color: "#3385ff", bar: "linear-gradient(90deg,#3385ff,#0066cc)", pct: 75 },
  "Regular":   { color: "#f97316", bar: "linear-gradient(90deg,#f97316,#ea580c)", pct: 50 },
  "Malo":      { color: "#ef4444", bar: "linear-gradient(90deg,#ef4444,#dc2626)", pct: 25 },
};

const highlightColors: Record<string, string> = {
  mirador:    "#3385ff",
  parque:     "#22c55e",
  puerto:     "#a855f7",
  carretera:  "#f97316",
  foto:       "#ec4899",
  patrimonio: "#f59e0b",
};

export function RouteInsightsCard({ insights }: { insights: RouteInsights }) {
  const rq = ROAD_QUALITY[insights.roadQuality] ?? ROAD_QUALITY["Regular"];

  const quickStats = [
    { emoji: "📡", label: "Radares", value: insights.speedCameras },
    { emoji: "🚇", label: "Túneles", value: insights.tunnels },
    { emoji: "⬆️", label: "Desnivel", value: `${insights.totalElevationGain}m` },
  ].filter((s) => s.value !== 0 && s.value !== "0m");

  return (
    <CardShell theme="route" icon="🗺️" title="Insights de Ruta" subtitle="Lo que no te puedes perder" delay={0.45}>

      {/* Road quality bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-2xs" style={{ color: "rgba(148,163,184,0.55)" }}>Calidad de calzada</p>
          <span className="text-xs font-bold" style={{ color: rq.color }}>{insights.roadQuality}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: rq.bar }}
            initial={{ width: 0 }}
            animate={{ width: `${rq.pct}%` }}
            transition={{ duration: 0.9, delay: 0.25 }}
          />
        </div>
      </div>

      {/* Famous roads chips */}
      {insights.famousRoads.length > 0 && (
        <div className="mb-4">
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Carreteras míticas
          </p>
          <div className="flex flex-wrap gap-2">
            {insights.famousRoads.map((road) => (
              <span key={road} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "linear-gradient(135deg,rgba(20,184,166,0.15),rgba(14,165,233,0.10))",
                  border: "1px solid rgba(20,184,166,0.30)",
                  color: "#5eead4",
                }}>
                🏍️ {road}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mountain passes */}
      {insights.passes.length > 0 && (
        <div className="mb-4">
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Puertos de montaña
          </p>
          <div className="flex flex-wrap gap-2">
            {insights.passes.map((pass) => (
              <span key={pass} className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.28)", color: "#c4b5fd" }}>
                ⛰️ {pass}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {insights.highlights.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Puntos de interés
          </p>
          {insights.highlights.map((h, i) => {
            const color = highlightColors[h.type] ?? "#14b8a6";
            return (
              <motion.div
                key={h.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${color}15`, color }}>
                  ✦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{h.name}</p>
                    <span className="text-2xs flex-shrink-0" style={{ color: "rgba(148,163,184,0.5)" }}>km {h.km}</span>
                  </div>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(148,163,184,0.7)" }}>{h.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick stats */}
      {quickStats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center p-2.5 rounded-xl text-center"
              style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.14)" }}>
              <span className="text-base mb-1">{stat.emoji}</span>
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-2xs mt-0.5 leading-tight" style={{ color: "rgba(148,163,184,0.55)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}
