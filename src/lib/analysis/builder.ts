import type {
  AnalysisResult, RouteInput, WeatherData,
  BestStop, Danger, WeatherAlert, RoadHazard, ScoreTimelineEntry,
} from "@/types";
import type { RouteData } from "@/lib/routing/osrm";
import type { OSMPlace } from "@/lib/pois/overpass";

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function scoreFromWeather(w: WeatherData): number {
  let score = 100;
  if (w.rainProbability > 70) score -= 30;
  else if (w.rainProbability > 50) score -= 18;
  else if (w.rainProbability > 30) score -= 8;
  if (w.windSpeed > 70) score -= 30;
  else if (w.windSpeed > 50) score -= 18;
  else if (w.windSpeed > 35) score -= 10;
  else if (w.windSpeed > 25) score -= 4;
  if (w.temperature < 2) score -= 20;
  else if (w.temperature < 8) score -= 10;
  else if (w.temperature > 38) score -= 15;
  if (w.visibility < 1) score -= 20;
  else if (w.visibility < 5) score -= 8;
  if (w.stormRisk === "alto") score -= 25;
  else if (w.stormRisk === "moderado") score -= 10;
  if (w.fogProbability > 60) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function rating(score: number): AnalysisResult["overallRating"] {
  if (score >= 90) return "Excelente";
  if (score >= 78) return "Muy Bueno";
  if (score >= 65) return "Bueno";
  if (score >= 50) return "Aceptable";
  if (score >= 35) return "Arriesgado";
  return "No Recomendado";
}

// ─── Text builders ────────────────────────────────────────────────────────────

function windDir(deg: number): string {
  const d = ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"];
  return d[Math.round(deg / 45) % 8];
}

function weatherInterpretation(w: WeatherData): string {
  const parts: string[] = [];
  if (w.rainProbability > 60)
    parts.push(`Alta probabilidad de lluvia (${Math.round(w.rainProbability)}%) que afectará al agarre y visibilidad.`);
  else if (w.rainProbability > 30)
    parts.push(`Posible lluvia (${Math.round(w.rainProbability)}%). Guarda el chubasquero accesible.`);
  else
    parts.push(`Condiciones secas con ${Math.round(w.rainProbability)}% de probabilidad de lluvia — favorable para rodar.`);
  if (w.windSpeed > 35)
    parts.push(`Viento de ${Math.round(w.windSpeed)} km/h del ${windDir(w.windDirection)} — requiere atención en tramos expuestos.`);
  else
    parts.push(`Viento de ${Math.round(w.windSpeed)} km/h, sin impacto significativo.`);
  parts.push(`Temperatura de ${w.temperature}°C (sensación ${w.feelsLike}°C).`);
  return parts.join(" ");
}

function riderImpact(w: WeatherData): string {
  if (w.temperature < 8)
    return `A ${w.temperature}°C el frío fatiga más rápido — descansa más a menudo y lleva ropa térmica.`;
  if (w.temperature > 32)
    return `Calor de ${w.temperature}°C — hidratación frecuente. La chaqueta de malla es tu aliada.`;
  if (w.rainProbability > 50)
    return "La lluvia reduce el agarre hasta un 30%. Aumenta distancia de frenado y reduce inclinación en curvas.";
  if (w.windSpeed > 40)
    return `Viento de ${Math.round(w.windSpeed)} km/h — posición más baja, agarre firme pero no rígido.`;
  return `A ${w.temperature}°C el cuerpo responde bien. Condiciones favorables para disfrutar la ruta.`;
}

function bestWindow(w: WeatherData): string {
  if (w.hourly.length === 0) return "Primera hora de la mañana";
  const best = w.hourly.reduce((b, h) => (h.score > b.score ? h : b), w.hourly[0]);
  return `Alrededor de las ${best.time} (puntuación ${best.score}/100)`;
}

function weatherAlerts(w: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  if (w.stormRisk === "alto")
    alerts.push({ type: "Tormenta", severity: "danger", message: "Tormenta eléctrica prevista. No recomendado rodar." });
  if (w.rainProbability > 70)
    alerts.push({ type: "Lluvia intensa", severity: "danger", message: `${Math.round(w.rainProbability)}% probabilidad de lluvia. Chubasquero obligatorio.` });
  else if (w.rainProbability > 40)
    alerts.push({ type: "Lluvia", severity: "warning", message: `${Math.round(w.rainProbability)}% probabilidad de lluvia. Lleva chubasquero.` });
  if (w.windSpeed > 55)
    alerts.push({ type: "Viento peligroso", severity: "danger", message: `Viento de ${Math.round(w.windSpeed)} km/h. Extrema precaución.` });
  else if (w.windSpeed > 35)
    alerts.push({ type: "Viento fuerte", severity: "warning", message: `Rachas de hasta ${Math.round(w.windGust ?? w.windSpeed)} km/h.` });
  if (w.temperature < 3)
    alerts.push({ type: "Hielo posible", severity: "danger", message: "Temperatura bajo 3°C. Riesgo real de hielo en calzada." });
  if (w.fogProbability > 60)
    alerts.push({ type: "Niebla", severity: "warning", message: "Niebla prevista. Reduce velocidad y usa luces de cruce." });
  return alerts;
}

function roadHazards(w: WeatherData): RoadHazard[] {
  const h: RoadHazard[] = [
    { type: "Neumáticos fríos", probability: "alta", advice: "Primeros 10-15 km suave hasta que el caucho alcance temperatura.", icon: "🌡️" },
  ];
  if (w.rainProbability > 30)
    h.push({ type: "Asfalto mojado", probability: w.rainProbability > 60 ? "muy alta" : "media", advice: "No frenar en mitad de curva. Aumenta distancia de seguridad.", icon: "💧" });
  if (w.windSpeed > 30)
    h.push({ type: "Viento lateral", probability: w.windSpeed > 50 ? "muy alta" : "media", advice: `Anticipa ráfagas del ${windDir(w.windDirection)} con movimientos suaves.`, icon: "💨" });
  if (w.fogProbability > 50)
    h.push({ type: "Niebla", probability: "media", advice: "Luces de cruce encendidas. Reduce velocidad en zonas de niebla.", icon: "🌫️" });
  return h;
}

function buildDangers(w: WeatherData): Danger[] {
  const dangers: Danger[] = [];
  if (w.stormRisk === "alto")
    dangers.push({ id: "d-storm", title: "Tormenta eléctrica", severity: "critical", icon: "⛈️", description: "Tormenta prevista durante la ruta. Condiciones peligrosas.", advice: "Pospón el viaje. Si te pilla en ruta, busca refugio inmediatamente." });
  if (w.rainProbability > 40)
    dangers.push({ id: "d-rain", title: "Lluvia prevista", severity: w.rainProbability > 70 ? "danger" : "warning", icon: "🌧️", description: `${Math.round(w.rainProbability)}% de probabilidad de lluvia.`, advice: "Chubasquero impermeable. El asfalto mojado exige el doble de distancia de frenado." });
  if (w.windSpeed > 35)
    dangers.push({ id: "d-wind", title: "Viento lateral fuerte", severity: w.windSpeed > 55 ? "danger" : "warning", icon: "💨", description: `Viento de ${Math.round(w.windSpeed)} km/h del ${windDir(w.windDirection)}.`, advice: "Reduce velocidad en tramos expuestos. Atención al pasar junto a camiones." });
  if (w.temperature < 8)
    dangers.push({ id: "d-cold", title: "Temperatura baja", severity: w.temperature < 2 ? "danger" : "warning", icon: "🌡️", description: `${w.temperature}°C. Posible hielo en zonas de sombra y puertos.`, advice: "Ropa térmica obligatoria. Comprueba la previsión de hielo en DGT." });
  if (w.fogProbability > 50)
    dangers.push({ id: "d-fog", title: "Niebla posible", severity: "warning", icon: "🌫️", description: "Alta probabilidad de niebla en valles y puertos.", advice: "Luces de cruce en todo momento. Reduce velocidad para mantener distancia." });
  dangers.push({ id: "d-tyre", title: "Neumáticos fríos al salir", severity: "info", icon: "⚠️", description: "Los neumáticos necesitan 10-15 km para alcanzar temperatura de trabajo.", advice: "No fuerces inclinaciones hasta que el caucho esté caliente." });
  return dangers;
}

function buildRecommendations(w: WeatherData, distKm: number, dest: string): string[] {
  const recs: string[] = [];
  const best = w.hourly.length > 0 ? w.hourly.reduce((b, h) => h.score > b.score ? h : b, w.hourly[0]) : null;
  if (best) recs.push(`Sal a las ${best.time} — es el mejor momento del día según las condiciones meteorológicas.`);
  if (distKm > 200) recs.push(`Con ${distKm} km por delante, planifica al menos una parada de descanso cada 1.5-2 horas.`);
  if (w.rainProbability > 30) recs.push("Lleva el chubasquero en el top-case, no en el fondo de la maleta. Si empieza a llover, para antes de calarte.");
  if (w.uvIndex > 6) recs.push(`UV ${w.uvIndex} — protector solar en zonas expuestas como cuello y dorso de las manos.`);
  if (w.windSpeed > 30) recs.push("Con viento, posición más baja y agarre firme. Anticipa los adelantamientos de camiones.");
  recs.push(`Al llegar a ${dest}, busca aparcamiento vigilado y no dejes el casco ni el equipaje visibles.`);
  return recs.slice(0, 5);
}

function buildSummaryText(w: WeatherData, distKm: number, dest: string, score: number): string {
  const cond = score >= 80 ? "excelentes condiciones" : score >= 60 ? "condiciones aceptables" : "condiciones complicadas";
  const rainNote = w.rainProbability > 40 ? "Lleva el chubasquero a mano." : "Asfalto seco esperado en la mayor parte del trayecto.";
  return `La ruta hacia ${dest} presenta ${cond} con ${w.temperature}°C y ${Math.round(w.rainProbability)}% de lluvia prevista. ${rainNote} Con ${distKm} km por delante${w.windSpeed > 30 ? ` y viento de ${Math.round(w.windSpeed)} km/h` : ""}, tómate tu tiempo y disfruta el camino.`;
}

// ─── POI → BestStop ───────────────────────────────────────────────────────────

const OSM_TYPE_DESC: Record<string, string> = {
  cafe:         "Café para reponer fuerzas en ruta.",
  restaurante:  "Restaurante con cocina local.",
  mirador:      "Mirador con vistas panorámicas.",
  foto:         "Spot fotográfico único en esta ruta.",
  combustible:  "Gasolinera para repostar.",
  descanso:     "Punto de descanso en ruta.",
  "moto-cafe":  "Taller y accesorios de moto.",
};

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildAnalysisResult(
  route: RouteInput,
  weather: WeatherData,
  routeData: RouteData | null,
  stops: OSMPlace[],
  emergency: { hospitals: OSMPlace[]; dealers: OSMPlace[]; workshops: OSMPlace[] },
  moto?: { fuelCapacity?: number; consumption?: number }
): AnalysisResult {
  const dest = route.destination.name;
  const consumption  = moto?.consumption  ?? 5.5;
  const fuelCapacity = moto?.fuelCapacity ?? 18;
  const distKm   = routeData?.distanceKm ?? 0;
  const totalFuel = distKm > 0 ? parseFloat(((distKm / 100) * consumption).toFixed(1)) : 0;
  const range     = Math.round((fuelCapacity / consumption) * 100);
  const fuelStopsNeeded = distKm > 0 ? Math.max(0, Math.ceil(distKm / range) - 1) : 0;

  const overallScore = scoreFromWeather(weather);
  const cold  = weather.temperature < 10;
  const hot   = weather.temperature > 28;
  const rainy = weather.rainProbability > 40;
  const windy = weather.windSpeed > 40;

  // Score timeline from hourly data
  const timeline: ScoreTimelineEntry[] = weather.hourly.slice(0, 6).map((h, i, arr) => ({
    time:        h.time,
    score:       h.score,
    label:       rating(h.score),
    explanation: h.scoreExplanation,
    trend:       i === 0 ? "stable" : h.score > arr[i - 1].score ? "up" : h.score < arr[i - 1].score ? "down" : "stable",
  }));

  // BestStops: real OSM POIs first, then fallback placeholders so the card always renders
  const osmStops: BestStop[] = stops.slice(0, 4).map((p, i) => ({
    id:                `stop-${p.id}`,
    name:              p.name,
    type:              (p.type as BestStop["type"]) ?? "descanso",
    description:       OSM_TYPE_DESC[p.type] ?? "Parada en ruta.",
    rating:            parseFloat((4.0 + Math.random() * 0.9).toFixed(1)),
    distanceFromStart: distKm > 0 ? Math.round(distKm * (0.15 + i * 0.18)) : 0,
    distanceRemaining: distKm > 0 ? Math.round(distKm * (0.85 - i * 0.18)) : 0,
    why:               `A ${p.distanceKm} km del destino — buena parada en esta ${p.type === "fuel" ? "gasolinera" : "zona"}.`,
    coordinates:       { lat: p.lat, lng: p.lng },
  }));

  const fallbackStops: BestStop[] = osmStops.length < 2
    ? [
        { id: "ai-1", name: `Mirador cerca de ${dest}`, type: "mirador", description: "Parada con vistas panorámicas en la ruta.", why: "Un buen punto para descansar y disfrutar del paisaje antes de llegar.", rating: 4.5, distanceFromStart: distKm > 0 ? Math.round(distKm * 0.4) : 0, distanceRemaining: distKm > 0 ? Math.round(distKm * 0.6) : 0 },
        { id: "ai-2", name: `Café de ruta`, type: "cafe", description: "Café tranquilo ideal para reponer fuerzas a mitad de camino.", why: "Pausa perfecta para estirar las piernas y tomar un café antes del tramo final.", rating: 4.3, distanceFromStart: distKm > 0 ? Math.round(distKm * 0.55) : 0, distanceRemaining: distKm > 0 ? Math.round(distKm * 0.45) : 0 },
        { id: "ai-3", name: `Restaurante local en ${dest}`, type: "restaurante", description: "Cocina local auténtica — el mejor cierre para una buena ruta.", why: "Mereces un buen plato al llegar. La gastronomía local es parte de la experiencia.", rating: 4.6, distanceFromStart: distKm > 0 ? Math.round(distKm * 0.95) : 0, distanceRemaining: distKm > 0 ? Math.round(distKm * 0.05) : 0 },
        { id: "ai-4", name: `Spot fotográfico`, type: "foto", description: "Punto icónico de la ruta ideal para una foto memorable.", why: "Este tramo ofrece una perspectiva única — no pases sin parar a inmortalizar el momento.", rating: 4.4, distanceFromStart: distKm > 0 ? Math.round(distKm * 0.25) : 0, distanceRemaining: distKm > 0 ? Math.round(distKm * 0.75) : 0 },
      ]
    : [];

  const bestStops: BestStop[] = [...osmStops, ...fallbackStops];

  // Fuel stops: use real gas stations from OSM if available
  const gasPOIs = stops.filter(s => s.type === "fuel");
  const fuelStops = fuelStopsNeeded > 0 && distKm > 0
    ? gasPOIs.length > 0
      ? gasPOIs.slice(0, fuelStopsNeeded).map(g => ({
          km:          Math.round(distKm * 0.5),
          name:        g.name,
          coordinates: { lat: g.lat, lng: g.lng },
        }))
      : [{ km: Math.round(range * 0.8) }]
    : [];

  // Emergency from real OSM data
  const hospitals = emergency.hospitals.map(h => ({
    name:        h.name,
    address:     h.address || "Consultar en maps",
    distance:    h.distanceKm ?? 0,
    phone:       h.phone ?? "112",
    coordinates: { lat: h.lat, lng: h.lng },
  }));
  const bmwDealers = emergency.dealers.map(d => ({
    name:        d.name,
    address:     d.address || "Consultar en maps",
    distance:    d.distanceKm ?? 0,
    phone:       d.phone,
    coordinates: { lat: d.lat, lng: d.lng },
  }));

  return {
    id:        `analysis-${Date.now()}`,
    route,
    createdAt: new Date(),

    overallScore,
    overallRating: rating(overallScore),
    recommendation:
      overallScore >= 80 ? `Buen día para rodar hacia ${dest}` :
      overallScore >= 60 ? `Condiciones aceptables hacia ${dest}` :
      `Precaución recomendada hacia ${dest}`,

    summary: {
      distance:       distKm,
      duration:       routeData?.durationFormatted ?? "—",
      sunrise:        weather.sunrise,
      sunset:         weather.sunset,
      fuelStops:      fuelStopsNeeded,
      difficulty:     distKm > 400 ? "Exigente" : distKm > 200 ? "Moderado" : distKm > 0 ? "Tranquilo" : "Moderado",
      recommendation: `Sal entre ${weather.sunrise} y las 09:00 para aprovechar las mejores condiciones.`,
    },

    weather: {
      data:           weather,
      interpretation: weatherInterpretation(weather),
      riderImpact:    riderImpact(weather),
      bestWindow:     bestWindow(weather),
      alerts:         weatherAlerts(weather),
    },

    roadConditions: {
      gripLevel:       weather.rainProbability > 60 ? "Reducido" : weather.rainProbability > 30 ? "Bueno" : "Óptimo",
      roadTemperature: Math.max(weather.temperature - 3, 0),
      dangerScore:     Math.max(0, 100 - overallScore),
      surface:         "Asfalto convencional. Consulta DGT para obras en tiempo real.",
      interpretation:  `Agarre ${weather.rainProbability > 40 ? "reducido por lluvia" : "óptimo"} a ${weather.temperature}°C. ${weather.rainProbability > 30 ? "Precaución en mojado." : "Condiciones secas favorables."}`,
      hazards:         roadHazards(weather),
    },

    riderPrep: {
      helmetVisor:     weather.cloudCover > 60 ? "Clara o fotocromática" : "Ahumada o espejada — buena luminosidad",
      baseLayer:       cold ? "Camiseta térmica de manga larga" : hot ? "Camiseta técnica transpirable" : "Camiseta técnica ligera",
      jacket:          cold ? "Chaqueta con forro térmico e impermeable" : hot ? "Chaqueta de malla con ventilación máxima" : "Chaqueta de entretiempo con ventilación",
      waterproofs:     rainy,
      gloves:          cold ? "Guantes de invierno impermeables" : hot ? "Guantes de verano cortos" : "Guantes de entretiempo",
      boots:           "Botas de moto homologadas",
      neckWarmer:      cold,
      coolingVest:     hot && weather.uvIndex > 7,
      rainSuit:        weather.rainProbability > 30,
      tyrePressureNote: windy ? "Comprueba presiones — el viento exige mayor estabilidad" : undefined,
      hydration:       hot ? `Lleva 2L de agua — calor + UV ${weather.uvIndex} son agotadores` : `Lleva 1.5L de agua. UV actual: ${weather.uvIndex}`,
      summary:         rainy ? "Equípate para lluvia: chubasquero, guantes impermeables." : cold ? "Ropa térmica obligatoria. El frío en moto se siente mucho más." : hot ? "Equipo de verano. Hidratación cada 1.5 horas." : "Equipamiento de entretiempo. Chubasquero accesible.",
    },

    motoPrep: {
      checklist: [
        { item: "Combustible", priority: "esencial", note: distKm > 0 ? `Necesitas ~${totalFuel}L para ${distKm} km` : "Sal con el depósito lleno" },
        { item: "Presión de neumáticos", priority: "esencial", note: "Comprueba en frío antes de salir" },
        { item: "Luces", priority: "esencial" },
        { item: "Frenos", priority: "esencial" },
        { item: "Cadena", priority: "recomendado", note: "Lubrica si lleva más de 500 km" },
        { item: "Documentación", priority: "esencial" },
        { item: "Kit de pinchazos", priority: "recomendado" },
        { item: "Botiquín básico", priority: "recomendado" },
      ],
      adjustments: windy
        ? ["Aumenta 0.2 bar en neumáticos para mayor estabilidad", "Revisa sujeción del equipaje"]
        : ["Ajusta los amortiguadores si llevas equipaje o pasajero"],
      summary: distKm > 0
        ? `Revisión estándar pre-viaje. Combustible para ${distKm} km (~${totalFuel}L).`
        : "Revisión estándar pre-viaje. Presta atención al combustible.",
    },

    routeInsights: {
      highlights:        [],
      roadQuality:       "Calidad de asfalto variable según tramo. Consulta DGT para obras actuales en ruta.",
      famousRoads:       [],
      speedCameras:      0,
      tunnels:           0,
      ferries:           0,
      borderCrossings:   0,
      totalElevationGain: 0,
      passes:            [],
    },

    bestStops,
    dangers: buildDangers(weather),

    aiRecommendations: buildRecommendations(weather, distKm, dest),

    equipmentAdvice: {
      essential:    ["Agua (1.5L mínimo)", "Documentación en funda impermeable", rainy ? "Chubasquero impermeable" : "Gafas de sol"],
      recommended:  ["Kit de reparación de pinchazos", "Cargador portátil", "Auriculares con navegación"],
      optional:     ["Cámara de acción", "Soporte de móvil articulado", "Chaleco de alta visibilidad"],
      doNotForget:  ["Carné de conducir", "Seguro de la moto", "Dinero en efectivo para zonas rurales"],
    },

    fuelPlanning: {
      estimatedConsumption: consumption,
      totalFuelNeeded:      totalFuel,
      range,
      stops:               fuelStops,
      premiumAvailable:    true,
    },

    scoreTimeline: timeline.length > 0 ? timeline : [
      { time: "08:00", score: overallScore, label: rating(overallScore), explanation: "Condiciones al inicio del día", trend: "stable" },
    ],

    aiSummary: buildSummaryText(weather, distKm, dest, overallScore),

    emergency: {
      hospitals: hospitals.length > 0 ? hospitals : [
        { name: "Servicio de Emergencias", address: "Llama al 112", distance: 0, phone: "112" },
      ],
      bmwDealers,
      workshops: [],
      emergencyNumbers: [
        { name: "Emergencias", number: "112", country: "España" },
        { name: "Guardia Civil Tráfico", number: "062", country: "España" },
        { name: "DGT Información", number: "900 123 505", country: "España" },
      ],
    },
  };
}
