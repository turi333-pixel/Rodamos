"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl shimmer" />
        <div className="flex-1">
          <div className="h-3.5 w-24 rounded-full shimmer mb-2" />
          <div className="h-2.5 w-16 rounded-full shimmer" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded-full shimmer" />
        <div className="h-3 w-4/5 rounded-full shimmer" />
        <div className="h-3 w-3/5 rounded-full shimmer" />
      </div>
    </div>
  );
}

const STEPS = [
  { emoji: "🌤️", label: "Consultando el clima",          color: "#0ea5e9", delay: 0 },
  { emoji: "🛣️", label: "Analizando la ruta",            color: "#f59e0b", delay: 0.7 },
  { emoji: "🏍️", label: "Evaluando condiciones",         color: "#8b5cf6", delay: 1.4 },
  { emoji: "🎒", label: "Preparando tu equipamiento",     color: "#10b981", delay: 2.1 },
  { emoji: "🤖", label: "Generando recomendaciones IA",  color: "#6366f1", delay: 2.8 },
];

export function AnalysisLoader() {
  const { routeInput } = useAppStore();
  const dest = routeInput.destination?.name ?? "tu destino";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80dvh] px-6 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,#3385ff,transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
        />
      </div>

      {/* Motorcycle animation */}
      <div className="relative w-full h-24 mb-8 overflow-hidden">
        {/* Road line */}
        <div className="absolute bottom-6 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(51,133,255,0.3),transparent)" }} />
        {/* Dashes */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-4 flex gap-6"
          style={{ width: "200%" }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-0.5 w-8 rounded-full flex-shrink-0"
              style={{ background: "rgba(51,133,255,0.2)" }} />
          ))}
        </motion.div>
        {/* Bike */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-5xl"
          style={{ filter: "drop-shadow(0 4px 16px rgba(51,133,255,0.5))" }}
        >
          🏍️
        </motion.div>
        {/* Speed lines */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 rounded-full"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(51,133,255,0.4),transparent)",
              width: `${40 + i * 15}px`,
              bottom: `${18 + i * 5}px`,
              right: `calc(50% + ${48 + i * 4}px)`,
            }}
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Destination */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
          Analizando ruta a
        </p>
        <h2 className="text-2xl font-bold text-white">{dest}</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.55)" }}>
          La IA está preparando tu informe completo
        </p>
      </motion.div>

      {/* Steps */}
      <div className="w-full max-w-xs space-y-3 mb-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            {/* Icon with pulse */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: step.delay + 0.15, type: "spring", stiffness: 400 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: `${step.color}18`, border: `1px solid ${step.color}30` }}
            >
              {step.emoji}
            </motion.div>

            {/* Label + animated underline */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm" style={{ color: "rgba(210,210,220,0.85)" }}>{step.label}</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: step.delay + 0.5 }}
                >
                  <AnimatePresence>
                    <motion.span
                      key={`check-${i}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: step.delay + 0.5, type: "spring" }}
                      className="text-xs"
                      style={{ color: step.color }}
                    >
                      ✓
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: step.color }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: step.delay, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-2xs" style={{ color: "rgba(148,163,184,0.45)" }}>Progreso</p>
          <motion.p
            className="text-2xs font-bold"
            style={{ color: "#3385ff" }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Procesando...
          </motion.p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#3385ff,#8b5cf6,#10b981)" }}
            initial={{ width: "0%" }}
            animate={{ width: "92%" }}
            transition={{ duration: STEPS.length * 0.7 + 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 24, color = "#3385ff" }: { size?: number; color?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
      }}
    />
  );
}
