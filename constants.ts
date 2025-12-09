
import { CycloneTrackPoint, DistrictRisk, EnsembleMember, Earthquake, FloodZone, Shelter, PowerPlant, EvacuationRoute, Coordinate, Basin, SimulationData } from './types';

// Initial start point: Focused to show Sri Lanka and South India
export const INITIAL_CENTER = { lat: 9.0, lng: 81.0 };
export const INITIAL_ZOOM = 6;

// --- GLOBAL BASIN REGISTRY ---
export const GLOBAL_BASINS: Basin[] = [
  { id: 'ni', name: 'North Indian', agency: 'IMD+ECMWF', countries: ['India', 'Bangladesh', 'Sri Lanka', 'Myanmar'], defaultCenter: { lat: 9.0, lng: 81.0 } },
  { id: 'na', name: 'North Atlantic', agency: 'NHC+NOAA', countries: ['USA', 'Mexico', 'Cuba', 'Bahamas'], defaultCenter: { lat: 26.0, lng: -80.0 } }, // Florida
  { id: 'ep', name: 'Eastern Pacific', agency: 'NHC', countries: ['Mexico', 'Guatemala'], defaultCenter: { lat: 18.0, lng: -105.0 } },
  { id: 'wp', name: 'Western Pacific', agency: 'JMA+GFS', countries: ['Japan', 'Philippines', 'China'], defaultCenter: { lat: 20.0, lng: 130.0 } },
  { id: 'si', name: 'SW Indian', agency: 'MeteoFrance', countries: ['Madagascar', 'Mozambique'], defaultCenter: { lat: -20.0, lng: 55.0 } },
  { id: 'au', name: 'Australian', agency: 'BoM', countries: ['Australia', 'Indonesia'], defaultCenter: { lat: -15.0, lng: 130.0 } },
  { id: 'sp', name: 'South Pacific', agency: 'FMS', countries: ['Fiji', 'Vanuatu'], defaultCenter: { lat: -18.0, lng: 178.0 } },
];

export const MOCK_REGIONS: Record<string, string[]> = {
  'India': ['Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal'],
  'USA': ['Florida', 'Texas', 'Louisiana', 'South Carolina'],
  'Japan': ['Kanto', 'Kansai', 'Tohoku', 'Kyushu'],
  'Philippines': ['Luzon', 'Visayas', 'Mindanao'],
  'Australia': ['Queensland', 'Northern Territory', 'Western Australia'],
  'Mexico': ['Yucatan', 'Veracruz', 'Quintana Roo'],
  'Madagascar': ['Antananarivo', 'Toamasina'],
};

export const REGION_CENTERS: Record<string, Coordinate> = {
  // Countries
  'India': { lat: 20.5937, lng: 78.9629 },
  'USA': { lat: 37.0902, lng: -95.7129 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Philippines': { lat: 12.8797, lng: 121.7740 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
  'Madagascar': { lat: -18.7669, lng: 46.8691 },
  
  // Regions - India
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },

  // Regions - USA
  'Florida': { lat: 27.6648, lng: -81.5158 },
  'Texas': { lat: 31.9686, lng: -99.9018 },
  'Louisiana': { lat: 30.9843, lng: -91.9623 },
  'South Carolina': { lat: 33.8361, lng: -81.1637 },

  // Regions - Japan
  'Kanto': { lat: 35.7090, lng: 139.7320 }, // Tokyoish
  'Kansai': { lat: 34.6937, lng: 135.5023 }, // Osakaish
  'Tohoku': { lat: 38.2682, lng: 140.8694 }, // Sendaish
  'Kyushu': { lat: 33.5904, lng: 130.4017 }, // Fukuokaish

  // Regions - Philippines
  'Luzon': { lat: 16.5662, lng: 121.2626 },
  'Visayas': { lat: 11.0000, lng: 123.5000 },
  'Mindanao': { lat: 8.0000, lng: 125.0000 },

  // Regions - Australia
  'Queensland': { lat: -20.9176, lng: 142.7028 },
  'Northern Territory': { lat: -19.4914, lng: 132.5510 },
  'Western Australia': { lat: -27.6728, lng: 121.6283 },

  // Regions - Mexico
  'Yucatan': { lat: 20.4005, lng: -89.1349 },
  'Veracruz': { lat: 19.1738, lng: -96.1342 },
  'Quintana Roo': { lat: 19.1817, lng: -88.4791 },

  // Regions - Madagascar
  'Antananarivo': { lat: -18.8792, lng: 47.5079 },
  'Toamasina': { lat: -18.1492, lng: 49.4023 },
};

