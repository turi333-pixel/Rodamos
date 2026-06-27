import type { WeatherData, HourlyWeather, Coordinates } from "@/types";

// ─── OpenWeather Map integration ──────────────────────────────────────────────

export async function getWeather(
  coords: Coordinates,
  date: Date
): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY not set, returning null");
    return null;
  }

  try {
    const isToday =
      new Date().toDateString() === date.toDateString();

    if (isToday) {
      return await getCurrentWeather(coords, apiKey);
    } else {
      return await getForecastWeather(coords, date, apiKey);
    }
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return null;
  }
}

async function getCurrentWeather(
  coords: Coordinates,
  apiKey: string
): Promise<WeatherData> {
  const [currentRes, uvRes, forecastRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}&units=metric&lang=es`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}`
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}&units=metric&lang=es&cnt=16`
    ),
  ]);

  const [current, uv, forecast] = await Promise.all([
    currentRes.json(),
    uvRes.json(),
    forecastRes.json(),
  ]);

  const windDeg = current.wind?.deg ?? 0;
  const windSpeed = ((current.wind?.speed ?? 0) * 3.6);
  const windGust = current.wind?.gust ? current.wind.gust * 3.6 : undefined;

  const hourly: HourlyWeather[] = (forecast.list ?? [])
    .slice(0, 8)
    .map((h: Record<string, unknown>) => {
      const rain = (h.rain as Record<string, number>)?.["3h"] ?? 0;
      const wSpeed = ((h.wind as Record<string, number>)?.speed ?? 0) * 3.6;
      const vis = (h.visibility as number ?? 10000) / 1000;
      const pop = ((h.pop as number) ?? 0) * 100;
      const score = computeHourlyScore({
        temp: (h.main as Record<string, number>).temp,
        windSpeed: wSpeed,
        rainProbability: pop,
        visibility: vis,
        rain,
      });
      return {
        time: new Date((h.dt as number) * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        temperature: Math.round((h.main as Record<string, number>).temp),
        rainProbability: Math.round(pop),
        windSpeed: Math.round(wSpeed),
        visibility: Math.round(vis),
        icon: (h.weather as Array<{ icon: string }>)[0]?.icon ?? "",
        score: score.value,
        scoreExplanation: score.explanation,
      };
    });

  const sunriseTs = current.sys?.sunrise * 1000;
  const sunsetTs  = current.sys?.sunset  * 1000;
  const toTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const rainProb = ((forecast.list?.[0]?.pop ?? 0) as number) * 100;
  const visibility = (current.visibility ?? 10000) / 1000;

  return {
    temperature:     Math.round(current.main?.temp ?? 20),
    feelsLike:       Math.round(current.main?.feels_like ?? 18),
    humidity:        current.main?.humidity ?? 50,
    windSpeed:       Math.round(windSpeed),
    windDirection:   windDeg,
    windGust:        windGust ? Math.round(windGust) : undefined,
    crosswindRisk:   classifyCrosswind(windSpeed, windGust),
    rainProbability: Math.round(rainProb),
    fogProbability:  current.weather?.[0]?.id === 741 ? 80 : visibility < 3 ? 50 : 5,
    visibility:      Math.round(visibility),
    uvIndex:         typeof uv.value === "number" ? Math.round(uv.value) : 4,
    cloudCover:      current.clouds?.all ?? 0,
    stormRisk:       classifyStormRisk(current.weather?.[0]?.id ?? 800),
    description:     current.weather?.[0]?.description ?? "Despejado",
    icon:            current.weather?.[0]?.icon ?? "01d",
    sunrise:         toTime(sunriseTs),
    sunset:          toTime(sunsetTs),
    hourly,
  };
}

async function getForecastWeather(
  coords: Coordinates,
  date: Date,
  apiKey: string
): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}&units=metric&lang=es&cnt=40`
  );
  const data = await res.json();

  const targetDate = date.toDateString();
  const dayItems = (data.list ?? []).filter(
    (item: Record<string, unknown>) =>
      new Date((item.dt as number) * 1000).toDateString() === targetDate
  );

  if (dayItems.length === 0 && data.list?.length > 0) {
    return parseWeatherItem(data.list[data.list.length - 1], data.list);
  }
  const midday = dayItems.find((i: Record<string, unknown>) => {
    const h = new Date((i.dt as number) * 1000).getHours();
    return h >= 11 && h <= 14;
  }) ?? dayItems[0] ?? data.list[0];

  return parseWeatherItem(midday, dayItems);
}

