"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { MotorcyclePreparation, ChecklistItem } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY = {
  esencial:    { color: "#ef4444", glow: "rgba(239,68,68,0.3)",   label: "Esencial",     dot: "#ef4444" },
  recomendado: { color: "#f97316", glow: "rgba(249,115,22,0.3)",  label: "Recomendado",  dot: "#f97316" },
  opcional:    { color: "#3385ff", glow: "rgba(51,133,255,0.3)",  label: "Opcional",     dot: "#3385ff" },
};

export function MotoPrepCard({ prep }: { prep: MotorcyclePreparation }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(item) ? n.delete(item) : n.add(item);
      return n;
    });
  };

  const total    = prep.checklist.length;
  const done     = checked.size;
  const progress = total > 0 ? (done / total) * 100 : 0;

  const grouped = {
    esencial:    prep.checklist.filter((c) => c.priority === "esencial"),
    recomendado: prep.checklist.filter((c) => c.priority === "recomendado"),
    opcional:    prep.checklist.filter((c) => c.priority === "opcional"),
  };

  return (
    <CardShell
      theme="moto"
      icon="🔧"
      title="Preparación de la Moto"
      subtitle={prep.summary}
      delay={0.25}
      badge={
        <span className="text-sm font-bold" style={{ color: progress === 100 ? "#00d97e" : "#6ee7b7" }}>
          {done}/{total}
        </span>
      }
    >
      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: progress === 100
                ? "linear-gradient(90deg,#00d97e,#10b981)"
                : "linear-gradient(90deg,#6ee7b7,#10b981)",
              boxShadow: progress === 100 ? "0 0 10px rgba(0,217,126,0.5)" : undefined,
            }}
          />
        </div>
        {progress === 100 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-1.5 text-center font-medium"
            style={{ color: "#00d97e" }}
          >
            ✓ Lista de verificación completa
          </motion.p>
        )}
      </div>

      {/* Checklist by priority */}
      {(Object.entries(grouped) as [keyof typeof grouped, ChecklistItem[]][]).map(([priority, items]) => {
        if (items.length === 0) return null;
        const p = PRIORITY[priority];
        return (
          <div key={priority} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p.dot, boxShadow: `0 0 6px ${p.glow}` }} />
              <p className="text-2xs font-bold uppercase tracking-widest" style={{ color: p.color }}>
                {p.label}
              </p>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const isChecked = checked.has(item.item);
                return (
                  <button
                    key={item.item}
                    onClick={() => toggle(item.item)}
                    className="w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-150 text-left"
                    style={{
                      background: isChecked ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isChecked ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
                    )}
                      style={{
                        background: isChecked ? "#10b981" : "rgba(255,255,255,0.07)",
                        border: isChecked ? "none" : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: isChecked ? "0 0 10px rgba(16,185,129,0.5)" : undefined,
                      }}>
                      <AnimatePresence>
                        {isChecked && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium")} style={{ color: isChecked ? "rgba(148,163,184,0.45)" : "white" }}>
                        {isChecked ? <s>{item.item}</s> : item.item}
                      </p>
                      {item.note && (
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(148,163,184,0.55)" }}>
                          {item.note}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Adjustments */}
      {prep.adjustments.length > 0 && (
        <div className="mt-4 p-3.5 rounded-2xl"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(110,231,183,0.6)" }}>
            Ajustes recomendados
          </p>
          <ul className="space-y-1.5">
            {prep.adjustments.map((adj, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(210,210,220,0.8)" }}>
                <span style={{ color: "#6ee7b7" }} className="mt-0.5">→</span>
                {adj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  );
}
