import React from 'react';

interface CarbonTrackerProps {
  onClose: () => void;
}

const CarbonTracker: React.FC<CarbonTrackerProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[700] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>

        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-6">
          CARBON & CLIMATE ANOMALIES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Heatmap Section */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase">Surface Temperature Anomalies (ERA5)</h3>
            <div className="aspect-video bg-gradient-to-br from-blue-900 via-slate-800 to-red-900 rounded-lg relative overflow-hidden flex items-center justify-center border border-white/10">
               {/* Mock Heatmap Visual */}
               <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/b/b3/World_location_map_%28equirectangular_180%29.svg')] bg-cover bg-center mix-blend-overlay"></div>
               <div className="w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-60 absolute top-10 right-20"></div>
               <div className="w-40 h-40 bg-orange-500 rounded-full blur-[50px] opacity-40 absolute bottom-10 left-20"></div>
               <span className="relative z-10 font-mono text-xs text-white/70 bg-black/50 p-1 rounded">+1.5°C Global Mean Deviation</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Recent data from Copernicus ERA5 indicates a <strong className="text-red-400">+1.2°C SST</strong> anomaly in the Bay of Bengal, directly correlating to the rapid intensification of Cyclone Ditwah from Category 1 to 4 in 24 hours.
            </p>
          </div>

          {/* Emitters & Stats */}
          <div className="space-y-4">
             <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase">Regional CO₂ Contribution</h3>
                <div className="space-y-2">
                   {[
                     { name: "Power Generation (Coal)", val: 65, col: "bg-red-500" },
                     { name: "Industrial Manufacturing", val: 45, col: "bg-orange-500" },
                     { name: "Transportation", val: 30, col: "bg-yellow-500" }
                   ].map(item => (
                     <div key={item.name}>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                         <span>{item.name}</span>
                         <span>{item.val}% High</span>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full ${item.col}`} style={{width: `${item.val}%`}}></div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
               <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 CLIMATE LINK
               </h3>
               <p className="text-xs text-slate-300">
                 Scientific consensus links rising sea surface temperatures (SST) to increased cyclone moisture holding capacity (Clausius-Clapeyron relation). Current mitigation target: Reduce regional emissions by 40% by 2030 to stabilize SST.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTracker;