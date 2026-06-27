"use client";
import { motion } from "framer-motion";
import { CardShell, THEMES } from "@/components/ui/CardShell";
import type { RoadConditions } from "@/types";

const gripConfig = {
  "Óptimo":    { color: "#00d97e", glow: "rgba(0,217,126,0.3)",  emoji: "🟢" },
  "Bueno":     { color: "#3385ff", glow: "rgba(51,133,255,0.3)", emoji: "🔵" },
  "Reducido":  { color: "#f97316", glow: "rgba(249,115,22,0.3)", emoji: "🟠" },
  "Malo":      { color: "#ef4444", glow: "rgba(239,68,68,0.3)",  emoji: "🔴" },
  "Peligroso": { color: "#dc2626", glow: "rgba(220,38,38,0.4)",  emoji: "🚨" },
};

const probColors = { "baja": "#00d97e", "media": "#f97316", "alta": "#ef4444", "muy alta": "#dc2626" };

export function RoadConditionsCard({ conditions }: { conditions: RoadConditions }) {
  const grip = gripConfig[conditions.gripLevel] ?? gripConfig["Bueno"];
  const danger = Math.min(100, conditions.dangerScore);
  const t = THEMES.road;

  return (
    <CardShell theme="road" icon="🛣️" title="Condiciones de Carretera" subtitle={conditions.surface} delay={0.15}>

      {/* Grip + temperature */}
      <div className="flex gap-2.5 mb-4">
        <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl gap-2"
          style={{ background: `${grip.color}0c`, border: `1px solid ${grip.color}28` }}>
          <span className="text-3xl">{grip.emoji}</span>
          <div className="text-center">
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>Agarre</p>
            <p className="text-sm font-bold" style={{ color: grip.color, textShadow: `0 0 10px ${grip.glow}` }}>
              {conditions.gripLevel}
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl gap-2"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.20)" }}>
          <span className="text-3xl">🌡️</span>
          <div className="text-center">
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>Temp. asfalto</p>
            <p className="text-sm font-bold" style={{ color: "#f97316" }}>{conditions.roadTemperature}°C</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl gap-2"
          style={{ background: danger > 60 ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${danger > 60 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"}` }}>
          <span className="text-3xl">{danger < 30 ? "✅" : danger < 60 ? "⚠️" : "🚨"}</span>
          <div className="text-center">
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>Peligro</p>
            <p className="text-sm font-bold" style={{ color: danger < 30 ? "#00d97e" : danger < 60 ? "#f97316" : "#ef4444" }}>
              {danger}/100
            </p>
          </div>
        </div>
      </div>

      {/* Danger meter */}
      <div className="mb-4">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${danger}%` }}
            transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
            style={{
              background: danger < 30
                ? "linear-gradient(90deg,#00d97e,#00a85a)"
                : danger < 60
                ? "linear-gradient(90deg,#f97316,#ea580c)"
                : "linear-gradient(90deg,#ef4444,#dc2626)",
              boxShadow: `0 0 8px ${grip.glow}`,
            }}
          />
        </div>
      </div>

      {/* AI text */}
      <div className="p-3.5 rounded-2xl mb-4"
        style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(210,210,200,0.9)" }}>{conditions.interpretation}</p>
      </div>

      {/* Hazards */}
      {conditions.hazards.length > 0 && (
        <div className="space-y-2">
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Riesgos identificados
          </p>
          {conditions.hazards.map((h, i) => {
            const pc = probColors[h.probability] ?? "#94a3b8";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: `${pc}09`, border: `1px solid ${pc}22` }}
              >
                <span className="text-lg flex-shrink-0">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{h.type}</p>
                    <span className="text-2xs px-1.5 py-0.5 rounded-lg font-bold"
                      style={{ color: pc, background: `${pc}18` }}>
                      {h.probability}
                    </span>
                  </div>
                  <p className="text-xs leading-snug" style={{ color: "rgba(148,163,184,0.75)" }}>{h.advice}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </CardShell>
  );
}
