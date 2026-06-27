"use client";
import { motion } from "framer-motion";
import { Wind, Droplets, Eye, Sun, Thermometer, Cloud, AlertTriangle } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { WeatherIntelligence } from "@/types";
import { windDirectionToLabel, formatTemperature, formatSpeed, severityToColor } from "@/lib/utils";

export function WeatherCard({ weather }: { weather: WeatherIntelligence }) {
  const w = weather.data;

  const metrics = [
    { icon: <Thermometer size={15} />, label: "Temperatura",  value: formatTemperature(w.temperature), sub: `Sensación ${formatTemperature(w.feelsLike)}`, color: tempColor(w.temperature), glow: "rgba(245,158,11,0.3)" },
    { icon: <Wind size={15} />,        label: "Viento",       value: formatSpeed(w.windSpeed),          sub: windLabel(w.crosswindRisk),                   color: windColor(w.crosswindRisk), glow: windGlow(w.crosswindRisk) },
    { icon: <Droplets size={15} />,    label: "Lluvia",       value: `${w.rainProbability}%`,           sub: rainLabel(w.rainProbability),                 color: rainColor(w.rainProbability), glow: "rgba(14,165,233,0.3)" },
    { icon: <Eye size={15} />,         label: "Visibilidad",  value: `${w.visibility} km`,              sub: visLabel(w.visibility),                       color: visColor(w.visibility), glow: "rgba(34,197,94,0.3)" },
    { icon: <Sun size={15} />,         label: "Índice UV",    value: `${w.uvIndex}`,                    sub: uvLabel(w.uvIndex),                           color: uvColor(w.uvIndex), glow: "rgba(234,179,8,0.3)" },
    { icon: <Cloud size={15} />,       label: "Nubosidad",    value: `${w.cloudCover}%`,                sub: cloudLabel(w.cloudCover),                     color: "#94a3b8", glow: "rgba(148,163,184,0.2)" },
  ];

  return (
    <CardShell theme="weather" icon={getWeatherEmoji(w.icon)} title="Inteligencia Meteorológica" subtitle={w.description}
      delay={0.1}
      badge={
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-2xs font-semibold"
          style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)", color: "#38bdf8" }}>
          🌅 {w.sunrise} — {w.sunset}
        </div>
      }
    >
      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-2xl flex flex-col gap-1.5"
            style={{ background: `${m.color}0a`, border: `1px solid ${m.color}20` }}>
            <div className="flex items-center gap-1.5">
              <span style={{ color: m.color }}>{m.icon}</span>
              <span className="text-2xs" style={{ color: "rgba(148,163,184,0.7)" }}>{m.label}</span>
            </div>
            <p className="text-base font-bold" style={{ color: m.color, textShadow: `0 0 12px ${m.glow}` }}>{m.value}</p>
            <p className="text-2xs" style={{ color: "rgba(148,163,184,0.55)" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Wind gust alert */}
      {w.windGust && w.windGust > 30 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl mb-3"
          style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)" }}>
          <Wind size={14} style={{ color: "#f97316" }} />
          <p className="text-xs" style={{ color: "rgba(210,210,220,0.9)" }}>
            Rachas hasta <span className="font-bold" style={{ color: "#f97316" }}>{formatSpeed(w.windGust)}</span>
            {" "}— dirección {windDirectionToLabel(w.windDirection)}
          </p>
        </div>
      )}

      {/* AI interpretation */}
      <div className="p-3.5 rounded-2xl mb-3"
        style={{ background: "rgba(14,165,233,0.07)", border: "1px solid rgba(14,165,233,0.18)" }}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(200,230,255,0.9)" }}>{weather.interpretation}</p>
      </div>

      {/* Best riding window */}
      <div className="flex items-center gap-3 p-3 rounded-2xl mb-3"
        style={{ background: "rgba(0,217,126,0.07)", border: "1px solid rgba(0,217,126,0.20)" }}>
        <span className="text-lg">✅</span>
        <div>
          <p className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>Mejor ventana para rodar</p>
          <p className="text-sm font-bold" style={{ color: "#00d97e" }}>{weather.bestWindow}</p>
        </div>
      </div>

      {/* Alerts */}
      {weather.alerts.length > 0 && (
        <div className="space-y-2">
          {weather.alerts.map((alert, i) => {
            const c = severityToColor(alert.severity);
            return (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                style={{ background: `${c}0d`, border: `1px solid ${c}30` }}>
                <AlertTriangle size={13} style={{ color: c }} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-snug" style={{ color: "rgba(210,210,220,0.85)" }}>{alert.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Hourly scroll */}
      {w.hourly.length > 0 && (
        <div className="mt-4">
          <p className="text-2xs uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Hora a hora</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {w.hourly.map((h, i) => {
              const barColor = h.score >= 80 ? "#00d97e" : h.score >= 60 ? "#3385ff" : "#ff9500";
              return (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 p-2.5 rounded-2xl min-w-[64px]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-2xs" style={{ color: "rgba(148,163,184,0.6)" }}>{h.time}</span>
                  <span className="text-base">{getWeatherEmoji(h.icon)}</span>
                  <span className="text-xs font-bold text-white">{h.temperature}°</span>
                  <div className="flex items-center gap-0.5">
                    <Droplets size={9} style={{ color: "#3385ff" }} />
                    <span className="text-2xs" style={{ color: "rgba(148,163,184,0.55)" }}>{h.rainProbability}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${h.score}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CardShell>
  );
}

// helpers
function getWeatherEmoji(icon: string) {
  const m: Record<string, string> = { "01d":"☀️","01n":"🌙","02d":"⛅","02n":"☁️","03d":"☁️","03n":"☁️","04d":"☁️","04n":"☁️","09d":"🌧️","09n":"🌧️","10d":"🌦️","10n":"🌧️","11d":"⛈️","11n":"⛈️","13d":"❄️","13n":"❄️","50d":"🌫️","50n":"🌫️" };
  return m[icon] ?? "🌤️";
}
function tempColor(t: number) { return t < 5 ? "#60a5fa" : t < 15 ? "#93c5fd" : t < 25 ? "#00d97e" : t < 32 ? "#f97316" : "#ef4444"; }
function windColor(r: string) { return r === "bajo" ? "#00d97e" : r === "moderado" ? "#f97316" : "#ef4444"; }
function windGlow(r: string) { return r === "bajo" ? "rgba(0,217,126,0.3)" : "rgba(249,115,22,0.3)"; }
function rainColor(p: number) { return p < 20 ? "#00d97e" : p < 50 ? "#f97316" : "#ef4444"; }
function visColor(v: number) { return v > 10 ? "#00d97e" : v > 5 ? "#f97316" : "#ef4444"; }
function uvColor(u: number)  { return u <= 2 ? "#00d97e" : u <= 5 ? "#f97316" : "#ef4444"; }
function windLabel(r: string) { return { bajo:"Sin problemas", moderado:"Precaución en curvas", alto:"Peligroso", extremo:"No recomendado" }[r] ?? ""; }
function rainLabel(p: number) { return p < 20 ? "Sin lluvia esperada" : p < 50 ? "Ligera posibilidad" : "Probabilidad alta"; }
function visLabel(v: number) { return v > 10 ? "Excelente" : v > 5 ? "Buena" : "Reducida"; }
function uvLabel(u: number) { return u <= 2 ? "Bajo" : u <= 5 ? "Moderado" : "Alto"; }
function cloudLabel(c: number) { return c < 20 ? "Despejado" : c < 50 ? "Parcialmente nublado" : "Cubierto"; }
