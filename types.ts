
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CycloneTrackPoint extends Coordinate {
  timestamp: string; // ISO string
  windSpeedKmph: number;
  pressureHpa: number;
  category: string; // e.g., "Severe Cyclonic Storm"
  isForecast: boolean;
}

export interface EnsembleMember {
  id: number;
  path: Coordinate[];
  color: string;
}

export interface DistrictRisk {
  id: string;
  name: string;
  state: string;
  riskScore: number; // 0-10
  riskCiLower: number; // Confidence Interval Lower Bound
  riskCiUpper: number; // Confidence Interval Upper Bound
  populationAffected: number;
  criticalInfrastructureCount: number;
  lat: number;
  lng: number;
}

export interface Earthquake {
  id: string;
  magnitude: number;
  depthKm: number;
  lat: number;
  lng: number;
  timestamp: string;
  location: string;
}

export interface FloodZone {
  id: string;
  riskLevel: 'MODERATE' | 'HIGH' | 'SEVERE';
  coordinates: Coordinate[]; // Simple polygon
}

export interface Shelter {
  id: string;
  name: string;
  capacity: number;
  occupied: number;
  lat: number;
  lng: number;
  type: 'SCHOOL' | 'COMMUNITY_HALL' | 'BUNKER';
}

export interface PowerPlant {
  id: string;
  name: string;
  type: 'COAL' | 'NUCLEAR' | 'GAS';
  outputMw: number;
  lat: number;
  lng: number;
}

export interface EvacuationRoute {
  id: string;
  fromDistrictId: string;
  toShelterId: string;
  path: Coordinate[];
  status: 'OPEN' | 'CONGESTED' | 'BLOCKED';
}

export interface SimulationState {
  currentTimeIndex: number;
  isPlaying: boolean;
  selectedDistrict: DistrictRisk | null;
  showEnsembles: boolean;
}

export enum MapViewMode {
  TRACK = 'TRACK',
  HEATMAP = 'HEATMAP',
  IMPACT = 'IMPACT'
}

export interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string; // e.g., "Gemini Flash", "Cyclone Track API"
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  latencyMs: number;
  details: string;
}

export interface Basin {
  id: string;
  name: string;
  agency: string;
  countries: string[];
  defaultCenter: Coordinate;
}

export interface SimulationData {
  track: CycloneTrackPoint[];
  ensembles: EnsembleMember[];
  districts: DistrictRisk[];
  floodZones: FloodZone[];
  shelters: Shelter[];
  powerPlants: PowerPlant[];
  evacRoutes: EvacuationRoute[];
  earthquakes: Earthquake[];
}

// Agent Types
export type AgentActionType = 'NAVIGATE' | 'ALERT';

export interface AgentAction {
  type: AgentActionType;
  payload: any;
}

export interface AgentResponse {
  text: string;
  newHistory: any[];
  action?: AgentAction;
}
