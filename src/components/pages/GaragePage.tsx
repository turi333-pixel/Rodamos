"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Fuel, ChevronRight, Wrench, X } from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { TopBar } from "@/components/layout/Navigation";
import type { Motorcycle } from "@/types";
import { generateId } from "@/lib/utils";

const MOTO_COLORS = ["#3385ff", "#10b981", "#f97316", "#8b5cf6", "#ef4444", "#fbbf24", "#06b6d4", "#d946ef"];

export function GaragePage() {
  const { motorcycles, activeMotorcycleId, setActiveMotorcycle, addMotorcycle } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    nickname: "", brand: "", model: "",
    year: new Date().getFullYear(), engineCC: 0,
    color: "#3385ff", fuelCapacity: 18, consumption: 5.5,
  });

  const handleAdd = () => {
    if (!form.nickname || !form.brand || !form.model) return;
    const moto: Motorcycle = {
      id: generateId(),
      userId: "local",
      ...form,
      plateNumber: "",
      tyreFront: { size: "120/70 ZR17", km: 0, pressureCold: 2.5 },
      tyreRear:  { size: "180/55 ZR17", km: 0, pressureCold: 2.9 },
      serviceRecords: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addMotorcycle(moto);
    setShowAdd(false);
    setForm({ nickname: "", brand: "", model: "", year: new Date().getFullYear(), engineCC: 0, color: "#3385ff", fuelCapacity: 18, consumption: 5.5 });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-dvh">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0d0d1a 0%,#06060d 100%)" }} />
        <div className="absolute bottom-40 -left-20 w-72 h-72 rounded-full blur-3xl opacity-12"
          style={{ background: "radial-gradient(circle,#10b981,transparent 70%)" }} />
      </div>

      <TopBar
        title="Mi Garage"
        subtitle={`${motorcycles.length} moto${motorcycles.length !== 1 ? "s" : ""}`}
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
            style={{ background: "linear-gradient(135deg,#3385ff,#0066cc)", boxShadow: "0 3px 12px rgba(51,133,255,0.4)" }}
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      <div className="relative flex-1 px-4 py-4 pb-32 space-y-4">
        {motorcycles.length === 0 ? (
          <EmptyGarage onAdd={() => setShowAdd(true)} />
        ) : (
          motorcycles.map((moto, i) => (
            <MotoCard
              key={moto.id}
              moto={moto}
              active={moto.id === activeMotorcycleId}
              onSelect={() => setActiveMotorcycle(moto.id)}
              index={i}
            />
          ))
        )}
      </div>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 safe-bottom rounded-t-3xl p-6 pb-8"
              style={{
                background: "rgba(14,14,26,0.97)",
                backdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderBottom: "none",
                boxShadow: "0 -20px 80px rgba(0,0,0,0.7)",
              }}
            >
              {/* Sheet handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.15)" }} />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Añadir moto</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl flex items-center justify-center press-effect"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <X size={16} style={{ color: "rgba(148,163,184,0.7)" }} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Text fields */}
                {[
                  { key: "nickname", placeholder: "La Bestia, Mi GS...", label: "Apodo" },
                  { key: "brand",    placeholder: "BMW, Honda, KTM...",  label: "Marca" },
                  { key: "model",    placeholder: "R1250GS, CB650R...",  label: "Modelo" },
                ].map((f) => (
                  <div key={f.key}>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>{f.label}</p>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={(form as Record<string, unknown>)[f.key] as string}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-zinc-600"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                    />
                  </div>
                ))}

                {/* Year + CC */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "year", label: "Año", type: "number", placeholder: "2024" },
                    { key: "engineCC", label: "Cilindrada (cc)", type: "number", placeholder: "1250" },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs mb-1.5 font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>{f.label}</p>
                      <input
                        type="number"
                        placeholder={f.placeholder}
                        value={(form as Record<string, unknown>)[f.key] as number || ""}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: +e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-zinc-600"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                      />
                    </div>
                  ))}
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-xs mb-2 font-medium" style={{ color: "rgba(148,163,184,0.6)" }}>Color</p>
                  <div className="flex gap-2">
                    {MOTO_COLORS.map((c) => (
                      <button key={c} onClick={() => setForm((p) => ({ ...p, color: c }))}
                        className="w-8 h-8 rounded-full transition-transform press-effect"
                        style={{
                          background: c,
                          boxShadow: form.color === c ? `0 0 0 2px white, 0 0 12px ${c}` : undefined,
                          transform: form.color === c ? "scale(1.2)" : undefined,
                        }} />
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAdd}
                  disabled={!form.nickname || !form.brand || !form.model}
                >
                  Añadir al Garage
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MotoCard({ moto, active, onSelect, index }: { moto: Motorcycle; active: boolean; onSelect: () => void; index: number }) {
  const c = moto.color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: active
          ? `linear-gradient(160deg,${c}14 0%,rgba(10,10,20,0.85) 100%)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? c + "35" : "rgba(255,255,255,0.08)"}`,
        boxShadow: active ? `0 4px 24px ${c}20` : undefined,
      }}
    >
      {/* Accent line */}
      {active && (
        <div className="h-0.5" style={{ background: `linear-gradient(90deg,${c}00,${c},${c}00)` }} />
      )}

      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: `${c}15`, border: `1px solid ${c}30` }}>
            🏍️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-white truncate">{moto.nickname}</p>
              {active && (
                <span className="text-2xs px-1.5 py-0.5 rounded-md font-semibold"
                  style={{ background: `${c}20`, color: c }}>
                  Activa
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: "rgba(148,163,184,0.7)" }}>
              {moto.brand} {moto.model} {moto.year}
            </p>
            {moto.engineCC > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>{moto.engineCC}cc</p>
            )}
          </div>
          <button
            onClick={onSelect}
            className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
            style={{ background: active ? `${c}18` : "rgba(255,255,255,0.06)", border: `1px solid ${active ? c + "30" : "rgba(255,255,255,0.08)"}` }}
          >
            <ChevronRight size={16} style={{ color: active ? c : "rgba(148,163,184,0.5)" }} />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: "⛽", label: "Depósito",  value: `${moto.fuelCapacity}L` },
            { icon: "📊", label: "Consumo",   value: `${moto.consumption}L/100` },
            { icon: "🔧", label: "Servicios", value: `${moto.serviceRecords.length}` },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-2.5 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-base mb-1">{s.icon}</span>
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-2xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tyres */}
        <div className="mt-3 p-3.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-2xs uppercase tracking-widest mb-2.5" style={{ color: "rgba(148,163,184,0.45)" }}>Neumáticos</p>
          <div className="flex gap-4">
            <div>
              <p className="text-2xs mb-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>Delantero</p>
              <p className="text-xs font-medium text-white">{moto.tyreFront.size}</p>
              <p className="text-2xs mt-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>{moto.tyreFront.pressureCold} bar</p>
            </div>
            <div className="w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div>
              <p className="text-2xs mb-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>Trasero</p>
              <p className="text-xs font-medium text-white">{moto.tyreRear.size}</p>
              <p className="text-2xs mt-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>{moto.tyreRear.pressureCold} bar</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyGarage({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
        style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)" }}
      >
        🏍️
      </motion.div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Garage vacío</h3>
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Añade tu primera moto para personalizar los análisis
        </p>
      </div>
      <Button variant="primary" icon={<Plus size={18} />} onClick={onAdd}>
        Añadir mi moto
      </Button>
    </div>
  );
}
