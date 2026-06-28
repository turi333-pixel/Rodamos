"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, RefreshCw, MapPin, Star, Copy, X, Droplets, Wind, Thermometer, Clock } from "lucide-react";
import { generateId } from "@/lib/utils";
import { useAppStore } from "@/store";
import { AnalysisLoader } from "@/components/ui/SkeletonCard";
import { ScoreCard } from "@/components/cards/ScoreCard";
import { RouteMapCard } from "@/components/cards/RouteMapCard";
import { ElevationProfileCard } from "@/components/cards/ElevationProfileCard";
import type { ElevPoint } from "@/components/cards/ElevationProfileCard";
import { WeatherCard } from "@/components/cards/WeatherCard";
import { RoadConditionsCard } from "@/components/cards/RoadConditionsCard";
import { RiderPrepCard } from "@/components/cards/RiderPrepCard";
import { MotoPrepCard } from "@/components/cards/MotoPrepCard";
import { RouteInsightsCard } from "@/components/cards/RouteInsightsCard";
import { BestStopsCard } from "@/components/cards/BestStopsCard";
import { DangersCard } from "@/components/cards/DangersCard";
import { AIRecommendationsCard } from "@/components/cards/AIRecommendationsCard";
import { EquipmentCard } from "@/components/cards/EquipmentCard";
import { FuelPlanningCard } from "@/components/cards/FuelPlanningCard";
import { EmergencyCard } from "@/components/cards/EmergencyCard";
import { Button } from "@/components/ui/Button";

