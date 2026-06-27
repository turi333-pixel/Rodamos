"use client";
import { CardShell } from "@/components/ui/CardShell";
import type { RiderPreparation } from "@/types";

const VIOLET = "#8b5cf6";

const gearRows = (prep: RiderPreparation) => [
  { emoji: "🪖", label: "Visera",       value: prep.helmetVisor },
  { emoji: "👕", label: "Capa base",    value: prep.baseLayer },
  { emoji: "🧥", label: "Chaqueta",     value: prep.jacket },
  { emoji: "🧤", label: "Guantes",      value: prep.gloves },
  { emoji: "🥾", label: "Botas",        value: prep.boots },
  { emoji: "💧", label: "Hidratación",  value: prep.hydration },
];

const toggleItems = (prep: RiderPreparation) => [
  { emoji: "🌧️", label: "Traje de agua",   on: prep.rainSuit },
  { emoji: "🧣", label: "Cuello/Buff",     on: prep.neckWarmer },
  { emoji: "🌬️", label: "Chaleco fresco",  on: prep.coolingVest },
  { emoji: "🛡️", label: "Impermeables",    on: prep.waterproofs },
];

export function RiderPrepCard({ prep }: { prep: RiderPreparation }) {
  const active   = toggleItems(prep).filter((t) => t.on);
  const inactive = toggleItems(prep).filter((t) => !t.on);

  return (
    <CardShell theme="rider" icon="🏍️" title="Equipamiento del Piloto" subtitle="Qué llevar hoy" delay={0.2}>
      {/* Summary */}
      <div className="p-3.5 rounded-2xl mb-4"
        style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.20)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(210,200,255,0.9)" }}>{prep.summary}</p>
      </div>

      {/* Gear list */}
      <div className="space-y-2.5 mb-4">
        {gearRows(prep).map((row) => (
          <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-lg w-7 flex-shrink-0">{row.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-2xs mb-0.5" style={{ color: "rgba(139,92,246,0.75)" }}>{row.label}</p>
              <p className="text-sm leading-snug" style={{ color: "rgba(220,210,255,0.9)" }}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kit chips */}
      <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
        Equipamiento adicional
      </p>
      <div className="flex flex-wrap gap-2">
        {active.map((t) => (
          <div key={t.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
            <span className="text-sm">{t.emoji}</span>
            <span className="text-xs font-medium">{t.label}</span>
          </div>
        ))}
        {inactive.map((t) => (
          <div key={t.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(148,163,184,0.4)" }}>
            <span className="text-sm opacity-40">{t.emoji}</span>
            <span className="text-xs line-through">{t.label}</span>
          </div>
        ))}
      </div>

      {prep.tyrePressureNote && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }}>
          <span className="text-sm">⚠️</span>
          <p className="text-xs" style={{ color: "rgba(210,210,220,0.85)" }}>{prep.tyrePressureNote}</p>
        </div>
      )}
    </CardShell>
  );
}
