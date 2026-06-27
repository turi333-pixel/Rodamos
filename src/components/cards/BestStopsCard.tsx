"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { BestStop } from "@/types";
import { formatDistance } from "@/lib/utils";

const STOP_CFG: Record<BestStop["type"], { emoji: string; color: string; label: string }> = {
  cafe:        { emoji: "☕", color: "#f59e0b", label: "Café" },
  restaurante: { emoji: "🍽️", color: "#10b981", label: "Restaurante" },
  mirador:     { emoji: "👁️", color: "#3385ff", label: "Mirador" },
  combustible: { emoji: "⛽", color: "#f97316", label: "Gasolinera" },
  "moto-cafe": { emoji: "🏍️", color: "#8b5cf6", label: "Moto Café" },
  foto:        { emoji: "📸", color: "#ec4899", label: "Foto" },
  descanso:    { emoji: "🛋️", color: "#14b8a6", label: "Descanso" },
};

export function BestStopsCard({ stops }: { stops: BestStop[] }) {
  return (
    <CardShell theme="stops" icon="📍" title="Mejores Paradas" subtitle={`${stops.length} seleccionadas por la IA`} delay={0.35}>
      <div className="space-y-3">
        {stops.map((stop, i) => {
          const cfg = STOP_CFG[stop.type];
          return (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Coloured top strip */}
              <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${cfg.color}00, ${cfg.color}, ${cfg.color}00)` }} />

              <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}28` }}>
                  {cfg.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-bold text-white">{stop.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xs px-1.5 py-0.5 rounded-lg font-medium"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star size={10} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                          <span className="text-2xs" style={{ color: "rgba(148,163,184,0.7)" }}>{stop.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: cfg.color }}>km {stop.distanceFromStart}</p>
                      <p className="text-2xs" style={{ color: "rgba(148,163,184,0.5)" }}>{formatDistance(stop.distanceRemaining)} rest.</p>
                    </div>
                  </div>

                  <p className="text-xs leading-snug mb-2" style={{ color: "rgba(148,163,184,0.75)" }}>
                    {stop.description}
                  </p>

                  {/* AI reason */}
                  <div className="flex items-start gap-1.5 p-2 rounded-xl"
                    style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}18` }}>
                    <span style={{ color: cfg.color }} className="text-xs flex-shrink-0 mt-0.5">✦</span>
                    <p className="text-2xs leading-snug" style={{ color: "rgba(148,163,184,0.65)" }}>{stop.why}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardShell>
  );
}
