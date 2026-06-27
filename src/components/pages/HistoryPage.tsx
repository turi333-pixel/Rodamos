"use client";
import { motion } from "framer-motion";
import { Star, MapPin, Calendar, Trash2 } from "lucide-react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/Navigation";
import { scoreToColor, scoreToLabel, formatDistance } from "@/lib/utils";

export function HistoryPage() {
  const { history, toggleFavorite, setView, setAnalysisResult, setAnalysisStatus } = useAppStore();

  const handleOpen = (id: string) => {
    const route = history.find((h) => h.id === id);
    if (route?.analysis) {
      setAnalysisResult(route.analysis);
      setAnalysisStatus("complete");
      setView("analyze");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-dvh"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0d0d1a 0%,#06060d 100%)" }} />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }} />
      </div>

      <TopBar
        title="Historial de Rutas"
        subtitle={`${history.length} viaje${history.length !== 1 ? "s" : ""}`}
      />

      <div className="relative flex-1 px-4 py-4 pb-32 space-y-3">
        {history.length === 0 ? (
          <EmptyHistory />
        ) : (
          history.map((route, i) => {
            const score = route.analysis?.overallScore;
            const c = score != null ? scoreToColor(score) : "#94a3b8";
            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {score != null && (
                  <div className="h-0.5" style={{
                    background: `linear-gradient(90deg,${c}00,${c},${c}00)`,
                  }} />
                )}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${c}12`, border: `1px solid ${c}28` }}>
                    <MapPin size={16} style={{ color: c }} />
                  </div>
                  <button onClick={() => handleOpen(route.id)} className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {route.route.destination.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} style={{ color: "rgba(148,163,184,0.5)" }} />
                        <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                          {new Intl.DateTimeFormat("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                          }).format(new Date(route.createdAt))}
                        </p>
                      </div>
                      {score != null && (
                        <>
                          <span className="text-xs font-bold" style={{ color: c }}>{score}/100</span>
                          <span className="text-2xs px-1.5 py-0.5 rounded-lg font-medium"
                            style={{ background: `${c}14`, color: c }}>
                            {scoreToLabel(score)}
                          </span>
                        </>
                      )}
                    </div>
                    {route.analysis && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-2xs" style={{ color: "rgba(148,163,184,0.45)" }}>
                          {formatDistance(route.analysis.summary.distance)}
                        </span>
                        <span className="text-2xs" style={{ color: "rgba(148,163,184,0.45)" }}>
                          {route.analysis.summary.duration}
                        </span>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => toggleFavorite(route.id)}
                    className="p-2 rounded-xl press-effect flex-shrink-0"
                    style={{ background: route.isFavorite ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.05)" }}
                  >
                    <Star
                      size={16}
                      style={{
                        color: route.isFavorite ? "#fbbf24" : "rgba(148,163,184,0.4)",
                        fill: route.isFavorite ? "#fbbf24" : "none",
                      }}
                    />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.20)" }}>
        📋
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">Sin historial</h3>
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Analiza tu primera ruta para verla aquí
        </p>
      </div>
    </div>
  );
}
