"use client";
import { motion } from "framer-motion";
import { Fuel } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { FuelPlanning } from "@/types";

export function FuelPlanningCard({ fuel }: { fuel: FuelPlanning }) {
  const stats = [
    { label: "Consumo",         value: `${fuel.estimatedConsumption}L`, sub: "por 100 km", color: "#3385ff" },
    { label: "Total necesario", value: `${fuel.totalFuelNeeded.toFixed(1)}L`, sub: "total ruta", color: "#00d97e" },
    { label: "Autonomía",       value: `${fuel.range}km`,              sub: "con lleno",  color: "#8b5cf6" },
  ];

  return (
    <CardShell theme="fuel" icon="⛽" title="Planificación de Combustible" delay={0.55}>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center p-3 rounded-2xl text-center gap-0.5"
            style={{ background: `${s.color}0c`, border: `1px solid ${s.color}22` }}>
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>{s.label}</p>
            <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.45)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Premium tag */}
      <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
        style={{
          background: fuel.premiumAvailable ? "rgba(0,217,126,0.07)" : "rgba(249,115,22,0.07)",
          border: `1px solid ${fuel.premiumAvailable ? "rgba(0,217,126,0.22)" : "rgba(249,115,22,0.22)"}`,
        }}>
        <span>{fuel.premiumAvailable ? "✅" : "⚠️"}</span>
        <p className="text-xs" style={{ color: "rgba(210,210,220,0.85)" }}>
          {fuel.premiumAvailable ? "Combustible premium disponible en ruta" : "Verifica disponibilidad de premium en la zona"}
        </p>
      </div>

      {/* Fuel stops timeline */}
      {fuel.stops.length > 0 && (
        <>
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Paradas de repostaje
          </p>
          <div className="relative pl-5">
            <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: "rgba(249,115,22,0.2)" }} />
            {fuel.stops.map((stop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="relative flex items-center gap-3 mb-3 last:mb-0"
              >
                <div className="absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center z-10"
                  style={{ background: "linear-gradient(135deg,#fdba74,#f97316)", boxShadow: "0 2px 8px rgba(249,115,22,0.4)" }}>
                  <Fuel size={11} className="text-white" />
                </div>
                <div className="flex-1 flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm font-medium text-white">{stop.name ?? "Gasolinera"}</p>
                  <span className="text-sm font-bold" style={{ color: "#f97316" }}>km {stop.km}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </CardShell>
  );
}