// --- BASE DATA (NORTH INDIAN - CYCLONE DITWAH) ---

export const CYCLONE_TRACK: CycloneTrackPoint[] = [
  // Nov 26: Formation off SE Sri Lanka
  { lat: 5.8, lng: 84.5, timestamp: "2025-11-26T00:00:00Z", windSpeedKmph: 45, pressureHpa: 1004, category: "Depression", isForecast: false },
  { lat: 6.2, lng: 83.8, timestamp: "2025-11-26T12:00:00Z", windSpeedKmph: 50, pressureHpa: 1002, category: "Deep Depression", isForecast: false },
  // Nov 27: Intensification & Peak (Sri Lanka Approach) - Red Alert SL
  { lat: 6.8, lng: 82.5, timestamp: "2025-11-27T00:00:00Z", windSpeedKmph: 65, pressureHpa: 998, category: "Cyclonic Storm", isForecast: false },
  { lat: 7.2, lng: 81.9, timestamp: "2025-11-27T12:00:00Z", windSpeedKmph: 75, pressureHpa: 996, category: "Cyclonic Storm", isForecast: false },
  // Nov 28: Crossing Sri Lanka (Devastation/Floods) - Red Alert TN
  { lat: 7.8, lng: 81.2, timestamp: "2025-11-28T00:00:00Z", windSpeedKmph: 70, pressureHpa: 998, category: "Cyclonic Storm", isForecast: false },
  { lat: 8.5, lng: 80.5, timestamp: "2025-11-28T12:00:00Z", windSpeedKmph: 60, pressureHpa: 1000, category: "Deep Depression", isForecast: false },
  // Nov 29: Exiting to Bay of Bengal (Heading North to TN/AP) - Op. Sagar Bandhu launch
  { lat: 9.8, lng: 80.6, timestamp: "2025-11-29T00:00:00Z", windSpeedKmph: 55, pressureHpa: 1000, category: "Deep Depression", isForecast: false },
  { lat: 10.9, lng: 80.5, timestamp: "2025-11-29T12:00:00Z", windSpeedKmph: 60, pressureHpa: 998, category: "Deep Depression", isForecast: true },
  // Nov 30: Stalling near TN/Puducherry Coast (No Landfall)
  { lat: 11.5, lng: 80.3, timestamp: "2025-11-30T00:00:00Z", windSpeedKmph: 55, pressureHpa: 1000, category: "Deep Depression", isForecast: true },
  { lat: 11.8, lng: 80.2, timestamp: "2025-11-30T12:00:00Z", windSpeedKmph: 50, pressureHpa: 1002, category: "Deep Depression", isForecast: true },
  // Dec 1: Hovering near Chennai (Catastrophic Rain/Waterlogging)
  { lat: 12.2, lng: 80.3, timestamp: "2025-12-01T00:00:00Z", windSpeedKmph: 45, pressureHpa: 1004, category: "Deep Depression", isForecast: true },
  { lat: 12.5, lng: 80.2, timestamp: "2025-12-01T12:00:00Z", windSpeedKmph: 40, pressureHpa: 1004, category: "Depression", isForecast: true },
  // Dec 2: Moving Inland/SW (Weakening)
  { lat: 12.7, lng: 79.9, timestamp: "2025-12-02T00:00:00Z", windSpeedKmph: 35, pressureHpa: 1006, category: "Depression", isForecast: true },
  { lat: 12.5, lng: 79.5, timestamp: "2025-12-02T12:00:00Z", windSpeedKmph: 30, pressureHpa: 1008, category: "Low Pressure Area", isForecast: true },
  // Dec 3: Dissipation
  { lat: 12.1, lng: 79.2, timestamp: "2025-12-03T00:00:00Z", windSpeedKmph: 20, pressureHpa: 1010, category: "Dissipated", isForecast: true },
];

export const IMD_OBSERVED_TRACK: Coordinate[] = [
  { lat: 5.8, lng: 84.5 }, { lat: 6.8, lng: 82.5 }, { lat: 7.8, lng: 81.2 },
  { lat: 9.8, lng: 80.6 }, { lat: 11.5, lng: 80.3 }, { lat: 12.2, lng: 80.3 },
  { lat: 12.7, lng: 79.9 }, { lat: 12.1, lng: 79.2 },
];