export function AnalysisPage() {
  const {
    analysisStatus,
    analysisResult,
    analysisError,
    routeInput,
    setView,
    setAnalysisStatus,
    setAnalysisResult,
    setAnalysisError,
    addToHistory,
    history,
    toggleFavorite,
  } = useAppStore();

  // Find if the current result is already in history (so we can toggle its favourite)
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elevPoints, setElevPoints] = useState<ElevPoint[]>([]);
  const [elevTotalKm, setElevTotalKm] = useState(0);

  const historyEntry = history.find(
    (h) => h.route?.destination?.name === routeInput.destination?.name && h.analysis?.id === analysisResult?.id
  );

  const handleBack = () => setView("home");

  const buildShareText = () => {
    if (!analysisResult) return "";
    const dest = routeInput.destination?.name ?? "destino";
    const score = analysisResult.overallScore;
    const rating = score >= 90 ? "Condiciones perfectas" : score >= 75 ? "Muy buenas condiciones" : score >= 60 ? "Condiciones aceptables" : "Condiciones adversas";
    const w = analysisResult.weather?.data;
    const date = routeInput.date ? new Date(routeInput.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : "hoy";

    let text = `🏍️ Rodamos — Análisis de ruta\n\n`;
    text += `📍 ${dest}\n`;
    text += `📅 ${date}\n`;
    text += `⭐ Puntuación: ${score}/100 — ${rating}\n\n`;
    if (w) {
      text += `🌡️ ${w.temperature}°C · 💧 ${w.rainProbability}% lluvia · 💨 ${w.windSpeed} km/h\n`;
      if (analysisResult.weather?.bestWindow) text += `🕐 Mejor salida: ${analysisResult.weather.bestWindow}\n`;
      text += `\n`;
    }
    if (analysisResult.recommendation) {
      text += `"${analysisResult.recommendation}"\n\n`;
    }
    if (analysisResult.bestStops?.length > 0) {
      text += `📌 Paradas recomendadas: ${analysisResult.bestStops.slice(0, 2).map(s => s.name).join(", ")}\n\n`;
    }
    text += `Analizado con Rodamos 🏍️`;
    return text;
  };

  const handleShare = () => {
    if (!analysisResult) return;
    setShowShareSheet(true);
  };

  const handleNativeShare = async () => {
    const text = buildShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Rodamos — Ruta a ${routeInput.destination?.name}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled */ }
  };

  const handleCopy = async () => {
    const text = buildShareText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    if (!routeInput.destination) return;
    setAnalysisStatus("loading");
    setAnalysisError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: routeInput.destination,
          origin: routeInput.origin,
          date: routeInput.date?.toISOString() ?? new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Error al analizar");
      const data = await res.json();
      setAnalysisResult(data);
      setAnalysisStatus("complete");
      if (routeInput.destination) {
        addToHistory({
          id: generateId(),
          userId: "local",
          name: routeInput.destination.name,
          route: { destination: routeInput.destination, origin: routeInput.origin, date: routeInput.date ?? new Date() },
          analysis: data,
          isFavorite: false,
          tags: [],
          createdAt: new Date(),
        });
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Error");
      setAnalysisStatus("error");
    }
  };

  const result = analysisStatus === "complete" ? analysisResult : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col min-h-dvh"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-card-dark border-b border-white/6 rounded-none safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={handleBack} className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white press-effect">
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 text-center px-3">
            {routeInput.destination && (
              <div>
                <p className="text-sm font-semibold text-white truncate">{routeInput.destination.name}</p>
                <div className="flex items-center justify-center gap-1">
                  <MapPin size={9} className="text-bmw-400" />
                  <p className="text-2xs text-zinc-500">
                    {routeInput.date
                      ? new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" }).format(new Date(routeInput.date))
                      : "Hoy"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Favourite toggle */}
            {historyEntry && (
              <button
                onClick={() => toggleFavorite(historyEntry.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center press-effect"
                style={{
                  background: historyEntry.isFavorite ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
                  border: historyEntry.isFavorite ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Star
                  size={15}
                  style={{
                    color: historyEntry.isFavorite ? "#fbbf24" : "rgba(148,163,184,0.6)",
                    fill: historyEntry.isFavorite ? "#fbbf24" : "none",
                  }}
                />
              </button>
            )}
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white press-effect"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 pb-28">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {analysisStatus === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisLoader />
            </motion.div>
          )}

          {/* Error */}
          {analysisStatus === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-6 py-16 px-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Error al analizar</h3>
                <p className="text-sm text-zinc-400">{analysisError}</p>
              </div>
              <Button variant="primary" icon={<RefreshCw size={16} />} onClick={handleRetry}>
                Reintentar
              </Button>
            </motion.div>
          )}

          {/* Result */}
          {(analysisStatus === "complete" || result) && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pt-4 space-y-4"
            >
              {/* Background decoration */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-64 opacity-20"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${
                      result.overallScore >= 80 ? "#22c55e" : result.overallScore >= 60 ? "#0066cc" : "#f97316"
                    } 0%, transparent 70%)`,
                  }}
                />
              </div>

              <div className="relative space-y-4">
                {/* 1. Score */}
                <ScoreCard result={result} />

                {/* 1b. Route map */}
                {result.route?.destination?.coordinates && (
                  <RouteMapCard
                    destination={result.route.destination.coordinates}
                    destinationName={result.route.destination.name}
                    origin={result.route.origin?.coordinates}
                    originName={result.route.origin?.name}
                    bestStops={result.bestStops}
                    totalKm={result.summary?.distance}
                    onElevationLoaded={(pts, km) => { setElevPoints(pts); setElevTotalKm(km); }}
                  />
                )}

                {/* 1c. Elevation profile */}
                {elevPoints.length >= 2 && (
                  <ElevationProfileCard points={elevPoints} totalKm={elevTotalKm} />
                )}

                {/* 2. Weather Intelligence */}
                {result.weather && <WeatherCard weather={result.weather} />}

                {/* 3. Road Conditions */}
                {result.roadConditions && <RoadConditionsCard conditions={result.roadConditions} />}

                {/* 4. Rider Prep */}
                {result.riderPrep && <RiderPrepCard prep={result.riderPrep} />}

                {/* 5. Moto Prep */}
                {result.motoPrep && <MotoPrepCard prep={result.motoPrep} />}

                {/* 6. Route Insights */}
                {result.routeInsights && <RouteInsightsCard insights={result.routeInsights} />}

                {/* 7. Best Stops */}
                {result.bestStops?.length > 0 && <BestStopsCard stops={result.bestStops} />}

                {/* 8. Dangers */}
                <DangersCard dangers={result.dangers ?? []} />

                {/* 9. AI Recommendations + Summary */}
                {result.aiRecommendations?.length > 0 && (
                  <AIRecommendationsCard
                    recommendations={result.aiRecommendations}
                    aiSummary={result.aiSummary}
                  />
                )}

                {/* 10. Equipment */}
                {result.equipmentAdvice && <EquipmentCard equipment={result.equipmentAdvice} />}

                {/* 11. Fuel Planning */}
                {result.fuelPlanning && <FuelPlanningCard fuel={result.fuelPlanning} />}

                {/* 12. Emergency */}
                {result.emergency && <EmergencyCard emergency={result.emergency} />}

                {/* Share button */}
                <div className="pt-2 pb-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    icon={<Share2 size={18} />}
                    onClick={handleShare}
                  >
                    Compartir análisis
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Share sheet ── */}
      <AnimatePresence>
        {showShareSheet && result && (
          <>
            {/* Backdrop — above nav (z-60) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              onClick={() => setShowShareSheet(false)}
            />

            {/* Bottom sheet — above nav (z-[61]), max 85% of viewport */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl flex flex-col"
              style={{
                maxHeight: "85dvh",
                background: "rgba(12,12,22,0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Handle — not scrollable */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
              </div>

              {/* Header — not scrollable */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <p className="text-base font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Compartir análisis</p>
                <button onClick={() => setShowShareSheet(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center press-effect"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <X size={15} style={{ color: "rgba(235,235,245,0.6)" }} />
                </button>
              </div>

              {/* Card preview — scrollable if needed */}
              <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ overscrollBehavior: "contain" }}>
                <div
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #0d1535 0%, #0f0820 50%, #1a0808 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(51,133,255,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: "linear-gradient(145deg, #1a6fff, #0047cc)" }}>
                      🏍️
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "rgba(235,235,245,0.5)" }}>Rodamos</span>
                  </div>

                  <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(235,235,245,0.45)" }}>Análisis de ruta a</p>
                  <p className="text-2xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.03em" }}>
                    {routeInput.destination?.name}
                  </p>
                  {routeInput.date && (
                    <p className="text-xs mb-4" style={{ color: "rgba(235,235,245,0.38)" }} suppressHydrationWarning>
                      {new Date(routeInput.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl flex-shrink-0"
                      style={{
                        background: result.overallScore >= 80 ? "rgba(34,197,94,0.15)" : result.overallScore >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                        border: `1px solid ${result.overallScore >= 80 ? "rgba(34,197,94,0.3)" : result.overallScore >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                      }}>
                      <p className="text-3xl font-black leading-none"
                        style={{ color: result.overallScore >= 80 ? "#22c55e" : result.overallScore >= 60 ? "#f59e0b" : "#ef4444", letterSpacing: "-0.04em" }}>
                        {result.overallScore}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(235,235,245,0.4)" }}>/100</p>
                    </div>

                    {result.weather?.data && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                          <Thermometer size={12} style={{ color: "#f59e0b" }} />
                          <span className="text-sm font-semibold text-white">{result.weather.data.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Droplets size={12} style={{ color: "#60a5fa" }} />
                          <span className="text-sm font-semibold text-white">{result.weather.data.rainProbability}% lluvia</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wind size={12} style={{ color: "#94a3b8" }} />
                          <span className="text-sm font-semibold text-white">{result.weather.data.windSpeed} km/h</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {result.recommendation && (
                    <p className="text-xs mt-4 leading-relaxed" style={{ color: "rgba(235,235,245,0.55)" }}>
                      &ldquo;{result.recommendation}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions — always pinned at bottom, never scrolls away */}
              <div
                className="flex-shrink-0 px-5 pt-3 grid grid-cols-2 gap-3"
                style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
              >
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm press-effect"
                  style={{ background: "linear-gradient(135deg, #1a6fff, #0047cc)", color: "white" }}
                >
                  <Share2 size={16} />
                  Compartir
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm press-effect transition-all"
                  style={{
                    background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                    border: copied ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.1)",
                    color: copied ? "#22c55e" : "rgba(235,235,245,0.8)",
                  }}
                >
                  <Copy size={16} />
                  {copied ? "¡Copiado!" : "Copiar texto"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
