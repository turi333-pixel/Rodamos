import type { WeatherData, HourlyWeather } from "@/types";

// WMO weather code → OWM-compatible icon string (matches existing weatherEmoji() in UI)
const WMO_ICON: Record<number, string> = {
  0: "01d", 1: "01d", 2: "02d", 3: "04d",
  45: "50d", 48: "50d",
  51: "09d", 53: "09d", 55: "09d",
  61: "10d", 63: "10d", 65: "10d",
  71: "13d", 73: "13d", 75: "13d", 77: "13d",
  80: "09d", 81: "09d", 82: "09d",
  85: "13d", 86: "13d",
  95: "11d", 96: "11d", 99: "11d",
};

const WMO_DESC: Record<number, string> = {
  0: "Despejado", 1: "Principalmente despejado", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Niebla", 48: "Niebla con escarcha",
  51: "Llovizna ligera", 53: "Llovizna moderada", 55: "Llovizna densa",
  61: "Lluvia ligera", 63: "Lluvia moderada", 65: "Lluvia intensa",
  71: "Nieve ligera", 73: "Nieve moderada", 75: "Nieve intensa", 77: "Granizo",
  80: "Chubascos ligeros", 81: "Chubascos moderados", 82: "Chubascos fuertes",
  85: "Nieve ligera", 86: "Nieve intensa",
  95: "Tormenta eléctrica", 96: "Tormenta con granizo", 99: "Tormenta fuerte",
};

function wmoStormRisk(code: number): WeatherData["stormRisk"] {
  if (code >= 95) return "alto";
  if (code >= 80 || code >= 61) return "moderado";
  return "bajo";
}

function crosswindRisk(speed: number, gust?: number): WeatherData["crosswindRisk"] {
  const max = Math.max(speed, gust ?? 0);
  if (max < 20) return "bajo";
  if (max < 40) return "moderado";
  if (max < 60) return "alto";
  return "extremo";
}

function hourlyScore(temp: number, wind: number, rain: number, vis: number) {
  let score = 100;
  const reasons: string[] = [];
  if (temp < 5) { score -= 20; reasons.push("frío extremo"); }
  else if (temp < 12) { score -= 10; reasons.push("temperatura fría"); }
  else if (temp > 35) { score -= 15; reasons.push("calor intenso"); }
  if (wind > 60) { score -= 25; reasons.push("viento peligroso"); }
  else if (wind > 40) { score -= 15; reasons.push("viento fuerte"); }
  else if (wind > 25) { score -= 5; reasons.push("algo de viento"); }
  if (rain > 80) { score -= 20; reasons.push("lluvia probable"); }
  else if (rain > 50) { score -= 10; reasons.push("posible lluvia"); }
  else if (rain > 30) { score -= 5; reasons.push("algo de lluvia"); }
  if (vis < 1) { score -= 20; reasons.push("visibilidad muy reducida"); }
  else if (vis < 5) { score -= 10; reasons.push("visibilidad reducida"); }
  return {
    value: Math.max(0, Math.min(100, score)),
    explanation: reasons.length ? `Penalizado por: ${reasons.join(", ")}` : "Condiciones ideales",
  };
}

export async function getOpenMeteoWeather(
  lat: number,
  lng: number,
  date: Date
): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,visibility,uv_index,weather_code` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code,visibility` +
      `&daily=sunrise,sunset,uv_index_max` +
      `&timezone=auto&forecast_days=7`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const c = data.current ?? {};
    const daily = data.daily ?? {};
    const hourlyTimes: string[] = data.hourly?.time ?? [];

    const targetDateStr = date.toISOString().slice(0, 10);
    const dayIdx = (daily.time ?? []).indexOf(targetDateStr);
    const effectiveDayIdx = dayIdx >= 0 ? dayIdx : 0;

    // Pick hourly slice for the target date (up to 8 slots)
    const startIdx = hourlyTimes.findIndex((t: string) => t.startsWith(targetDateStr));
    const idxRange = startIdx >= 0
      ? Array.from({ length: 8 }, (_, i) => startIdx + i).filter(i => i < hourlyTimes.length)
      : Array.from({ length: 8 }, (_, i) => i);

    const hourly: HourlyWeather[] = idxRange.map(i => {
      const wind = data.hourly.wind_speed_10m?.[i] ?? 0;
      const rain = data.hourly.precipitation_probability?.[i] ?? 0;
      const vis = (data.hourly.visibility?.[i] ?? 10000) / 1000;
      const temp = data.hourly.temperature_2m?.[i] ?? 20;
      const code = data.hourly.weather_code?.[i] ?? 0;
      const s = hourlyScore(temp, wind, rain, vis);
      return {
        time: (hourlyTimes[i] ?? "").slice(11, 16) || `${String(i).padStart(2, "0")}:00`,
        temperature: Math.round(temp),
        rainProbability: Math.round(rain),
        windSpeed: Math.round(wind),
        visibility: Math.round(vis),
        icon: WMO_ICON[code] ?? "01d",
        score: s.value,
        scoreExplanation: s.explanation,
      };
    });

    const toHHMM = (iso: string) => (iso ?? "").slice(11, 16) || "07:30";
    const windSpeed = c.wind_speed_10m ?? 0;
    const windGust = c.wind_gusts_10m ?? undefined;
    const visibility = (c.visibility ?? 10000) / 1000;
    const code: number = c.weather_code ?? 0;

    // For future dates use daily data if available
    const isTargetDay = new Date().toISOString().slice(0, 10) === targetDateStr;
    const temp = isTargetDay
      ? (c.temperature_2m ?? 20)
      : (data.hourly?.temperature_2m?.[startIdx] ?? c.temperature_2m ?? 20);
    const rain = isTargetDay
      ? (c.precipitation_probability ?? 0)
      : (data.hourly?.precipitation_probability?.[startIdx] ?? c.precipitation_probability ?? 0);

    return {
      temperature:     Math.round(temp),
      feelsLike:       Math.round(c.apparent_temperature ?? temp - 2),
      humidity:        c.relative_humidity_2m ?? 50,
      windSpeed:       Math.round(windSpeed),
      windDirection:   c.wind_direction_10m ?? 0,
      windGust:        windGust ? Math.round(windGust) : undefined,
      crosswindRisk:   crosswindRisk(windSpeed, windGust),
      rainProbability: Math.round(rain),
      fogProbability:  (code === 45 || code === 48) ? 80 : visibility < 3 ? 50 : 5,
      visibility:      Math.round(visibility),
      uvIndex:         Math.round(c.uv_index ?? daily.uv_index_max?.[effectiveDayIdx] ?? 4),
      cloudCover:      c.cloud_cover ?? 0,
      stormRisk:       wmoStormRisk(code),
      description:     WMO_DESC[code] ?? "Variable",
      icon:            WMO_ICON[code] ?? "01d",
      sunrise:         toHHMM(daily.sunrise?.[effectiveDayIdx] ?? ""),
      sunset:          toHHMM(daily.sunset?.[effectiveDayIdx] ?? ""),
      hourly,
    };
  } catch {
    return null;
  }
}