export const LEGACY_MODEL_TRACK: Coordinate[] = [
  { lat: 5.8, lng: 84.5 }, { lat: 7.0, lng: 83.0 }, { lat: 8.5, lng: 82.0 },
  { lat: 10.5, lng: 81.5 }, { lat: 12.0, lng: 81.2 }, { lat: 13.5, lng: 80.8 },
  { lat: 14.8, lng: 80.2 }, { lat: 16.0, lng: 79.5 },
];

export const DISTRICTS: DistrictRisk[] = [
  { id: "tn1", name: "Chennai", state: "Tamil Nadu", riskScore: 8.9, riskCiLower: 8.5, riskCiUpper: 9.3, populationAffected: 8500000, criticalInfrastructureCount: 120, lat: 13.0827, lng: 80.2707 },
  { id: "tn2", name: "Chengalpattu", state: "Tamil Nadu", riskScore: 8.5, riskCiLower: 8.0, riskCiUpper: 9.0, populationAffected: 2800000, criticalInfrastructureCount: 45, lat: 12.693, lng: 80.003 },
  { id: "tn3", name: "Nagapattinam", state: "Tamil Nadu", riskScore: 7.2, riskCiLower: 6.8, riskCiUpper: 7.6, populationAffected: 1600000, criticalInfrastructureCount: 20, lat: 10.76, lng: 79.84 },
  { id: "tn4", name: "Ramanathapuram", state: "Tamil Nadu", riskScore: 6.5, riskCiLower: 6.0, riskCiUpper: 7.0, populationAffected: 1300000, criticalInfrastructureCount: 15, lat: 9.36, lng: 78.83 },
  { id: "tn5", name: "Cuddalore", state: "Tamil Nadu", riskScore: 7.8, riskCiLower: 7.2, riskCiUpper: 8.4, populationAffected: 2600000, criticalInfrastructureCount: 25, lat: 11.748, lng: 79.771 }
];

export const EARTHQUAKES: Earthquake[] = [
  { id: "eq1", magnitude: 4.8, depthKm: 15, lat: 10.5, lng: 92.5, timestamp: "2025-11-26T04:30:00Z", location: "Andaman Sea" }
];

export const FLOOD_ZONES: FloodZone[] = [
  { id: "fz1", riskLevel: "SEVERE", coordinates: [{ lat: 13.00, lng: 80.20 }, { lat: 13.02, lng: 80.25 }, { lat: 12.98, lng: 80.26 }, { lat: 12.96, lng: 80.22 }] },
  { id: "fz2", riskLevel: "HIGH", coordinates: [{ lat: 12.55, lng: 80.10 }, { lat: 12.60, lng: 80.15 }, { lat: 12.50, lng: 80.18 }, { lat: 12.45, lng: 80.12 }] }
];

export const SHELTERS: Shelter[] = [
  { id: "s1", name: "Chennai Corp. Community Hall", capacity: 5000, occupied: 3200, lat: 13.05, lng: 80.22, type: 'COMMUNITY_HALL' },
  { id: "s2", name: "Mahabalipuram Govt School", capacity: 2000, occupied: 1850, lat: 12.62, lng: 80.17, type: 'SCHOOL' },
  { id: "s3", name: "Kalpakkam Safety Bunker", capacity: 3000, occupied: 450, lat: 12.55, lng: 80.16, type: 'BUNKER' }
];

export const POWER_PLANTS: PowerPlant[] = [
  { id: "pp1", name: "North Chennai Thermal", type: "COAL", outputMw: 1830, lat: 13.24, lng: 80.32 },
  { id: "pp2", name: "MAPS (Madras Atomic)", type: "NUCLEAR", outputMw: 440, lat: 12.55, lng: 80.17 },
  { id: "pp3", name: "Neyveli Lignite Corp", type: "COAL", outputMw: 3940, lat: 11.59, lng: 79.46 }
];

export const EVACUATION_ROUTES: EvacuationRoute[] = [
  { id: "er1", fromDistrictId: "tn1", toShelterId: "s1", status: "BLOCKED", path: [{ lat: 13.0827, lng: 80.2707 }, { lat: 13.07, lng: 80.25 }, { lat: 13.05, lng: 80.22 }] },
  { id: "er2", fromDistrictId: "tn2", toShelterId: "s2", status: "OPEN", path: [{ lat: 12.693, lng: 80.003 }, { lat: 12.65, lng: 80.10 }, { lat: 12.62, lng: 80.17 }] }
];

