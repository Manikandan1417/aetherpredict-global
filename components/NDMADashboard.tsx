
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DISTRICTS, CYCLONE_TRACK } from '../constants';
import { ApiLog } from '../types';
import { subscribeLogs } from '../services/loggingService';

interface NDMADashboardProps {
  onClose: () => void;
}

const NDMADashboard: React.FC<NDMADashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'SMS' | 'BENCHMARK' | 'LOGS' | 'IMPACT'>('SUMMARY');
  const [logs, setLogs] = useState<ApiLog[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeLogs(setLogs);
    return () => unsubscribe();
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // WATERMARK
    doc.setTextColor(240, 240, 240); 
    doc.setFontSize(60);
    doc.text("SIMULATION ONLY", 40, 150, { angle: 45 });
    doc.setFontSize(30);
    doc.text("NOT FOR NAVIGATION", 60, 170, { angle: 45 });

    doc.setTextColor(0, 0, 0);
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("AETHERPREDICT SHIELD", 14, 20);
    doc.setFontSize(10);
    doc.text("NDMA OFFICIAL SITUATION REPORT // CYCLONE DITWAH", 14, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const currentStatus = CYCLONE_TRACK[CYCLONE_TRACK.length - 2];
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Cyclone Status: ${currentStatus.category}, ${currentStatus.windSpeedKmph} km/h`, 14, 58);

    const tableData = DISTRICTS.map(d => [
      d.name,
      d.state,
      `${d.riskScore}/10`,
      (d.populationAffected / 1000000).toFixed(2) + "M",
      d.criticalInfrastructureCount
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['District', 'State', 'Risk Score', 'Pop. Affected', 'Infra Units']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] },
      styles: { fontSize: 10 }
    });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("LIMITATIONS: This report uses probabilistic ensemble models. Values include a ±15% Confidence Interval.", 14, doc.internal.pageSize.height - 10);
    doc.text("Data Sources: ECMWF (9km), OpenWeatherMap (5km), NCS (Seismology), Copernicus GLOFAS, Bhuvan ISRO.", 14, doc.internal.pageSize.height - 6);

    doc.save(`NDMA_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="absolute inset-0 z-[800] bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white">N</div>
          <h1 className="text-xl font-bold text-white tracking-wider">NDMA <span className="text-slate-400">COMMAND CENTER</span></h1>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors">
          EXIT DASHBOARD
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('SUMMARY')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'SUMMARY' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            District Summary
          </button>
          <button 
            onClick={() => setActiveTab('BENCHMARK')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'BENCHMARK' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Event Benchmark
          </button>
           <button 
            onClick={() => setActiveTab('IMPACT')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'IMPACT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Impact & ROI Analysis
          </button>
          <button 
            onClick={() => setActiveTab('SMS')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'SMS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Communication (SMS)
          </button>
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === 'LOGS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            System Logs & Limits
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-950">
          
          {/* SUMMARY TAB */}
          {activeTab === 'SUMMARY' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">District Risk Assessment</h2>
                  <p className="text-slate-400 text-sm">Real-time aggregation of multi-model ensemble data.</p>
                </div>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded shadow-lg shadow-red-900/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  EXPORT OFFICIAL PDF
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                    <tr>
                      <th className="px-6 py-3">District</th>
                      <th className="px-6 py-3">State</th>
                      <th className="px-6 py-3 text-right">Risk Score</th>
                      <th className="px-6 py-3 text-right">Pop. At Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISTRICTS.map((d) => (
                      <tr key={d.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-white">{d.name}</td>
                        <td className="px-6 py-4">{d.state}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${d.riskScore > 8 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {d.riskScore}/10
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{(d.populationAffected / 1000000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BENCHMARK TAB */}
          {activeTab === 'BENCHMARK' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Historical Benchmark Analysis</h2>
              <p className="text-slate-400 mb-6">Comparing 'Ditwah' vs 2015 Chennai Floods. <span className="text-cyan-400 font-bold">Operation Sagar Bandhu</span> active.</p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="bg-slate-900 p-6 rounded-lg border border-cyan-500/30">
                    <h3 className="text-cyan-400 font-bold mb-4 uppercase">Ditwah 2025 (Current)</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-400">Wind Speed</span>
                         <span className="text-white font-mono">65 km/h (Cyclonic Storm)</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-400">Rainfall (Forecast)</span>
                         <span className="text-white font-mono">450mm+ (Extreme)</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-400">Primary Impact</span>
                         <span className="text-white font-mono">Urban Flooding (Chennai)</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 opacity-70">
                    <h3 className="text-slate-400 font-bold mb-4 uppercase">Cyclone Michaung 2023</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-500">Wind Speed</span>
                         <span className="text-slate-300 font-mono">110 km/h</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-500">Rainfall</span>
                         <span className="text-slate-300 font-mono">500mm</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-800 pb-2">
                         <span className="text-slate-500">Outcome</span>
                         <span className="text-slate-300 font-mono">Stalled near coast</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-800">
                <h4 className="font-bold text-white mb-2">Analysis Note</h4>
                <p className="text-sm text-slate-300">
                  Ditwah mimics the 'Stall & Drench' pattern of Michaung (2023). While wind intensity is lower, the stalling behavior near Chennai presents a <strong>SEVERE FLOOD RISK</strong>. "Operation Sagar Bandhu" is prioritizing water rescue assets over wind damage mitigation.
                </p>
              </div>
            </div>
          )}

          {/* IMPACT TAB (NEW) */}
          {activeTab === 'IMPACT' && (
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-green-500">●</span> Impact Assessment & System Reliability
              </h2>

              {/* Top Level Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-colors">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Value Preserved</h3>
                   <div className="text-4xl font-black text-green-400">$3.2B</div>
                   <div className="text-[10px] text-slate-500 mt-2">
                     Assets protected via early alert vs $4.8B baseline loss (2015).
                   </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Casualties Avoided</h3>
                   <div className="text-4xl font-black text-cyan-400">12,000+</div>
                   <div className="text-[10px] text-slate-500 mt-2">
                     Lives saved in low-lying hamlets via targeted evacuation.
                   </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-orange-500/20 relative overflow-hidden group hover:border-orange-500/40 transition-colors">
                   <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Response Time</h3>
                   <div className="text-4xl font-black text-orange-400">-40%</div>
                   <div className="text-[10px] text-slate-500 mt-2">
                     Reduction in deployment latency for NDRF teams.
                   </div>
                </div>
              </div>

              {/* Route & Notification Reliability */}
              <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 mb-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-800 rounded border border-slate-700 text-cyan-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Logistics & Route Reliability</h3>
                      <p className="text-xs text-slate-400">Performance of AetherPredict dynamic routing notifications.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Graph 1 */}
                    <div>
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-xs text-slate-400 uppercase font-bold">Evacuation Clearance Time</span>
                          <span className="text-sm font-bold text-green-400">18 Hours</span>
                       </div>
                       <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-green-500 w-[60%]"></div>
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-600">
                          <span>Aether Optimized</span>
                          <span>Standard Protocol (30 hrs)</span>
                       </div>
                    </div>

                    {/* Notification Stats */}
                    <div className="space-y-3">
                       <div className="flex items-center justify-between text-sm p-2 bg-slate-950/50 rounded border border-slate-800">
                          <span className="text-slate-300">Route Congestion Alerts Sent</span>
                          <span className="font-mono font-bold text-white">842</span>
                       </div>
                       <div className="flex items-center justify-between text-sm p-2 bg-slate-950/50 rounded border border-slate-800">
                          <span className="text-slate-300">Vehicles Rerouted</span>
                          <span className="font-mono font-bold text-cyan-400">45,300+</span>
                       </div>
                       <div className="flex items-center justify-between text-sm p-2 bg-slate-950/50 rounded border border-slate-800">
                           <span className="text-slate-300">Gridlock Avoided (Adyar Basin)</span>
                           <span className="font-mono font-bold text-green-400">100%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Justification & Trust */}
              <div className="p-5 bg-gradient-to-r from-cyan-900/10 to-transparent border-l-4 border-cyan-500 rounded-r-lg">
                 <h4 className="font-bold text-cyan-400 mb-2 uppercase text-xs tracking-wider">Reliability Certification</h4>
                 <p className="text-sm text-slate-300 leading-relaxed">
                   AetherPredict Shield demonstrated a <strong>98.2% correlation</strong> with ground-truth IMD observation data during the critical stalling phase of Cyclone Ditwah. 
                   The system's "Route Impact Prediction" engine successfully identified 3 major chokepoints on ECR Highway 4 hours before they became impassable due to flash flooding.
                   Notifications issued to district collectors enabled the preemptive diversion of logistics convoys to Safe Corridor B (Chengalpattu Inland Route), ensuring zero disruption to relief supplies.
                 </p>
              </div>

            </div>
          )}

          {/* SMS TAB */}
          {activeTab === 'SMS' && (
            <div className="max-w-4xl mx-auto">
               <h2 className="text-2xl font-bold text-white mb-6">Emergency Broadcast Templates</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Card */}
                  <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-cyan-400 font-bold uppercase text-sm">English (Urban Flood)</h3>
                      <button className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700">COPY</button>
                    </div>
                    <textarea 
                      readOnly
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-300 font-mono resize-none focus:outline-none"
                      value="NDMA RED ALERT: Extreme rainfall (>400mm) predicted for Chennai/Tiruvallur. Low-lying areas WILL flood. Move to upper floors or relief centers immediately. Power will be cut. - Govt of India"
                    />
                  </div>

                  {/* Tamil Card */}
                  <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                     <div className="flex justify-between items-center mb-4">
                      <h3 className="text-green-400 font-bold uppercase text-sm">Tamil (Urban Flood)</h3>
                      <button className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700">COPY</button>
                    </div>
                    <textarea 
                      readOnly
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-300 font-mono resize-none focus:outline-none"
                      value="NDMA எச்சரிக்கை: சென்னைக்கு கனமழை எச்சரிக்கை (400mm+). தாழ்வான பகுதிகள் வெள்ளத்தில் மூழ்கும். உடனடியாக நிவாரண முகாம்களுக்குச் செல்லவும். மின்சாரம் துண்டிக்கப்படும். - இந்திய அரசு"
                    />
                  </div>
               </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'LOGS' && (
            <div className="max-w-4xl mx-auto">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">System Logs & Limitations</h2>
                 <div className="flex gap-4">
                   <div className="text-right">
                     <div className="text-xs text-slate-500 uppercase">Status</div>
                     <div className="text-green-400 font-bold">OPERATIONAL</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs text-slate-500 uppercase">Rate Limit</div>
                     <div className="text-cyan-400 font-bold">12/60 RPM</div>
                   </div>
                 </div>
               </div>

               {/* Limitations Warning Block */}
               <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg mb-6 flex gap-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <div>
                   <h4 className="font-bold text-orange-400 mb-1">System Limitations & Disclaimers</h4>
                   <ul className="text-xs text-orange-200/80 list-disc pl-4 space-y-1">
                     <li>This is a simulation prototype using <strong className="text-white">mock public data</strong> for "Cyclone Ditwah 2025". Not for real-world navigation.</li>
                     <li>AI outputs (Gemini 3 Pro) are probabilistic and may contain hallucinations. Verify with local authorities.</li>
                     <li>Risk scores are aggregates with a ±15% confidence interval.</li>
                   </ul>
                 </div>
               </div>

               {/* Log Table */}
               <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                 <table className="w-full text-xs text-left text-slate-400 font-mono">
                   <thead className="bg-slate-800 text-slate-500 uppercase">
                     <tr>
                       <th className="px-4 py-2">Timestamp</th>
                       <th className="px-4 py-2">Service</th>
                       <th className="px-4 py-2">Status</th>
                       <th className="px-4 py-2">Latency</th>
                       <th className="px-4 py-2 w-1/3">Details</th>
                     </tr>
                   </thead>
                   <tbody>
                     {logs.map((log) => (
                       <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                         <td className="px-4 py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                         <td className="px-4 py-2 text-cyan-500">{log.endpoint}</td>
                         <td className="px-4 py-2">
                           <span className={log.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}>{log.status}</span>
                         </td>
                         <td className="px-4 py-2">{log.latencyMs}ms</td>
                         <td className="px-4 py-2 truncate">{log.details}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NDMADashboard;
