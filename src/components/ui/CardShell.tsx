"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardTheme {
  gradient:  string;        // header icon bg
  glow:      string;        // rgba glow colour
  accent:    string;        // top-line & highlight
  textLight: string;        // label text colour
  bg:        string;        // faint tinted card bg
  border:    string;        // border rgba
}

// ─── Signature themes per section ────────────────────────────────────────────

export const THEMES = {
  weather:   { gradient: "linear-gradient(135deg,#38bdf8,#0ea5e9)",  glow: "rgba(14,165,233,0.20)",  accent: "#0ea5e9", textLight: "#7dd3fc", bg: "rgba(14,165,233,0.05)",  border: "rgba(14,165,233,0.15)" },
  road:      { gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)",  glow: "rgba(245,158,11,0.20)",  accent: "#f59e0b", textLight: "#fde68a", bg: "rgba(245,158,11,0.05)",  border: "rgba(245,158,11,0.15)" },
  rider:     { gradient: "linear-gradient(135deg,#c4b5fd,#8b5cf6)",  glow: "rgba(139,92,246,0.20)",  accent: "#8b5cf6", textLight: "#c4b5fd", bg: "rgba(139,92,246,0.05)",  border: "rgba(139,92,246,0.15)" },
  moto:      { gradient: "linear-gradient(135deg,#6ee7b7,#10b981)",  glow: "rgba(16,185,129,0.20)",  accent: "#10b981", textLight: "#6ee7b7", bg: "rgba(16,185,129,0.05)",  border: "rgba(16,185,129,0.15)" },
  route:     { gradient: "linear-gradient(135deg,#5eead4,#14b8a6)",  glow: "rgba(20,184,166,0.20)",  accent: "#14b8a6", textLight: "#99f6e4", bg: "rgba(20,184,166,0.05)",  border: "rgba(20,184,166,0.15)" },
  stops:     { gradient: "linear-gradient(135deg,#fcd34d,#f59e0b)",  glow: "rgba(252,211,77,0.20)",  accent: "#fbbf24", textLight: "#fef3c7", bg: "rgba(252,211,77,0.05)",  border: "rgba(252,211,77,0.15)" },
  dangers:   { gradient: "linear-gradient(135deg,#fca5a5,#ef4444)",  glow: "rgba(239,68,68,0.22)",   accent: "#ef4444", textLight: "#fca5a5", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.18)" },
  ai:        { gradient: "linear-gradient(135deg,#818cf8,#6366f1)",  glow: "rgba(99,102,241,0.20)",  accent: "#6366f1", textLight: "#c7d2fe", bg: "rgba(99,102,241,0.05)",  border: "rgba(99,102,241,0.15)" },
  equipment: { gradient: "linear-gradient(135deg,#f0abfc,#d946ef)",  glow: "rgba(217,70,239,0.20)",  accent: "#d946ef", textLight: "#f5d0fe", bg: "rgba(217,70,239,0.05)",  border: "rgba(217,70,239,0.15)" },
  fuel:      { gradient: "linear-gradient(135deg,#fdba74,#f97316)",  glow: "rgba(249,115,22,0.20)",  accent: "#f97316", textLight: "#fed7aa", bg: "rgba(249,115,22,0.05)",  border: "rgba(249,115,22,0.15)" },
  timeline:  { gradient: "linear-gradient(135deg,#67e8f9,#06b6d4)",  glow: "rgba(6,182,212,0.20)",   accent: "#06b6d4", textLight: "#a5f3fc", bg: "rgba(6,182,212,0.05)",   border: "rgba(6,182,212,0.15)" },
  emergency: { gradient: "linear-gradient(135deg,#fca5a5,#dc2626)",  glow: "rgba(220,38,38,0.22)",   accent: "#dc2626", textLight: "#fecaca", bg: "rgba(220,38,38,0.06)",   border: "rgba(220,38,38,0.18)" },
  default:   { gradient: "linear-gradient(135deg,#60a5fa,#3385ff)",  glow: "rgba(51,133,255,0.18)",  accent: "#3385ff", textLight: "#bfdbfe", bg: "rgba(51,133,255,0.05)",  border: "rgba(51,133,255,0.14)" },
} as const;

export type ThemeKey = keyof typeof THEMES;

// ─── Shell component ──────────────────────────────────────────────────────────

interface CardShellProps {
  theme: ThemeKey;
  icon: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export function CardShell({ theme, icon, title, subtitle, badge, delay = 0, children, className }: CardShellProps) {
  const t = THEMES[theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.32, 0.72, 0, 1] }}
      className={cn("relative overflow-hidden rounded-3xl", className)}
      style={{
        background: `linear-gradient(160deg, ${t.bg} 0%, rgba(10,10,18,0.85) 100%)`,
        border: `1px solid ${t.border}`,
        boxShadow: `0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Corner glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)` }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px rounded-full"
        style={{ background: t.gradient, boxShadow: `0 0 8px ${t.accent}` }} />

      {/* Noise */}
      <div className="absolute inset-0 noise pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: t.gradient, boxShadow: `0 3px 14px ${t.glow}` }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-xs mt-0.5 truncate" style={{ color: t.textLight, opacity: 0.75 }}>{subtitle}</p>
            )}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>

        {children}
      </div>
    </motion.div>
  );
}

// ─── Inline badge helper ──────────────────────────────────────────────────────

export function ThemeBadge({ text, theme }: { text: string; theme: ThemeKey }) {
  const t = THEMES[theme];
  return (
    <span className="px-2.5 py-1 rounded-xl text-2xs font-bold"
      style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.accent }}>
      {text}
    </span>
  );
}