// Helper to generate Gaussian random numbers
function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); 
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

export const generateEnsemble = (baseTrack: CycloneTrackPoint[]): EnsembleMember[] => {
  const ensembles: EnsembleMember[] = [];
  const uncertaintyGrowthRate = 0.12; 
  for (let i = 0; i < 100; i++) {
    const path = baseTrack.map((point, index) => {
      if (!point.isForecast) return point; 
      const forecastIndex = index - baseTrack.findIndex(p => p.isForecast);
      const sigma = forecastIndex * uncertaintyGrowthRate; 
      return { lat: point.lat + (randn_bm() * sigma), lng: point.lng + (randn_bm() * sigma) };
    });
    ensembles.push({ id: i, path: path, color: 'rgba(56, 189, 248, 0.15)' });
  }
  return ensembles;
};

export const ENSEMBLES = generateEnsemble(CYCLONE_TRACK);

// --- HELPER FOR COORDINATE SHIFTING (DEMO MODE) ---
// This allows us to "simulate" a cyclone in Florida (North Atlantic) by shifting the Ditwah data
export const getSimulationData = (basinId: string): SimulationData => {
  if (basinId === 'ni') {
    return {
      track: CYCLONE_TRACK,
      ensembles: ENSEMBLES,
      districts: DISTRICTS,
      floodZones: FLOOD_ZONES,
      shelters: SHELTERS,
      powerPlants: POWER_PLANTS,
      evacRoutes: EVACUATION_ROUTES,
      earthquakes: EARTHQUAKES
    };
  }

  // Shift Logic for North Atlantic (FLORIDA DEMO)
  if (basinId === 'na') {
    // Chennai (13, 80) -> Miami (25, -80). Delta: +12 Lat, -160 Lng
    const latDelta = 13.0;
    const lngDelta = -160.0;

    const shift = (c: Coordinate) => ({ lat: c.lat + latDelta, lng: c.lng + lngDelta });
    const shiftP = (p: CycloneTrackPoint) => ({ ...p, ...shift(p) });
    
    const floridaTrack = CYCLONE_TRACK.map(shiftP);

    return {
      track: floridaTrack,
      ensembles: generateEnsemble(floridaTrack),
      districts: [
        { id: "fl1", name: "Miami-Dade", state: "Florida", riskScore: 8.9, riskCiLower: 8.5, riskCiUpper: 9.3, populationAffected: 2700000, criticalInfrastructureCount: 150, lat: 25.7617, lng: -80.1918 },
        { id: "fl2", name: "Broward", state: "Florida", riskScore: 8.5, riskCiLower: 8.0, riskCiUpper: 9.0, populationAffected: 1900000, criticalInfrastructureCount: 90, lat: 26.1224, lng: -80.1373 },
        { id: "fl3", name: "Palm Beach", state: "Florida", riskScore: 7.8, riskCiLower: 7.2, riskCiUpper: 8.4, populationAffected: 1400000, criticalInfrastructureCount: 60, lat: 26.7153, lng: -80.0534 },
        { id: "fl4", name: "Tampa Bay", state: "Florida", riskScore: 6.5, riskCiLower: 6.0, riskCiUpper: 7.0, populationAffected: 3000000, criticalInfrastructureCount: 80, lat: 27.9506, lng: -82.4572 }
      ],
      floodZones: FLOOD_ZONES.map(z => ({ ...z, coordinates: z.coordinates.map(shift) })),
      shelters: SHELTERS.map(s => ({ ...s, name: s.name.replace("Chennai", "Miami").replace("Mahabalipuram", "Fort Lauderdale"), ...shift(s) })),
      powerPlants: POWER_PLANTS.map(p => ({ ...p, name: p.name.replace("North Chennai", "Turkey Point Nuclear").replace("Neyveli", "Port St. Lucie"), ...shift(p) })),
      evacRoutes: EVACUATION_ROUTES.map(r => ({ ...r, path: r.path.map(shift) })),
      earthquakes: [] // No major quakes in FL context for this demo
    };
  }

  // Default empty return for other basins to ensure map centers on default coordinates
  return {
    track: [],
    ensembles: [],
    districts: [],
    floodZones: [],
    shelters: [],
    powerPlants: [],
    evacRoutes: [],
    earthquakes: []
  };
};
