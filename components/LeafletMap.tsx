
import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { CycloneTrackPoint, DistrictRisk, EnsembleMember, MapViewMode, Earthquake, FloodZone, Shelter, PowerPlant, EvacuationRoute, Coordinate } from '../types';
import { IMD_OBSERVED_TRACK, LEGACY_MODEL_TRACK } from '../constants';

interface LeafletMapProps {
  center: Coordinate; // New prop for dynamic centering
  track: CycloneTrackPoint[];
  ensembles: EnsembleMember[];
  districts: DistrictRisk[];
  earthquakes: Earthquake[];
  floodZones: FloodZone[];
  shelters: Shelter[];
  powerPlants?: PowerPlant[];
  evacRoutes?: EvacuationRoute[];
  currentTimeIndex: number;
  showEnsembles: boolean;
  showEarthquakes: boolean;
  showFloods: boolean;
  showShelters: boolean;
  showPowerPlants?: boolean;
  showEvacRoutes?: boolean;
  viewMode: MapViewMode;
  onDistrictSelect: (d: DistrictRisk) => void;
  isCompareMode?: boolean; 
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  track,
  ensembles,
  districts,
  earthquakes,
  floodZones,
  shelters,
  powerPlants = [],
  evacRoutes = [],
  currentTimeIndex,
  showEnsembles,
  showEarthquakes,
  showFloods,
  showShelters,
  showPowerPlants,
  showEvacRoutes,
  viewMode,
  onDistrictSelect,
  isCompareMode = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([center.lat, center.lng], 6);

      // Dark Matter Tiles (CartoDB) - Free & Credible
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      
      // Add Scale
      L.control.scale({ position: 'bottomright' }).addTo(mapInstanceRef.current);
      
