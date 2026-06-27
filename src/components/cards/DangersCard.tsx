"use client";
import { motion } from "framer-motion";
import { CardShell } from "@/components/ui/CardShell";
import type { Danger } from "@/types";

const SEV = {
  info:     { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",   border: "rgba(56,189,248,0.22)",   label: "Info" },
  warning:  { color: "#f97316", bg: "rgba(249,115,22,0.08)",   border: "rgba(249,115,22,0.25)",   label: "Precaución" },
  danger:   { color: "#ef4444", bg: "rgba(239,68,68,0.10)",    border: "rgba(239,68,68,0.28)",    label: "Peligro" },
  critical: { color: "#dc2626", bg: "rgba(220,38,38,0.13)",    border: "rgba(220,38,38,0.35)",    label: "Crítico" },
};
const ORDER = { critical: 0, danger: 1, warning: 2, info: 3 };

export function DangersCard({ dangers }: { dangers: Danger[] }) {
  const sorted = [...dangers].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  if (dangers.length === 0) {
    return (
      <CardShell theme="dangers" icon="✅" title="Sin Peligros" subtitle="Ruta despejada" delay={0.3}>
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
            style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.25)" }}>🟢</div>
          <p className="text-sm text-center" style={{ color: "rgba(148,163,184,0.7)" }}>
            No se identificaron peligros significativos.
          </p>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell
      theme="dangers"
      icon="⚠️"
      title="Peligros y Alertas"
      subtitle={`${dangers.length} riesgo${dangers.length !== 1 ? "s" : ""} identificado${dangers.length !== 1 ? "s" : ""}`}
      delay={0.3}
      badge={
        <span className="px-2.5 py-1 rounded-xl text-2xs font-bold"
          style={{ background: SEV[sorted[0].severity].bg, border: `1px solid ${SEV[sorted[0].severity].border}`, color: SEV[sorted[0].severity].color }}>
          {SEV[sorted[0].severity].label}
        </span>
      }
    >
      <div className="space-y-3">
        {sorted.map((d, i) => {
          const s = SEV[d.severity];
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="rounded-2xl overflow-hidden"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${s.color}15`, boxShadow: `0 0 12px ${s.color}30` }}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{d.title}</p>
                    {d.km != null && (
                      <span className="text-2xs px-1.5 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.7)" }}>
                        km {d.km}
                      </span>
                    )}
                  </div>
                  <span className="text-2xs font-bold uppercase tracking-wide" style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2">
                <p className="text-sm leading-snug" style={{ color: "rgba(210,210,220,0.85)" }}>{d.description}</p>
                <div className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
                  <span className="text-xs">💡</span>
                  <p className="text-xs leading-snug" style={{ color: "rgba(148,163,184,0.75)" }}>{d.advice}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </CardShell>
  );
}
