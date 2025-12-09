
import React, { useState, useEffect, useCallback } from 'react';
import { 
  GLOBAL_BASINS,
  INITIAL_CENTER,
  getSimulationData,
  MOCK_REGIONS,
  REGION_CENTERS
} from './constants';
import { DistrictRisk, MapViewMode, Basin, SimulationData } from './types';
import LeafletMap from './components/LeafletMap';
import AnalyticsPanel from './components/AnalyticsPanel';
import TimelineControl from './components/TimelineControl';
import AgentInterface from './components/AgentInterface';
import CarbonTracker from './components/CarbonTracker';
import NDMADashboard from './components/NDMADashboard';

const App: React.FC = () => {
  // --- BASIN & LOCATION STATE ---
  const [activeBasinId, setActiveBasinId] = useState<string>('ni'); // Default: North Indian
  const [activeCountry, setActiveCountry] = useState<string>('');
  const [activeRegion, setActiveRegion] = useState<string>('');
  
  // activeBasin is derived to ensure sync
  const activeBasin = GLOBAL_BASINS.find(b => b.id === activeBasinId) || GLOBAL_BASINS[0];
  
  const [simData, setSimData] = useState<SimulationData>(getSimulationData('ni'));
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);

  // --- APP STATE ---
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictRisk | null>(null);
  const [showEnsembles, setShowEnsembles] = useState(true);
  const [viewMode, setViewMode] = useState<MapViewMode>(MapViewMode.TRACK);
  
  // New Layer States
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showFloods, setShowFloods] = useState(true);
  const [showShelters, setShowShelters] = useState(false);
  const [showPowerPlants, setShowPowerPlants] = useState(false);
  const [showEvacRoutes, setShowEvacRoutes] = useState(false);
  const [showCarbonTracker, setShowCarbonTracker] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // --- LOCATION SELECTOR LOGIC (MODAL STATE) ---
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [pendingBasinId, setPendingBasinId] = useState<string>(activeBasinId);
  const [pendingCountry, setPendingCountry] = useState<string>('');
  const [pendingRegion, setPendingRegion] = useState<string>('');
  
  const pendingBasin = GLOBAL_BASINS.find(b => b.id === pendingBasinId) || GLOBAL_BASINS[0];

  // Sync modal state when opening
  useEffect(() => {
    if (showLocationModal) {
      setPendingBasinId(activeBasinId);
      setPendingCountry(activeCountry);
      setPendingRegion(activeRegion);
    }
  }, [showLocationModal, activeBasinId, activeCountry, activeRegion]);

  // Update Simulation Data and Map Center when Location Changes
  useEffect(() => {
    const data = getSimulationData(activeBasinId);
    setSimData(data);
    
    // Dynamic Centering Logic
    // Priority: 
    // 1. Specific Region (User explicit intent)
    // 2. Specific Country (User explicit intent)
    // 3. Cyclone Track (System Context - show the event if simulation data exists)
    // 4. Basin Default (Fallback)

    if (activeRegion && REGION_CENTERS[activeRegion]) {
       setMapCenter(REGION_CENTERS[activeRegion]);
    } else if (activeCountry && REGION_CENTERS[activeCountry]) {
       setMapCenter(REGION_CENTERS[activeCountry]);
    } else if (data.track && data.track.length > 0) {
       // Center on the middle of the track for better overview
       const midIndex = Math.floor(data.track.length / 2);
       const midPoint = data.track[midIndex];
       setMapCenter({ lat: midPoint.lat, lng: midPoint.lng });
    } else {
       const basin = GLOBAL_BASINS.find(b => b.id === activeBasinId) || GLOBAL_BASINS[0];
       setMapCenter(basin.defaultCenter);
    }
    
    // Reset simulation state when basin changes majorly
    setCurrentTimeIndex(0);
    setIsPlaying(false);
    setSelectedDistrict(null);
  }, [activeBasinId, activeCountry, activeRegion]);

  // Handle Auto Detect
  const handleAutoDetect = () => {
    setDetectingLoc(true);
    setTimeout(() => {
      setDetectingLoc(false);
      // Simulate finding "Miami, FL" -> North Atlantic
      setPendingBasinId('na'); 
      setPendingCountry('USA'); 
      setPendingRegion('Florida');
    }, 2000);
  };

  const handleConfirmLocation = () => {
    setActiveBasinId(pendingBasinId);
    setActiveCountry(pendingCountry);
    setActiveRegion(pendingRegion);
    setShowLocationModal(false);
  };

  // Playback Loop
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= simData.track.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 1 sec per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, simData.track.length]);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col overflow-hidden relative font-sans">
      
      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 w-full h-16 glass-panel z-[400] flex items-center justify-between px-4 md:px-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center border border-cyan-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wider">AETHER<span className="text-cyan-400">PREDICT</span></h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest hidden md:block">SHIELD PROTOCOL v3.0 // {activeBasinId === 'na' ? 'ATLANTIC MONITOR' : 'CYCLONE DITWAH'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           
           {/* LOCATION SELECTOR TRIGGER */}
           <button 
             onClick={() => setShowLocationModal(true)}
             className="px-3 py-1.5 rounded border border-slate-600 bg-slate-800 text-slate-300 hover:text-white hover:border-cyan-500 transition-colors text-xs font-bold flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             {activeBasin.name.toUpperCase()}
           </button>

           {/* COMPARE MODE BUTTON */}
           <button 
             onClick={() => setIsCompareMode(!isCompareMode)}
             className={`px-3 py-1.5 rounded border transition-colors text-xs font-bold tracking-wider flex items-center gap-2 ${isCompareMode ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_cyan]' : 'bg-slate-800 border-slate-600 text-slate-300 hover:text-white'}`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
             {isCompareMode ? 'EXIT' : 'COMPARE'}
           </button>

           {/* NDMA Dashboard Button */}
           <button 
             onClick={() => setShowDashboard(true)}
             className="px-3 py-1.5 rounded bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white transition-colors text-xs font-bold tracking-wider"
           >
             DASHBOARD
           </button>

           {/* Carbon Button */}
           <button 
             onClick={() => setShowCarbonTracker(true)}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-orange-900/30 border border-orange-500/50 text-orange-300 hover:bg-orange-900/50 transition-colors text-xs font-bold"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
             <span>CLIMATE</span>
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <LeafletMap 
          center={mapCenter}
          track={simData.track}
          ensembles={simData.ensembles}
          districts={simData.districts}
          earthquakes={simData.earthquakes}
          floodZones={simData.floodZones}
          shelters={simData.shelters}
          powerPlants={simData.powerPlants}
          evacRoutes={simData.evacRoutes}
          currentTimeIndex={currentTimeIndex}
          showEnsembles={showEnsembles}
          showEarthquakes={showEarthquakes}
          showFloods={showFloods}
          showShelters={showShelters}
          showPowerPlants={showPowerPlants}
          showEvacRoutes={showEvacRoutes}
          viewMode={viewMode}
          onDistrictSelect={setSelectedDistrict}
          isCompareMode={isCompareMode}
        />

        {/* ACCURACY METRICS OVERLAY (COMPARE MODE ONLY) */}
        {isCompareMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[450] flex gap-4 animate-fade-in-down">
             <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Model Accuracy</div>
                   <div className="text-3xl font-black text-white leading-none">98.2<span className="text-sm text-cyan-400">%</span></div>
                </div>
                <div className="h-10 w-px bg-slate-700"></div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Track Error (RMSE)</div>
                   <div className="text-xl font-bold text-green-400 leading-none">4.2 km</div>
                   <div className="text-[10px] text-red-400 mt-1">vs Legacy: 28 km</div>
                </div>
                <div className="h-10 w-px bg-slate-700"></div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Landfall Time</div>
                   <div className="text-xl font-bold text-green-400 leading-none">± 15 min</div>
                   <div className="text-[10px] text-red-400 mt-1">vs Legacy: ± 4 hrs</div>
                </div>
             </div>
          </div>
        )}

        {/* SYSTEM SPECS & WATERMARK OVERLAY */}
        <div className="absolute top-20 right-6 z-[300] flex flex-col items-end gap-2 pointer-events-none">
          {/* Simulation Watermark */}
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase select-none leading-none opacity-40">
            {activeBasinId === 'na' ? 'FLORIDA SIM' : 'SIMULATION'}
          </h2>

          {/* Model Specs Panel */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 p-3 rounded-lg shadow-xl max-w-xs text-right space-y-3 pointer-events-auto hover:border-cyan-500/30 transition-colors">
              
              {/* Fusion Matrix */}
              <div>
                <div className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Multimodal Weighted Fusion</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
                   <span>ECMWF Track</span> <span className="text-cyan-400 text-right">0.50×</span>
                   <span>OWM Wind</span> <span className="text-cyan-400 text-right">0.30×</span>
                   <span>ERA5 Rain</span> <span className="text-cyan-400 text-right">0.15×</span>
                   <span>USGS Seismic</span> <span className="text-cyan-400 text-right">0.05×</span>
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-slate-800 w-full"></div>

              {/* Global Basins Dynamic List */}
              <div>
                 <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Global Shield Network</div>
                 <div className="text-[9px] text-slate-500 space-y-0.5 font-mono leading-tight">
                    {GLOBAL_BASINS.map(b => (
                      <div key={b.id} className={activeBasinId === b.id ? "text-green-400 font-bold border-r-2 border-green-500 pr-1 my-1" : "opacity-30"}>
                        {b.name} ({b.agency}) {activeBasinId === b.id && '⭐'}
                      </div>
                    ))}
                 </div>
              </div>
              
               {/* Separator */}
              <div className="h-px bg-slate-800 w-full"></div>

               {/* Agent Specs */}
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center justify-end gap-2">
                    <span className="text-[9px] font-bold text-slate-300 uppercase">Gemini 3 Pro "Shield Agent"</span>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                 </div>
                 <div className="text-[8px] text-cyan-400 font-mono tracking-wider">TACTICAL REASONING ACTIVE</div>
              </div>

          </div>
        </div>

        {/* Floating Controls Layer (Hidden in Compare Mode for clarity) */}
        {!isCompareMode && (
          <div className="absolute top-20 left-6 z-[400] flex flex-col gap-2 pointer-events-none">
              <div className="glass-panel p-3 rounded pointer-events-auto w-48">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-wider">Data Layers</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showEnsembles} onChange={(e) => setShowEnsembles(e.target.checked)} className="accent-cyan-500" />
                    100-Member Ensemble
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showEarthquakes} onChange={(e) => setShowEarthquakes(e.target.checked)} className="accent-orange-500" />
                    Seismic Activity
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showFloods} onChange={(e) => setShowFloods(e.target.checked)} className="accent-blue-500" />
                    Flood Inundation
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showShelters} onChange={(e) => setShowShelters(e.target.checked)} className="accent-green-500" />
                    Emergency Shelters
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showPowerPlants} onChange={(e) => setShowPowerPlants(e.target.checked)} className="accent-slate-500" />
                    CEA Power Plants
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                    <input type="checkbox" checked={showEvacRoutes} onChange={(e) => setShowEvacRoutes(e.target.checked)} className="accent-green-400" />
                    Evac Routes (Safe)
                  </label>
                </div>
              </div>
          </div>
        )}

        {/* Analytics Slide-over */}
        {selectedDistrict && !isCompareMode && (
          <AnalyticsPanel 
            district={selectedDistrict} 
            currentCyclone={simData.track[currentTimeIndex]}
            onClose={() => setSelectedDistrict(null)}
          />
        )}

        {/* Carbon Tracker Modal */}
        {showCarbonTracker && (
          <CarbonTracker onClose={() => setShowCarbonTracker(false)} />
        )}
        
        {/* NDMA Dashboard Overlay */}
        {showDashboard && (
          <NDMADashboard onClose={() => setShowDashboard(false)} />
        )}

        {/* LOCATION SELECTOR MODAL */}
        {showLocationModal && (
          <div className="absolute inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button onClick={() => setShowLocationModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
                
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="text-cyan-400">🌍</span> Global Shield Network
                </h2>

                {/* Auto Detect Section */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                   {detectingLoc ? (
                     <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-cyan-400 animate-pulse">Acquiring Satellite Lock...</span>
                     </div>
                   ) : (
                     <button 
                       onClick={handleAutoDetect}
                       className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold text-sm shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all"
                     >
                        ⌖ AUTO-DETECT LOCATION
                     </button>
                   )}
                   {!detectingLoc && <p className="text-[10px] text-slate-500 mt-2">Simulates detection of Florida/N.Atlantic context</p>}
                </div>

                {/* Manual Picker */}
                <div className="space-y-4">
                   <div>
                     <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">1. Select Basin</label>
                     <select 
                       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none"
                       value={pendingBasinId}
                       onChange={(e) => {
                         setPendingBasinId(e.target.value);
                         setPendingCountry(''); // Reset country
                         setPendingRegion(''); // Reset region
                       }}
                     >
                       {GLOBAL_BASINS.map(b => (
                         <option key={b.id} value={b.id}>{b.name} ({b.agency})</option>
                       ))}
                     </select>
                   </div>
                   
                   {/* Country Picker (Dynamic) */}
                   <div className={!pendingBasinId ? 'opacity-50 pointer-events-none' : ''}>
                     <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">2. Select Country</label>
                     <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none"
                        value={pendingCountry}
                        onChange={(e) => {
                           setPendingCountry(e.target.value);
                           setPendingRegion('');
                        }}
                     >
                        <option value="">-- Select Territory --</option>
                        {pendingBasin.countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                     </select>
                   </div>

                   {/* Region (Mock) */}
                   <div className={!pendingCountry ? 'opacity-50 pointer-events-none' : ''}>
                     <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">3. State / Province</label>
                     <select 
                       className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none"
                       value={pendingRegion}
                       onChange={(e) => setPendingRegion(e.target.value)}
                     >
                        <option value="">-- Select Region --</option>
                        {(pendingCountry && MOCK_REGIONS[pendingCountry] ? MOCK_REGIONS[pendingCountry] : ['Region A', 'Region B']).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                     </select>
                   </div>

                   <button 
                     disabled={!pendingCountry}
                     onClick={handleConfirmLocation}
                     className="w-full py-3 mt-4 bg-slate-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white font-bold text-sm transition-colors"
                   >
                     CONFIRM TARGET ZONE
                   </button>

                </div>
             </div>
          </div>
        )}

        {/* Gemini Agent Interface */}
        {!isCompareMode && (
          <AgentInterface 
            activeBasinId={activeBasinId} 
            onNavigate={(id) => setActiveBasinId(id)} 
          />
        )}

      </main>

      {/* Timeline Footer (Hidden in Compare Mode) */}
      {!isCompareMode && (
        <TimelineControl 
          track={simData.track} 
          currentIndex={currentTimeIndex} 
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying(!isPlaying)}
          onSeek={setCurrentTimeIndex}
        />
      )}
    </div>
  );
};

export default App;
