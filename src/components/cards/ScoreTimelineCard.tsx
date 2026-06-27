"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { ScoreTimelineEntry } from "@/types";
import { scoreToColor } from "@/lib/utils";

export function ScoreTimelineCard({ timeline }: { timeline: ScoreTimelineEntry[] }) {
  const max = Math.max(...timeline.map((t) => t.score));

  return (
    <CardShell theme="timeline" icon="⏱️" title="Evolución del Viaje" subtitle="Puntuación hora a hora" delay={0.4}>

      {/* SVG sparkline */}
      <div className="relative h-24 mb-4 rounded-2xl overflow-hidden"
        style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.12)" }}>
        <svg className="w-full h-full" viewBox={`0 0 ${Math.max(1, timeline.length - 1) * 60 + 60} 96`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="tl-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="tl-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[30, 50, 70].map((pct) => (
            <line key={pct}
              x1={0} y1={96 - pct * 0.9}
              x2={timeline.length * 60} y2={96 - pct * 0.9}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}

          {timeline.length > 1 && (
            <>
              {/* Fill */}
              <path
                fill="url(#tl-fill)"
                d={[
                  `M 30 ${96 - timeline[0].score * 0.82}`,
                  ...timeline.slice(1).map((t, i) => `L ${(i + 1) * 60 + 30} ${96 - t.score * 0.82}`),
                  `L ${(timeline.length - 1) * 60 + 30} 96`, "L 30 96", "Z",
                ].join(" ")}
              />
              {/* Stroke */}
              <path
                fill="none"
                stroke="url(#tl-stroke)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                d={[
                  `M 30 ${96 - timeline[0].score * 0.82}`,
                  ...timeline.slice(1).map((t, i) => `L ${(i + 1) * 60 + 30} ${96 - t.score * 0.82}`),
                ].join(" ")}
              />
            </>
          )}

          {/* Dots */}
          {timeline.map((entry, i) => {
            const x = i * 60 + 30;
            const y = 96 - entry.score * 0.82;
            const c = scoreToColor(entry.score);
            return (
              <g key={entry.time}>
                <circle cx={x} cy={y} r={entry.score === max ? 6 : 4} fill={c} stroke="#0a0a12" strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {timeline.map((entry, i) => {
          const color = scoreToColor(entry.score);
          const Icon = entry.trend === "up" ? TrendingUp : entry.trend === "down" ? TrendingDown : Minus;
          const isFirst = i === 0;
          return (
            <motion.div
              key={entry.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{
                background: isFirst ? "rgba(6,182,212,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isFirst ? "rgba(6,182,212,0.22)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span className="text-sm font-bold tabular-nums w-12 flex-shrink-0" style={{ color: "rgba(148,163,184,0.7)" }}>
                {entry.time}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "rgba(148,163,184,0.65)" }}>{entry.label}</span>
                  <div className="flex items-center gap-1">
                    <Icon size={11} style={{ color }} />
                    <span className="text-sm font-bold" style={{ color, textShadow: `0 0 8px ${color}60` }}>{entry.score}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{
                    width: `${entry.score}%`,
                    background: color,
                    boxShadow: `0 0 6px ${color}80`,
                  }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardShell>
  );
}
