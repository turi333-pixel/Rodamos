// ─── Location & Route ────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  name: string;
  address?: string;
  coordinates: Coordinates;
  type: "gps" | "search" | "manual" | "gpx" | "saved";
}

export interface RouteInput {
  origin?: Location;
  destination: Location;
  date: Date;
  waypoints?: Location[];
  gpxData?: string;
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust?: number;
  crosswindRisk: "bajo" | "moderado" | "alto" | "extremo";
  rainProbability: number;
  rainAmount?: number;
  fogProbability: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  stormRisk: "bajo" | "moderado" | "alto";
  description: string;
  icon: string;
  sunrise: string;
  sunset: string;
  hourly: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  rainProbability: number;
  windSpeed: number;
  visibility: number;
  icon: string;
  score: number;
  scoreExplanation: string;
}

// ─── Analysis Result ──────────────────────────────────────────────────────────

export interface AnalysisResult {
  id: string;
  route: RouteInput;
  createdAt: Date;

  overallScore: number;
  overallRating: "Excelente" | "Muy Bueno" | "Bueno" | "Aceptable" | "Arriesgado" | "No Recomendado";
  recommendation: string;

  summary: GeneralSummary;
  weather: WeatherIntelligence;
  roadConditions: RoadConditions;
  riderPrep: RiderPreparation;
  motoPrep: MotorcyclePreparation;
  routeInsights: RouteInsights;
  bestStops: BestStop[];
  dangers: Danger[];
  aiRecommendations: string[];
  equipmentAdvice: EquipmentAdvice;
  fuelPlanning: FuelPlanning;
  scoreTimeline: ScoreTimelineEntry[];
  aiSummary: string;
  emergency: EmergencyInfo;
}

export interface GeneralSummary {
  distance: number;
  duration: string;
  sunrise: string;
  sunset: string;
  fuelStops: number;
  difficulty: "Tranquilo" | "Moderado" | "Exigente" | "Extremo";
  recommendation: string;
}

export interface WeatherIntelligence {
  data: WeatherData;
  interpretation: string;
  riderImpact: string;
  bestWindow: string;
  worstWindow?: string;
  alerts: WeatherAlert[];
}

export interface WeatherAlert {
  type: string;
  severity: "info" | "warning" | "danger";
  message: string;
}

export interface RoadConditions {
  gripLevel: "Óptimo" | "Bueno" | "Reducido" | "Malo" | "Peligroso";
  roadTemperature: number;
  dangerScore: number;
  hazards: RoadHazard[];
  surface: string;
  interpretation: string;
}

export interface RoadHazard {
  type: string;
  probability: "baja" | "media" | "alta" | "muy alta";
  advice: string;
  icon: string;
}

export interface RiderPreparation {
  helmetVisor: string;
  baseLayer: string;
  jacket: string;
  waterproofs: boolean;
  gloves: string;
  boots: string;
  neckWarmer: boolean;
  coolingVest: boolean;
  rainSuit: boolean;
  tyrePressureNote?: string;
  hydration: string;
  summary: string;
}

export interface MotorcyclePreparation {
  checklist: ChecklistItem[];
  adjustments: string[];
  summary: string;
}

export interface ChecklistItem {
  item: string;
  priority: "esencial" | "recomendado" | "opcional";
  note?: string;
  checked?: boolean;
}

export interface RouteInsights {
  highlights: RouteHighlight[];
  roadQuality: string;
  famousRoads: string[];
  speedCameras: number;
  tunnels: number;
  ferries: number;
  borderCrossings: number;
  totalElevationGain: number;
  passes: string[];
}

export interface RouteHighlight {
  name: string;
  type: "mirador" | "parque" | "puerto" | "carretera" | "foto" | "patrimonio";
  description: string;
  km: number;
}

export interface BestStop {
  id: string;
  name: string;
  type: "cafe" | "restaurante" | "mirador" | "combustible" | "moto-cafe" | "foto" | "descanso";
  description: string;
  rating: number;
  distanceFromStart: number;
  distanceRemaining: number;
  why: string;
  imageUrl?: string;
  coordinates?: Coordinates;
}

export interface Danger {
  id: string;
  title: string;
  severity: "info" | "warning" | "danger" | "critical";
  icon: string;
  description: string;
  advice: string;
  km?: number;
}

export interface EquipmentAdvice {
  essential: string[];
  recommended: string[];
  optional: string[];
  doNotForget: string[];
}

export interface FuelPlanning {
  estimatedConsumption: number;
  totalFuelNeeded: number;
  range: number;
  stops: FuelStop[];
  cheapestStations?: string[];
  premiumAvailable: boolean;
}

export interface FuelStop {
  km: number;
  name?: string;
  coordinates?: Coordinates;
  price?: number;
}

export interface ScoreTimelineEntry {
  time: string;
  score: number;
  label: string;
  explanation: string;
  trend: "up" | "down" | "stable";
}

export interface EmergencyInfo {
  hospitals: EmergencyPlace[];
  bmwDealers: EmergencyPlace[];
  workshops: EmergencyPlace[];
  emergencyNumbers: EmergencyNumber[];
  nearestFuel?: EmergencyPlace;
}

export interface EmergencyPlace {
  name: string;
  address: string;
  phone?: string;
  distance: number;
  coordinates?: Coordinates;
}

export interface EmergencyNumber {
  name: string;
  number: string;
  country: string;
}

// ─── Garage / Motorcycle ──────────────────────────────────────────────────────

export interface Motorcycle {
  id: string;
  userId: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  engineCC: number;
  color: string;
  plateNumber?: string;
  vin?: string;
  imageUrl?: string;
  fuelCapacity: number;
  consumption: number;
  tyreFront: TyreInfo;
  tyreRear: TyreInfo;
  serviceRecords: ServiceRecord[];
  insuranceExpiry?: Date;
  itvExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TyreInfo {
  brand?: string;
  model?: string;
  size: string;
  installedAt?: Date;
  km: number;
  pressureCold: number;
  pressureLoaded?: number;
}

export interface ServiceRecord {
  id: string;
  date: Date;
  km: number;
  type: string;
  description: string;
  cost?: number;
  workshop?: string;
}

// ─── Saved Routes / History ───────────────────────────────────────────────────

export interface SavedRoute {
  id: string;
  userId: string;
  name: string;
  route: RouteInput;
  analysis?: AnalysisResult;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  createdAt: Date;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  defaultMotorcycleId?: string;
  preferredAiModel?: string;
  units: "metric" | "imperial";
  language: "es";
  createdAt: Date;
}

// ─── App State ────────────────────────────────────────────────────────────────

export type AppView = "home" | "analyze" | "history" | "favorites" | "settings";

export type AnalysisStatus = "idle" | "loading" | "streaming" | "complete" | "error";
