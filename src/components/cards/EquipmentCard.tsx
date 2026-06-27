"use client";
import { motion } from "framer-motion";
import { CardShell } from "@/components/ui/CardShell";
import type { EquipmentAdvice } from "@/types";

const SECTIONS = [
  { key: "essential",   label: "Imprescindible",   color: "#ef4444", glow: "rgba(239,68,68,0.3)",   emoji: "🔴" },
  { key: "recommended", label: "Muy recomendado",  color: "#f97316", glow: "rgba(249,115,22,0.3)",  emoji: "🟠" },
  { key: "optional",    label: "Opcional",          color: "#3385ff", glow: "rgba(51,133,255,0.3)",  emoji: "🔵" },
  { key: "doNotForget", label: "No te olvides",    color: "#d946ef", glow: "rgba(217,70,239,0.3)",  emoji: "💜" },
] as const;

export function EquipmentCard({ equipment }: { equipment: EquipmentAdvice }) {
  return (
    <CardShell theme="equipment" icon="🎒" title="Consejero de Equipamiento" subtitle="Lo que necesitas para este viaje" delay={0.48}>
      <div className="space-y-4">
        {SECTIONS.map((s, si) => {
          const items = equipment[s.key];
          if (!items?.length) return null;
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: `${s.color}15` }}>{s.emoji}</div>
                <p className="text-2xs font-bold uppercase tracking-widest" style={{ color: s.color }}>
                  {s.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: si * 0.05 + i * 0.03 }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{
                      background: `${s.color}0d`,
                      border: `1px solid ${s.color}28`,
                      color: s.color,
                    }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