function parseWeatherItem(
  item: Record<string, unknown>,
  hourlyItems: Record<string, unknown>[]
): WeatherData {
  const main = item.main as Record<string, number>;
  const wind = item.wind as Record<string, number>;
  const weather = (item.weather as Array<{ id: number; description: string; icon: string }>)[0];
  const windSpeedKmh = (wind?.speed ?? 0) * 3.6;
  const windGustKmh  = wind?.gust ? wind.gust * 3.6 : undefined;
  const visibility   = (item.visibility as number ?? 10000) / 1000;
  const rainProb     = ((item.pop as number) ?? 0) * 100;

  const hourly: HourlyWeather[] = hourlyItems.slice(0, 8).map((h) => {
    const hm = h.main as Record<string, number>;
    const hw = h.wind as Record<string, number>;
    const ws = (hw?.speed ?? 0) * 3.6;
    const vis = (h.visibility as number ?? 10000) / 1000;
    const pop = ((h.pop as number) ?? 0) * 100;
    const s = computeHourlyScore({ temp: hm.temp, windSpeed: ws, rainProbability: pop, visibility: vis, rain: 0 });
    return {
      time: new Date((h.dt as number) * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      temperature: Math.round(hm.temp),
      rainProbability: Math.round(pop),
      windSpeed: Math.round(ws),
      visibility: Math.round(vis),
      icon: (h.weather as Array<{ icon: string }>)[0]?.icon ?? "",
      score: s.value,
      scoreExplanation: s.explanation,
    };
  });

  return {
    temperature:     Math.round(main?.temp ?? 20),
    feelsLike:       Math.round(main?.feels_like ?? 18),
    humidity:        main?.humidity ?? 50,
    windSpeed:       Math.round(windSpeedKmh),
    windDirection:   wind?.deg ?? 0,
    windGust:        windGustKmh ? Math.round(windGustKmh) : undefined,
    crosswindRisk:   classifyCrosswind(windSpeedKmh, windGustKmh),
    rainProbability: Math.round(rainProb),
    fogProbability:  weather?.id === 741 ? 80 : visibility < 3 ? 50 : 5,
    visibility:      Math.round(visibility),
    uvIndex:         4,
    cloudCover:      (item.clouds as Record<string, number>)?.all ?? 0,
    stormRisk:       classifyStormRisk(weather?.id ?? 800),
    description:     weather?.description ?? "Variable",
    icon:            weather?.icon ?? "01d",
    sunrise:         "—",
    sunset:          "—",
    hourly,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyCrosswind(
  speed: number,
  gust?: number
): WeatherData["crosswindRisk"] {
  const max = Math.max(speed, gust ?? 0);
  if (max < 20) return "bajo";
  if (max < 40) return "moderado";
  if (max < 60) return "alto";
  return "extremo";
}

function classifyStormRisk(weatherId: number): WeatherData["stormRisk"] {
  if (weatherId >= 200 && weatherId < 300) return "alto";
  if (weatherId >= 300 && weatherId < 600) return "moderado";
  return "bajo";
}

function computeHourlyScore(params: {
  temp: number;
  windSpeed: number;
  rainProbability: number;
  visibility: number;
  rain: number;
}): { value: number; explanation: string } {
  let score = 100;
  const reasons: string[] = [];

  if (params.temp < 5)  { score -= 20; reasons.push("frío extremo"); }
  else if (params.temp < 12) { score -= 10; reasons.push("temperatura fría"); }
  else if (params.temp > 35) { score -= 15; reasons.push("calor intenso"); }

  if (params.windSpeed > 60) { score -= 25; reasons.push("viento peligroso"); }
  else if (params.windSpeed > 40) { score -= 15; reasons.push("viento fuerte"); }
  else if (params.windSpeed > 25) { score -= 5;  reasons.push("algo de viento"); }

  if (params.rainProbability > 80) { score -= 20; reasons.push("lluvia probable"); }
  else if (params.rainProbability > 50) { score -= 10; reasons.push("posible lluvia"); }
  else if (params.rainProbability > 30) { score -= 5;  reasons.push("ligera probabilidad de lluvia"); }

  if (params.visibility < 1)  { score -= 20; reasons.push("visibilidad muy reducida"); }
  else if (params.visibility < 5) { score -= 10; reasons.push("visibilidad reducida"); }

  score = Math.max(0, Math.min(100, score));
  const explanation = reasons.length
    ? `Penalizado por: ${reasons.join(", ")}`
    : "Condiciones ideales";

  return { value: score, explanation };
}
