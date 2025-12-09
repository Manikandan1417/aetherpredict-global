import React, { useState } from 'react';
import { DistrictRisk, CycloneTrackPoint } from '../types';
import { analyzeRisk } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsPanelProps {
  district: DistrictRisk | null;
  currentCyclone: CycloneTrackPoint;
  onClose: () => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ district, currentCyclone, onClose }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!district) return null;

  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await analyzeRisk(district, currentCyclone);
    setAnalysis(result);
    setLoading(false);
  };

  const riskData = [
    { name: 'Wind', value: district.riskScore * 10, full: 100 },
    { name: 'Flood', value: (district.riskScore * 8), full: 100 },
    { name: 'Infra', value: (district.riskScore * 6), full: 100 },
  ];

  return (
    <div className="absolute top-0 right-0 w-full md:w-96 h-full glass-panel border-l border-slate-700 z-[500] p-6 flex flex-col transition-transform duration-300 transform translate-x-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cyan-400 tracking-wider">SECTOR INTEL</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">{district.name}</h1>
        <p className="text-slate-400 uppercase text-xs tracking-widest">{district.state} // DISTRICT ID: {district.id.toUpperCase()}</p>
      </div>

      {/* Risk Score */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 uppercase mb-1">Composite Risk</div>
          <div className="text-4xl font-mono font-bold text-red-500">
            {district.riskScore}<span className="text-base text-slate-500">/10</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            CI: {district.riskCiLower} - {district.riskCiUpper} (±15%)
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 uppercase mb-1">Pop. Affected</div>
          <div className="text-2xl font-mono font-bold text-white">
            {(district.populationAffected / 1000000).toFixed(1)}M
          </div>
           <div className="text-xs text-slate-400 uppercase mt-2 mb-1">Infra Units</div>
          <div className="text-xl font-mono font-bold text-white">
            {district.criticalInfrastructureCount}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 mb-6 bg-slate-800/30 rounded-lg p-2 border border-slate-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={40} tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip 
              contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}}
              itemStyle={{color: '#fff'}}
              cursor={{fill: 'rgba(255,255,255,0.1)'}}
            />
            <Bar dataKey="value" fill="#06b6d4" barSize={15} radius={[0, 4, 4, 0]}>
                {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#ef4444' : '#06b6d4'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Analysis */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase">AI Tactical Report</h3>
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className={`text-xs px-3 py-1 rounded border border-cyan-500/50 hover:bg-cyan-500/20 transition-colors flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'GENERATING...' : 'GENERATE'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 min-h-[150px] text-sm text-slate-300 leading-relaxed font-mono">
           {analysis ? (
             <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
           ) : (
             <span className="text-slate-600 italic">
               Click 'Generate' to request Gemini 2.5 Flash tactical analysis for this district based on current ensemble projections.
             </span>
           )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;