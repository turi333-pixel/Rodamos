"use client";
import { motion } from "framer-motion";
import { Star, MapPin, Compass } from "lucide-react";
import { useAppStore } from "@/store";
import { TopBar } from "@/components/layout/Navigation";
import { scoreToColor, scoreToLabel } from "@/lib/utils";

export function FavoritesPage() {
  const { favorites, toggleFavorite, setView, setAnalysisResult, setAnalysisStatus } = useAppStore();

  const handleOpen = (id: string) => {
    const route = favorites.find((f) => f.id === id);
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
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-12"
          style={{ background: "radial-gradient(circle,#fbbf24,transparent 70%)" }} />
      </div>

      <TopBar
        title="Rutas Favoritas"
        subtitle={`${favorites.length} guardada${favorites.length !== 1 ? "s" : ""}`}
      />

      <div className="relative flex-1 px-4 py-4 pb-32 space-y-3">
        {favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          favorites.map((route, i) => {
            const score = route.analysis?.overallScore;
            const c = score != null ? scoreToColor(score) : "#fbbf24";
            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,rgba(251,191,36,0.06) 0%,rgba(10,10,20,0.7) 100%)",
                  border: "1px solid rgba(251,191,36,0.15)",
                }}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)" }}>
                    <Star size={16} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                  </div>

                  <button onClick={() => handleOpen(route.id)} className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {route.route.destination.name}
                    </p>
                    {route.analysis && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold" style={{ color: c }}>{score}/100</span>
                        <span className="text-2xs px-1.5 py-0.5 rounded-lg"
                          style={{ background: `${c}15`, color: c }}>
                          {scoreToLabel(score!)}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                          {route.analysis.overallRating}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={9} style={{ color: "rgba(148,163,184,0.4)" }} />
                      <p className="text-xs truncate" style={{ color: "rgba(148,163,184,0.45)" }}>
                        {route.route.destination.address ?? route.route.destination.name}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpen(route.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
                      style={{ background: "rgba(51,133,255,0.12)", border: "1px solid rgba(51,133,255,0.22)" }}
                    >
                      <Compass size={14} style={{ color: "#3385ff" }} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(route.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
                      style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.20)" }}
                    >
                      <Star size={14} fill="#fbbf24" style={{ color: "#fbbf24" }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.22)" }}
      >
        <Star size={36} fill="#fbbf24" style={{ color: "#fbbf24" }} />
      </motion.div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">Sin favoritos</h3>
        <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
          Marca rutas con ⭐ desde el historial
        </p>
      </div>
    </div>
  );
}
