import type { AnalysisResult, WeatherData } from "@/types";
import type { RouteData } from "@/lib/routing/osrm";
import type { OSMPlace } from "@/lib/pois/overpass";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Enrichment prompt: Claude receives REAL data and is asked only to improve the
 * prose/interpretation fields. Facts (distances, temperatures, coordinates) come
 * from real APIs and are never invented by the AI.
 */
export function buildEnrichmentPrompt(
  base: AnalysisResult,
  weather: WeatherData,
  routeData: RouteData | null,
  stops: OSMPlace[]
): string {
  const dest     = base.route.destination.name;
  const origin   = base.route.origin?.name ?? "ubicación del usuario";
  const dateStr  = format(base.route.date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  const routeBlock = routeData
    ? `- Distancia real (OSRM): ${routeData.distanceKm} km\n- Tiempo estimado de conducción: ${routeData.durationFormatted}`
    : `- Distancia: no calculada (origen no proporcionado)`;

  const stopsBlock = stops.length > 0
    ? stops.slice(0, 6).map(s => `  • ${s.name} (${s.type}, a ${s.distanceKm} km del destino)`).join("\n")
    : "  • No se encontraron paradas en OpenStreetMap";

  const dangersBlock = base.dangers.map(d => `  • [${d.id}] ${d.title} (${d.severity})`).join("\n");
  const stopsIdBlock = base.bestStops.map(s => `  • [${s.id}] ${s.name} (${s.type})`).join("\n");

  return `Eres Rodamos AI — el mejor compañero de viaje para motociclistas. Hablas en español con entusiasmo real, como un amigo que ha hecho miles de kilómetros en moto.

RUTA:
- Origen: ${origin}
- Destino: ${dest}
- Fecha: ${dateStr}
${routeBlock}

DATOS METEOROLÓGICOS REALES (de Open-Meteo API):
- Temperatura: ${weather.temperature}°C (sensación térmica: ${weather.feelsLike}°C)
- Viento: ${weather.windSpeed} km/h (rachas: ${weather.windGust ?? "—"} km/h, dirección: ${weather.windDirection}°)
- Probabilidad de lluvia: ${weather.rainProbability}%
- Humedad: ${weather.humidity}%
- Visibilidad: ${weather.visibility} km
- Índice UV: ${weather.uvIndex}
- Niebla: ${weather.fogProbability}%
- Riesgo tormenta: ${weather.stormRisk}
- Amanecer / Atardecer: ${weather.sunrise} / ${weather.sunset}
- Descripción: ${weather.description}

PARADAS REALES (de OpenStreetMap):
${stopsBlock}

ANÁLISIS BASE YA CALCULADO:
- Score global: ${base.overallScore}/100 (${base.overallRating})
- Dificultad: ${base.summary.difficulty}
- Agarre: ${base.roadConditions.gripLevel}
- Peligros identificados:
${dangersBlock}
- Paradas sugeridas (IDs):
${stopsIdBlock}

INSTRUCCIONES:
Enriquece los campos de texto con tu voz de motero apasionado. No cambies temperaturas, distancias ni coordenadas reales.

Devuelve SOLO este JSON válido (sin markdown, sin texto extra):

{
  "recommendation": "<frase directa de máx 80 chars>",
  "summary": {
    "recommendation": "<consejo de salida en 1 frase, menciona la hora óptima>${weather.sunrise}"
  },
  "weather": {
    "interpretation": "<2-3 frases sobre lo que significa este clima para el piloto, muy específico>",
    "riderImpact": "<1-2 frases sobre cómo afecta al cuerpo del piloto>",
    "bestWindow": "<ventana horaria concreta, basada en amanecer ${weather.sunrise} y lluvia ${weather.rainProbability}%>",
    "alerts": [
      { "type": "<tipo>", "severity": "<info|warning|danger>", "message": "<mensaje concreto>" }
    ]
  },
  "roadConditions": {
    "interpretation": "<2 frases sobre el agarre y las condiciones del asfalto a ${weather.temperature}°C>",
    "surface": "<descripción del asfalto esperado en esta ruta>"
  },
  "riderPrep": {
    "helmetVisor": "<recomendación de visera para ${weather.cloudCover}% de nubosidad>",
    "baseLayer": "<capa base para ${weather.temperature}°C>",
    "jacket": "<chaqueta ideal para estas condiciones>",
    "gloves": "<guantes ideales>",
    "hydration": "<recomendación de hidratación>",
    "summary": "<resumen del equipamiento en 1-2 frases>"
  },
  "motoPrep": {
    "summary": "<resumen pre-viaje en 1 frase>"
  },
  "routeInsights": {
    "highlights": [],
    "roadQuality": "<descripción de la calidad del asfalto esperada en esta ruta>",
    "famousRoads": [],
    "speedCameras": 0,
    "tunnels": 0,
    "ferries": 0,
    "borderCrossings": 0,
    "totalElevationGain": 0,
    "passes": []
  },
  "dangers": [
    ${base.dangers.map(d => `{ "id": "${d.id}", "description": "<descripción específica del peligro>", "advice": "<consejo accionable concreto>" }`).join(",\n    ")}
  ],
  "aiRecommendations": [
    "<recomendación personal en 1ª persona — específica para ${dest} y ${weather.temperature}°C>",
    "<recomendación sobre el momento de salida o paradas>",
    "<recomendación sobre equipamiento o seguridad>",
    "<recomendación final o curiosidad de la ruta>"
  ],
  "aiSummary": "<párrafo de 3-4 frases. Cálido, apasionado, habla de lo mejor de esta ruta específica. Sin caracteres especiales. Menciona el clima real (${weather.temperature}°C, ${weather.rainProbability}% lluvia).>"
}`;
}
