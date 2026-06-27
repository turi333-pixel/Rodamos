"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronRight, Zap, Settings, Wind, Droplets, Clock, Calendar, Bike } from "lucide-react";
import { isToday, isTomorrow, addDays, format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { useAppStore } from "@/store";
import { LocationSearch } from "@/components/forms/LocationSearch";
import { BottomNav } from "@/components/layout/Navigation";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";
import { HistoryPage } from "@/components/pages/HistoryPage";
import { FavoritesPage } from "@/components/pages/FavoritesPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import type { Location } from "@/types";
import { generateId } from "@/lib/utils";

export default function RootPage() {
  const { currentView } = useAppStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentView]);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg-base)" }}>
      <AnimatePresence mode="wait">
        {currentView === "home"      && <HomePage      key="home" />}
        {currentView === "analyze"   && <AnalysisPage  key="analyze" />}
        {currentView === "history"   && <HistoryPage   key="history" />}
        {currentView === "favorites" && <FavoritesPage key="favorites" />}
        {currentView === "settings"  && <SettingsPage  key="settings" />}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

interface HomeWeather {
  temp: number;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;
  rainProb: number;
  score: number;
  bestTime: string;
}

function HomePage() {
  const {
    routeInput, setRouteInput, setView,
    setAnalysisStatus, setAnalysisResult, setAnalysisError, addToHistory,
    history, user,
  } = useAppStore();
  const [date, setDate] = useState<Date>(new Date());
  const [destination, setDestination] = useState<Location | undefined>(routeInput.destination);
  const [origin, setOrigin] = useState<Location | undefined>(routeInput.origin);
  const [loading, setLoading] = useState(false);
  const [homeWeather, setHomeWeather] = useState<HomeWeather | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude: lat, longitude: lng } = pos.coords;
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}&date=${new Date().toISOString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const w = data.current ?? data;
        setHomeWeather({
          temp:        Math.round(w.temperature ?? w.temp ?? 20),
          description: w.description ?? "Despejado",
          icon:        w.icon ?? "01d",
          windSpeed:   Math.round(w.windSpeed ?? 10),
          humidity:    w.humidity ?? 50,
          rainProb:    w.rainProbability ?? w.rain ?? 0,
          score:       w.ridingScore ?? 85,
          bestTime:    w.bestWindow ?? "Todo el día",
        });
      } catch { /* silently ignore */ }
    }, () => {}, { timeout: 6000 });
  }, []);

  const recentFromHistory = history
    .filter((h) => h.route?.destination)
    .slice(0, 3)
    .map((h) => ({
      name:        h.route.destination.name,
      address:     h.route.destination.address ?? "",
      coordinates: h.route.destination.coordinates,
      score:       h.analysis?.overallScore,
      emoji:       "🗺️",
    }));

  const fallbackDestinations = [
    { name: "Ronda",           address: "Málaga, España",    emoji: "🏔️", score: undefined, coordinates: { lat: 36.7457, lng: -5.1542 } },
    { name: "Picos de Europa", address: "Cantabria, España", emoji: "⛰️", score: undefined, coordinates: { lat: 43.1832, lng: -4.8467 } },
    { name: "Cap de Creus",    address: "Girona, España",    emoji: "🌊", score: undefined, coordinates: { lat: 42.3192, lng:  3.3183 } },
  ];

  const displayedDestinations = recentFromHistory.length > 0 ? recentFromHistory : fallbackDestinations;

  const totalRoutes = history.length;
  const totalKm = history.reduce((sum, h) => sum + (h.analysis?.summary?.distance ?? 0), 0);
  const avgScore = totalRoutes > 0
    ? Math.round(history.reduce((sum, h) => sum + (h.analysis?.overallScore ?? 0), 0) / totalRoutes)
    : 0;

  const handleAnalyze = async () => {
    if (!destination) return;
    setLoading(true);
    setRouteInput({ destination, origin, date });
    setAnalysisStatus("loading");
    setAnalysisResult(null);
    setAnalysisError(null);
    setView("analyze");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          origin,
          date: date.toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Error al analizar la ruta");
      const data = await res.json();
      setAnalysisResult(data);
      setAnalysisStatus("complete");
      addToHistory({
        id: generateId(),
        userId: "local",
        name: destination.name,
        route: { destination, origin, date },
        analysis: data,
        isFavorite: false,
        tags: [],
        createdAt: new Date(),
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Error desconocido");
      setAnalysisStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-dvh relative overflow-x-hidden"
    >
      {/* ── Fixed base background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "#07070f" }} />

      {/* ── Hero section with atmospheric dusk gradient ── */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Hero motorcycle photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-moto.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          {/* Dark vignette — stronger at top for text, fades to solid at bottom */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(4,3,14,0.72) 0%, rgba(6,5,16,0.45) 35%, rgba(7,6,17,0.25) 58%, #07070f 92%)"
          }} />
          {/* Subtle blue cinematic tint */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, rgba(10,20,80,0.18) 0%, transparent 60%)"
          }} />
          <div className="absolute inset-0 noise" style={{ opacity: 0.2 }} />
        </div>

        <div className="relative pt-14 pb-8 px-5">
          {/* App bar */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(145deg, #1a6fff 0%, #0047cc 100%)",
                  boxShadow: "0 2px 12px rgba(26,111,255,0.4), inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
              >
                <Bike size={19} color="white" strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-semibold leading-none" style={{ fontSize: 17, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  Rodamos
                </p>
                <p className="mt-0.5" style={{ fontSize: 11, color: "rgba(235,235,245,0.38)", letterSpacing: "-0.01em" }}>
                  Asistente de ruta
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center press-effect relative"
                style={{ background: "rgba(118,118,128,0.18)" }}
              >
                <Bell size={16} style={{ color: "rgba(235,235,245,0.65)" }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: "#3385ff", boxShadow: "0 0 0 1.5px #07070f" }} />
              </button>
              <button
                onClick={() => setView("settings")}
                className="w-9 h-9 rounded-full flex items-center justify-center press-effect"
                style={{ background: "rgba(118,118,128,0.18)" }}
              >
                <Settings size={16} style={{ color: "rgba(235,235,245,0.6)" }} />
              </button>
            </div>
          </motion.div>

          {/* Greeting + headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="font-medium mb-2" style={{ fontSize: 16, color: "rgba(235,235,245,0.75)", letterSpacing: "-0.01em" }} suppressHydrationWarning>
              {(() => {
                const h = new Date().getHours();
                const greeting = h >= 6 && h < 14 ? "Buenos días" : h >= 14 && h < 21 ? "Buenas tardes" : "Buenas noches";
                return `${greeting}, ${user?.name ?? "Motero"} 👋`;
              })()}
            </p>
            <h1 className="font-bold" style={{ fontSize: "2.25rem", lineHeight: 1.06, letterSpacing: "-0.038em" }}>
              <span style={{ color: "#ffffff" }}>{"¿A dónde"}<br /></span>
              <span style={{
                background: "linear-gradient(135deg, #3b8aff 0%, #6ab0ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{"quieres ir?"}</span>
            </h1>
            <p className="mt-2.5" style={{ fontSize: 13, color: "rgba(235,235,245,0.25)", letterSpacing: "-0.01em" }} suppressHydrationWarning>
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content cards ── */}
      <div className="relative px-4 pb-28 space-y-3">

        {/* Stats strip — 4 horizontally scrollable cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4"
        >
          {[
            { label: "Distancia",  sublabel: "Total",      value: totalKm > 0 ? (totalKm >= 1000 ? `${(totalKm / 1000).toFixed(1)}k` : `${Math.round(totalKm)}`) : "—", unit: "km", icon: "🛣️", color: "#3385ff" },
            { label: "Rutas",      sublabel: "Analizadas", value: totalRoutes > 0 ? `${totalRoutes}` : "—",                                                                unit: "",   icon: "🗺️", color: "#22c55e" },
            { label: "Score",      sublabel: "Medio",      value: avgScore > 0 ? `${avgScore}` : "—",                                                                      unit: "",   icon: "⭐",  color: "#f59e0b" },
            { label: "Favoritas",  sublabel: "Guardadas",  value: history.filter(h => h.isFavorite).length > 0 ? `${history.filter(h => h.isFavorite).length}` : "—",     unit: "",   icon: "⭐",  color: "#8b5cf6" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-shrink-0 rounded-2xl flex flex-col gap-2 p-4"
              style={{ width: 108, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: `${stat.color}1a` }}>
                {stat.icon}
              </div>
              <div className="leading-none">
                <span className="text-xl font-bold text-white">{stat.value}</span>
                {stat.unit && <span className="text-xs ml-0.5" style={{ color: "rgba(161,161,171,0.55)" }}>{stat.unit}</span>}
              </div>
              <div>
                <p className="text-xs leading-none font-semibold text-white">{stat.label}</p>
                <p className="text-2xs mt-0.5 leading-none" style={{ color: "rgba(161,161,171,0.45)" }}>{stat.sublabel}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Route input card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-3xl"
          style={{
            background: "rgba(10,12,22,0.94)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 2px 0 rgba(255,255,255,0.05) inset, 0 20px 56px rgba(0,0,0,0.55)",
          }}
        >
          <div className="h-px rounded-t-3xl" style={{ background: "linear-gradient(90deg, transparent, rgba(51,133,255,0.75) 30%, rgba(100,160,255,0.5) 70%, transparent)" }} />
          <div className="p-5">
            <div className="flex gap-4">
              {/* Vertical route connector */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 16, paddingTop: 18 }}>
                <div className="w-3 h-3 rounded-full" style={{ border: "2.5px solid rgba(148,163,184,0.3)", background: "rgba(10,12,22,1)" }} />
                <div className="flex-1 my-2" style={{
                  width: 1.5, minHeight: 44,
                  background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.14) 0, rgba(255,255,255,0.14) 4px, transparent 4px, transparent 8px)",
                }} />
                <motion.div
                  animate={destination?.coordinates ? {
                    boxShadow: ["0 0 0 0px rgba(51,133,255,0.4)", "0 0 0 6px rgba(51,133,255,0)", "0 0 0 0px rgba(51,133,255,0.4)"],
                  } : { boxShadow: "none" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3.5 h-3.5 rounded-full"
                  style={{
                    background: destination?.coordinates ? "linear-gradient(135deg, #3385ff, #0055cc)" : "rgba(51,133,255,0.2)",
                    border: destination?.coordinates ? "none" : "1.5px solid rgba(51,133,255,0.3)",
                  }}
                />
              </div>

              {/* Inputs */}
              <div className="flex-1 min-w-0">
                {/* Origin */}
                <div className="pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-2xs font-bold uppercase mb-2" style={{ color: "rgba(51,133,255,0.7)", letterSpacing: "0.09em" }}>Desde</p>
                  <LocationSearch minimal value={origin} onChange={(l) => setOrigin(l as typeof origin)} placeholder="Tu ubicación" size="sm" />
                </div>

                {/* Destination */}
                <div className="pt-4">
                  <p className="text-2xs font-bold uppercase mb-2" style={{ color: "rgba(51,133,255,0.7)", letterSpacing: "0.09em" }}>Hasta</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <LocationSearch minimal value={destination} onChange={(l) => setDestination(l as typeof destination)} placeholder="A donde vamos hoy?" size="lg" />
                    </div>
                    <ChevronRight size={18} style={{ color: "rgba(148,163,184,0.28)", flexShrink: 0 }} />
                  </div>
                  <AnimatePresence>
                    {destination?.coordinates && destination.address && (
                      <motion.p key="addr" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="text-xs mt-1.5 truncate" style={{ color: "rgba(51,133,255,0.5)" }}>
                        {"📍"} {destination.address}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date / time card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(10,12,22,0.94)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3.5">
              <Calendar size={15} style={{ color: "rgba(51,133,255,0.8)" }} />
              <p className="text-sm font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>Elige cuando</p>
            </div>
            <div className="flex items-center gap-2">
              {(["Hoy", "Manana"] as const).map((label, i) => {
                const active = i === 0 ? isToday(date) : isTomorrow(date);
                const displayLabel = i === 0 ? "Hoy" : "Mañana";
                return (
                  <button
                    key={label}
                    onClick={() => { const d = addDays(new Date(), i); d.setHours(date.getHours(), date.getMinutes(), 0, 0); setDate(d); }}
                    className="press-effect flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: active ? "transparent" : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${active ? "#3385ff" : "rgba(255,255,255,0.08)"}`,
                      color: active ? "#3385ff" : "rgba(148,163,184,0.55)",
                    }}
                  >
                    <Calendar size={12} />{displayLabel}
                  </button>
                );
              })}
              {!isToday(date) && !isTomorrow(date) && (
                <button className="press-effect flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
                  style={{ border: "1.5px solid #3385ff", color: "#3385ff", background: "transparent" }}>
                  <Calendar size={12} />{formatDate(date, "d MMM", { locale: es })}
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => { const h = date.getHours(); const next = h >= 18 ? 7 : h + 1; const d = new Date(date); d.setHours(next, 0, 0, 0); setDate(d); }}
                className="press-effect flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.1)", color: "rgba(210,210,220,0.85)" }}
              >
                <Clock size={12} style={{ color: "#3385ff" }} />
                <span className="tabular-nums" suppressHydrationWarning>{formatDate(date, "HH:mm")}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "rgba(148,163,184,0.45)" }}><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Weather card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(10,12,22,0.94)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          {homeWeather ? (
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Temperature */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-4xl">{weatherEmoji(homeWeather.icon)}</span>
                  <div>
                    <p className="text-3xl font-bold text-white leading-none" style={{ letterSpacing: "-0.03em" }}>{homeWeather.temp}{"°C"}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(161,161,171,0.7)" }}>{homeWeather.description}</p>
                    <p className="text-xs" style={{ color: "rgba(161,161,171,0.45)" }}>{"Sensacion "}{homeWeather.temp + 2}{"°C"}</p>
                  </div>
                </div>
                {/* Rain + Wind */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Droplets size={13} style={{ color: "#60a5fa" }} />
                    <span className="text-sm font-bold text-white">{homeWeather.rainProb}{"%"}</span>
                    <span className="text-xs" style={{ color: "rgba(161,161,171,0.5)" }}>Lluvia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind size={13} style={{ color: "#94a3b8" }} />
                    <span className="text-sm font-bold text-white">{homeWeather.windSpeed}</span>
                    <span className="text-xs" style={{ color: "rgba(161,161,171,0.5)" }}>km/h</span>
                  </div>
                </div>
                {/* Road condition */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold" style={{ color: homeWeather.score >= 80 ? "#22c55e" : homeWeather.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {homeWeather.score >= 80 ? "Buena" : homeWeather.score >= 60 ? "Moderada" : "Adversa"}
                    </p>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(148,163,184,0.12)", fontSize: 9, color: "rgba(148,163,184,0.5)", fontWeight: 700 }}>i</div>
                  </div>
                  <p className="text-xs text-right leading-tight" style={{ color: "rgba(161,161,171,0.45)" }}>{"Condicion"}<br />{"del asfalto"}</p>
                </div>
              </div>
              {/* Condition bar */}
              <div className="mt-3 relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to right, #22c55e 0%, #84cc16 35%, #f59e0b 60%, #ef4444 100%)" }} />
                <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white"
                  style={{ left: `${Math.max(5, Math.min(90, 100 - homeWeather.score))}%`, transform: "translate(-50%, -50%)", boxShadow: "0 0 0 2px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          ) : (
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded-full shimmer" />
                <div className="h-3 w-20 rounded-full shimmer" />
              </div>
              <div className="w-20 h-8 rounded-xl shimmer" />
            </div>
          )}
        </motion.div>

        {/* Analyze CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
        >
          <input ref={fileRef} type="file" accept=".gpx" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => setRouteInput({ gpxData: ev.target?.result as string });
              reader.readAsText(file);
            }}
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!destination || loading}
            className="w-full h-16 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-35"
            style={{
              background: destination
                ? "linear-gradient(135deg, #1a6fff 0%, #0047cc 38%, #5b2df8 72%, #c2410c 100%)"
                : "rgba(255,255,255,0.07)",
              boxShadow: destination
                ? "0 10px 40px rgba(26,111,255,0.5), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                : "none",
              border: destination ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {destination && (
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />
            )}
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <div className="flex items-center gap-2 relative z-10">
                  <Zap size={17}
                    fill={destination ? "white" : "rgba(148,163,184,0.4)"}
                    color={destination ? "white" : "rgba(148,163,184,0.4)"}
                  />
                  <span className="text-base font-bold" style={{ color: destination ? "white" : "rgba(148,163,184,0.4)", letterSpacing: "-0.01em" }}>
                    {loading ? "Analizando..." : "Analizar Ruta"}
                  </span>
                </div>
                {destination && (
                  <p className="text-xs relative z-10 mt-0.5" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>
                    Descubre la mejor experiencia
                  </p>
                )}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Recent / suggested destinations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(10,12,22,0.94)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase" style={{ color: "rgba(161,161,171,0.5)", letterSpacing: "0.07em" }}>
                {recentFromHistory.length > 0 ? "Rutas recientes" : "Destinos sugeridos"}
              </p>
              {recentFromHistory.length > 0 && (
                <button onClick={() => setView("history")} className="text-xs font-semibold press-effect" style={{ color: "#3385ff" }}>
                  Ver historial
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {displayedDestinations.map((dest, i) => {
                const scoreColor = dest.score != null
                  ? (dest.score >= 85 ? "#22c55e" : dest.score >= 70 ? "#3385ff" : "#f97316")
                  : undefined;
                return (
                  <motion.button
                    key={dest.name + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.58 + i * 0.06 }}
                    onClick={() => dest.coordinates && setDestination({ name: dest.name, address: dest.address, coordinates: dest.coordinates, type: "saved" })}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl press-effect text-left"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {dest.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{dest.name}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(161,161,171,0.55)" }}>{dest.address}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dest.score != null && (
                        <p className="text-sm font-bold" style={{ color: scoreColor }}>{dest.score}</p>
                      )}
                      <ChevronRight size={14} style={{ color: "rgba(161,161,171,0.3)" }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function weatherEmoji(icon: string) {
  const m: Record<string, string> = {
    "01d": "☀️", "01n": "🌙", "02d": "⛅", "02n": "☁️", "03d": "☁️", "03n": "☁️",
    "04d": "☁️", "04n": "☁️", "09d": "🌧️", "09n": "🌧️", "10d": "🌦️", "10n": "🌧️",
    "11d": "⛈️", "11n": "⛈️", "13d": "❄️", "13n": "❄️", "50d": "🌫️", "50n": "🌫️",
  };
  return m[icon] ?? "🌤️";
}
