"use client";
import { motion } from "framer-motion";
import { Clock, Route, Sunrise, Sunset, Fuel, Mountain } from "lucide-react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import type { AnalysisResult } from "@/types";
import { scoreToColor, scoreToLabel, formatDistance } from "@/lib/utils";

interface ScoreCardProps { result: AnalysisResult }

function scoreGradient(s: number) {
  if (s >= 85) return "linear-gradient(135deg, #00d97e 0%, #00a85a 100%)";
  if (s >= 70) return "linear-gradient(135deg, #3385ff 0%, #0052a3 100%)";
  if (s >= 50) return "linear-gradient(135deg, #ff9500 0%, #cc7600 100%)";
  return "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)";
}
function scoreGlow(s: number) {
  if (s >= 85) return "rgba(0,217,126,0.35)";
  if (s >= 70) return "rgba(51,133,255,0.35)";
  if (s >= 50) return "rgba(255,149,0,0.35)";
  return "rgba(255,68,68,0.35)";
}

export function ScoreCard({ result }: ScoreCardProps) {
  const score = result.overallScore;
  const color = scoreToColor(score);
  const label = scoreToLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: `0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      {/* Coloured glow behind the ring */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 20%, ${scoreGlow(score)} 0%, transparent 65%)` }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
        style={{ background: scoreGradient(score), boxShadow: `0 0 12px ${color}` }} />

      {/* Noise texture */}
      <div className="absolute inset-0 noise pointer-events-none" />

      <div className="relative p-6">
        {/* Score ring centred */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full animate-breathe pointer-events-none"
              style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, transform: "scale(1.3)", filter: "blur(12px)" }} />
            <ScoreRing score={score} size={168} strokeWidth={11} animated />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="text-center mt-4"
          >
            {/* Rating pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-2"
              style={{ background: scoreGradient(score), boxShadow: `0 4px 16px ${scoreGlow(score)}` }}>
              <span className="text-sm font-bold text-white">{label}</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[240px] text-center" style={{ color: "rgba(200,200,210,0.8)" }}>
              {result.recommendation}
            </p>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatTile icon={<Route size={13} />}     label="Distancia"  value={formatDistance(result.summary.distance)} accent="#3385ff" />
          <StatTile icon={<Clock size={13} />}     label="Duración"   value={result.summary.duration}                 accent="#8b5cf6" />
          <StatTile icon={<Sunrise size={13} />}   label="Amanecer"   value={result.summary.sunrise}                  accent="#f59e0b" />
          <StatTile icon={<Sunset size={13} />}    label="Atardecer"  value={result.summary.sunset}                   accent="#f97316" />
          <StatTile icon={<Fuel size={13} />}      label="Combustible" value={`${result.summary.fuelStops} parada${result.summary.fuelStops !== 1 ? "s" : ""}`} accent="#14b8a6" />
          <StatTile
            icon={<Mountain size={13} />}
            label="Dificultad"
            value={result.summary.difficulty}
            accent={
              result.summary.difficulty === "Extremo"  ? "#ff4444" :
              result.summary.difficulty === "Exigente" ? "#ff9500" :
              result.summary.difficulty === "Moderado" ? "#3385ff" : "#00d97e"
            }
          />
        </div>

        {/* AI tip */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.4)" }}>
            <span className="text-sm">💡</span>
          </div>
          <p className="text-sm leading-snug" style={{ color: "rgba(210,210,220,0.85)" }}>
            {result.summary.recommendation}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-2xl"
      style={{ background: `${accent}0c`, border: `1px solid ${accent}22` }}>
      <div className="flex-shrink-0" style={{ color: accent }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xs truncate" style={{ color: "rgba(161,161,171,0.6)" }}>{label}</p>
        <p className="text-sm font-bold truncate" style={{ color: accent }}>{value}</p>
      </div>
    </div>
  );
}
