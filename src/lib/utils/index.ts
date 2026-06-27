import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function scoreToColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#0066cc";
  if (score >= 50) return "#f97316";
  return "#ef4444";
}

export function scoreToLabel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muy Bueno";
  if (score >= 70) return "Bueno";
  if (score >= 55) return "Aceptable";
  if (score >= 40) return "Arriesgado";
  return "No Recomendado";
}

export function scoreToGradient(score: number): string {
  if (score >= 85) return "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
  if (score >= 70) return "linear-gradient(135deg, #0066cc 0%, #003d7a 100%)";
  if (score >= 50) return "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
  return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)} Mm`;
  return `${Math.round(km)} km`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatTemperature(c: number): string {
  return `${Math.round(c)}°C`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function severityToColor(severity: string): string {
  switch (severity) {
    case "info":     return "#3385ff";
    case "warning":  return "#f97316";
    case "danger":   return "#ef4444";
    case "critical": return "#dc2626";
    default:         return "#a0a0ab";
  }
}

export function severityToBg(severity: string): string {
  switch (severity) {
    case "info":     return "rgba(51,133,255,0.1)";
    case "warning":  return "rgba(249,115,22,0.1)";
    case "danger":   return "rgba(239,68,68,0.1)";
    case "critical": return "rgba(220,38,38,0.15)";
    default:         return "rgba(160,160,171,0.1)";
  }
}

export function windDirectionToLabel(degrees: number): string {
  const dirs = ["N","NE","E","SE","S","SO","O","NO"];
  return dirs[Math.round(degrees / 45) % 8];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