      // Add CSS for pulsing/moving lines
      const style = document.createElement('style');
      style.innerHTML = `
        .evac-route-line { stroke-dasharray: 10, 10; animation: dash 2s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -20; } }
      `;
      document.head.appendChild(style);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Dynamic Centering (Flying)
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], 6, {
        duration: 2.0 // Smooth flight
      });
    }
  }, [center]);

  // Update Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // --- COMPARE MODE LOGIC ---
    if (isCompareMode) {
      // 1. Render IMD Observed Track (Ground Truth) - White
      const imdPoints = IMD_OBSERVED_TRACK.map(p => [p.lat, p.lng] as L.LatLngExpression);
      L.polyline(imdPoints, {
        color: '#ffffff',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round'
      }).addTo(layerGroup).bindTooltip('IMD OBSERVED (GROUND TRUTH)', { sticky: true });

      // 2. Render Legacy Model Track (Standard) - Red Dashed
      const legacyPoints = LEGACY_MODEL_TRACK.map(p => [p.lat, p.lng] as L.LatLngExpression);
      L.polyline(legacyPoints, {
        color: '#ef4444',
        weight: 2,
        dashArray: '5, 10',
        opacity: 0.6
      }).addTo(layerGroup).bindTooltip('LEGACY MODEL (GFS)', { sticky: true });

      // 3. Render Aether Track (Our Model) - Cyan Glowing
      const aetherPoints = track.map(p => [p.lat, p.lng] as L.LatLngExpression);
      L.polyline(aetherPoints, {
        color: '#06b6d4',
        weight: 3,
        opacity: 1,
        className: 'animate-pulse' // Subtle pulse
      }).addTo(layerGroup).bindTooltip('AETHERPREDICT SHIELD (OUR MODEL)', { sticky: true, className: "font-bold text-cyan-400" });

      // 4. Draw Error Connectors (Legacy vs Truth) to show deviation
      LEGACY_MODEL_TRACK.forEach((p, i) => {
        if (IMD_OBSERVED_TRACK[i]) {
          L.polyline([
            [p.lat, p.lng],
            [IMD_OBSERVED_TRACK[i].lat, IMD_OBSERVED_TRACK[i].lng]
          ], {
            color: '#ef4444',
            weight: 1,
            opacity: 0.3,
            dashArray: '2, 4'
          }).addTo(layerGroup);
        }
      });

      // Fit bounds to show comparison
      const bounds = L.latLngBounds(imdPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

      return; // Stop standard rendering
    }

    // --- STANDARD MODE LOGIC ---

    // 1. Draw Floods (Polygons)
    if (showFloods) {
      floodZones.forEach(zone => {
        const latLngs = zone.coordinates.map(c => [c.lat, c.lng] as L.LatLngExpression);
        L.polygon(latLngs, {
          color: '#3b82f6', // blue-500
          fillColor: '#3b82f6',
          fillOpacity: 0.4,
          weight: 1
        }).addTo(layerGroup).bindTooltip(`FLOOD ZONE: ${zone.riskLevel}`, { direction: 'center', className: 'text-xs font-bold text-blue-200 bg-transparent border-0 shadow-none' });
      });
    }

    // 2. Draw Ensembles
    if (showEnsembles) {
      ensembles.forEach(member => {
        const latLngs = member.path.map(p => [p.lat, p.lng] as L.LatLngExpression);
        L.polyline(latLngs, {
          color: '#06b6d4', // cyan-500
          weight: 1,
          opacity: 0.1,
          smoothFactor: 1
        }).addTo(layerGroup);
      });
    }

    // 3. Draw Track
    const pastTrack = track.slice(0, currentTimeIndex + 1);
    const futureTrack = track.slice(currentTimeIndex);

    if (pastTrack.length > 0) {
      L.polyline(pastTrack.map(p => [p.lat, p.lng] as L.LatLngExpression), {
        color: '#fbbf24', // amber-400
        weight: 3,
        dashArray: undefined
      }).addTo(layerGroup);
    }

    if (futureTrack.length > 0) {
       L.polyline(futureTrack.map(p => [p.lat, p.lng] as L.LatLngExpression), {
        color: '#fbbf24', 
        weight: 3,
        dashArray: '5, 10' // Dashed for forecast
      }).addTo(layerGroup);
    }

    // 4. Current Cyclone
    const currentPos = track[currentTimeIndex];
    if (currentPos) {
      const pulseIcon = L.divIcon({
        className: 'cyclone-pulse',
        html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([currentPos.lat, currentPos.lng], { icon: pulseIcon })
        .bindPopup(`
          <div class="text-slate-900">
            <strong>${currentPos.category}</strong><br/>
            Wind: ${currentPos.windSpeedKmph} kmph<br/>
            Pressure: ${currentPos.pressureHpa} hPa
          </div>
        `)
        .addTo(layerGroup);
    }

    // 5. Earthquakes
    if (showEarthquakes) {
      earthquakes.forEach(eq => {
         const eqIcon = L.divIcon({
           className: 'quake-pulse',
           html: `<div class="w-10 h-10 rounded-full border-2 border-orange-500 opacity-75 animate-ping"></div><div class="absolute top-3 left-3 w-4 h-4 bg-orange-600 rounded-full border border-white"></div>`,
           iconSize: [40, 40],
           iconAnchor: [20, 20]
         });
         L.marker([eq.lat, eq.lng], { icon: eqIcon })
           .bindPopup(`<strong>EARTHQUAKE</strong><br/>Mag: ${eq.magnitude}<br/>Depth: ${eq.depthKm}km`)
           .addTo(layerGroup);
      });
    }

    // 6. Shelters
    if (showShelters) {
       shelters.forEach(s => {
         const shelterIcon = L.divIcon({
           className: 'shelter-icon',
           html: `<div class="w-0 h-0 border-l-[6px] border-l-transparent border-b-[10px] border-b-green-500 border-r-[6px] border-r-transparent"></div>`,
           iconSize: [12, 12],
           iconAnchor: [6, 6]
         });
         L.marker([s.lat, s.lng], { icon: shelterIcon })
           .bindTooltip(s.name)
           .addTo(layerGroup);
       });
    }

    // 7. Power Plants (NEW)
    if (showPowerPlants) {
      powerPlants.forEach(pp => {
        const ppIcon = L.divIcon({
          className: 'pp-icon',
          html: `<div class="flex flex-col items-center"><div class="w-4 h-6 bg-slate-500 rounded-t-sm border border-slate-300 relative"><div class="absolute -top-3 -right-2 w-4 h-4 bg-gray-400 rounded-full opacity-50 animate-ping"></div></div></div>`,
          iconSize: [20, 30],
          iconAnchor: [10, 30]
        });
        L.marker([pp.lat, pp.lng], { icon: ppIcon })
          .bindTooltip(`${pp.name} (${pp.type})`)
          .addTo(layerGroup);
      });
    }

    // 8. Evac Routes (NEW)
    if (showEvacRoutes) {
      evacRoutes.forEach(route => {
        const latLngs = route.path.map(c => [c.lat, c.lng] as L.LatLngExpression);
        L.polyline(latLngs, {
          color: '#22c55e', // Green
          weight: 4,
          dashArray: '10, 10',
          className: 'evac-route-line' // Animated via CSS injected above
        }).addTo(layerGroup);
      });
    }

    // 9. District Risk
    districts.forEach(district => {
      let color = '#22c55e'; // Green
      if (district.riskScore > 5) color = '#facc15'; // Yellow
      if (district.riskScore > 8) color = '#ef4444'; // Red

      const radius = viewMode === MapViewMode.HEATMAP ? 40000 : 20000;
      
      const circle = L.circle([district.lat, district.lng], {
        color: color,
        fillColor: color,
        fillOpacity: viewMode === MapViewMode.HEATMAP ? 0.4 : 0.2,
        radius: radius,
        weight: 1
      }).addTo(layerGroup);

      circle.on('click', () => onDistrictSelect(district));
      
      circle.bindTooltip(`${district.name}: ${district.riskScore}/10`, {
        permanent: viewMode === MapViewMode.IMPACT,
        direction: 'center',
        className: 'bg-transparent border-0 text-white font-bold shadow-none'
      });
    });

  }, [track, ensembles, districts, earthquakes, floodZones, shelters, powerPlants, evacRoutes, currentTimeIndex, showEnsembles, showEarthquakes, showFloods, showShelters, showPowerPlants, showEvacRoutes, viewMode, onDistrictSelect, isCompareMode]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-900" />
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-[400] glass-panel p-3 rounded-lg text-xs pointer-events-none space-y-1">
        {isCompareMode ? (
          <>
            <div className="flex items-center gap-2 font-bold text-white mb-2">MODEL BENCHMARK</div>
            <div className="flex items-center gap-2"><span className="w-4 h-1 bg-white block"></span> IMD Observed (Truth)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-1 bg-cyan-400 block shadow-[0_0_5px_cyan]"></span> Aether Prediction</div>
            <div className="flex items-center gap-2"><span className="w-4 h-1 border-t border-dashed border-red-500 block"></span> Legacy Model (Error)</div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-amber-400 block"></span> Track (Observed)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t border-dashed border-amber-400 block"></span> Track (Forecast)</div>
            {showFloods && <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500/50 block"></span> Flood Zone</div>}
            {showEarthquakes && <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-orange-500 block"></span> Earthquake</div>}
            {showPowerPlants && <div className="flex items-center gap-2"><span className="w-2 h-3 bg-slate-500 block"></span> Power Plant (CEA)</div>}
            {showEvacRoutes && <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t border-dashed border-green-500 block"></span> Evac Route</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;
