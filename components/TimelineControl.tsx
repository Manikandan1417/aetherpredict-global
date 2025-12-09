
import React, { useState } from 'react';
import { CycloneTrackPoint } from '../types';

interface TimelineControlProps {
  track: CycloneTrackPoint[];
  currentIndex: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (index: number) => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ 
  track, currentIndex, isPlaying, onPlayToggle, onSeek 
}) => {
  const currentPoint = track[currentIndex];
  const progress = (currentIndex / (track.length - 1)) * 100;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const index = Math.round((percentage / 100) * (track.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="absolute bottom-0 left-0 w-full glass-panel border-t border-slate-700/50 z-[400] h-[80px] md:h-auto md:p-6 transition-all duration-300 flex items-center md:block">
      <div className="flex flex-col gap-2 md:gap-4 max-w-6xl mx-auto w-full px-4 md:px-0">
        
        {/* Top Info Bar (Hidden on super small screens inside slider, but visible on md) */}
        <div className="flex justify-between items-end mb-1 px-1">
          <div>
            <div className="hidden md:block text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-1">Current Status</div>
            <div className="text-sm md:text-2xl font-black text-white flex items-center md:items-baseline gap-2 md:gap-3">
              <span className="md:hidden text-cyan-400 text-xs">
                {new Date(currentPoint.timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit'})}
              </span>
              <span className="hidden md:inline">
                {new Date(currentPoint.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <span className={`text-[10px] md:text-sm px-2 py-0.5 rounded font-bold uppercase tracking-wide truncate max-w-[120px] md:max-w-none ${
                currentPoint.category.includes('Severe') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                currentPoint.category.includes('Depression') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                'bg-slate-700 text-slate-300'
              }`}>
                {currentPoint.category}
              </span>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Telemetry</div>
            <div className="flex gap-4 font-mono text-sm">
               <span className="text-cyan-300">WIND: {currentPoint.windSpeedKmph} km/h</span>
               <span className="text-purple-300">PRES: {currentPoint.pressureHpa} hPa</span>
            </div>
          </div>
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Play/Pause Button */}
          <button 
            onClick={onPlayToggle}
            className={`w-8 h-8 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-full border transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] ${
              isPlaying 
                ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500 hover:text-white' 
                : 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 hover:scale-105'
            }`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Timeline Slider Area */}
          <div 
            className="flex-1 relative h-6 md:h-10 flex items-center group select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
             {/* Base Track */}
            <div className="absolute top-1/2 left-0 w-full h-1 md:h-1.5 bg-slate-800/80 rounded-full overflow-visible">
               {/* Progress Fill */}
               <div 
                 className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] transition-all duration-100 ease-linear"
                 style={{ width: `${progress}%` }}
               />
            </div>

            {/* Input Range (Invisible Interaction Layer) */}
            <input 
              type="range"
              min={0}
              max={track.length - 1}
              value={currentIndex}
              onChange={(e) => onSeek(parseInt(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Event Markers (Dots on the timeline) */}
            {track.map((pt, i) => {
               const pos = (i / (track.length - 1)) * 100;
               let colorClass = "bg-slate-600";
               if (pt.category.includes("Severe")) colorClass = "bg-red-500 shadow-[0_0_8px_red]";
               else if (pt.category.includes("Deep Depression")) colorClass = "bg-yellow-500";
               
               // Only show markers for significant changes or every Nth point to avoid clutter
               if (i === 0 || i === track.length - 1 || pt.category !== track[i-1]?.category) {
                  return (
                    <div 
                      key={i} 
                      className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${colorClass} pointer-events-none z-10`} 
                      style={{ left: `${pos}%` }}
                    />
                  );
               }
               return null;
            })}

            {/* Current Thumb (Custom Visual) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-white border-2 border-cyan-500 rounded-full shadow-lg pointer-events-none z-10 transition-all duration-100 ease-linear flex items-center justify-center"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            >
               <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-cyan-600 rounded-full"></div>
            </div>

            {/* Hover Tooltip */}
            {hoverIndex !== null && (
              <div 
                className="absolute -top-8 md:-top-10 bg-slate-900 border border-slate-700 text-[10px] md:text-xs text-white px-2 py-1 rounded shadow-xl pointer-events-none transform -translate-x-1/2 z-30 whitespace-nowrap"
                style={{ left: `${(hoverIndex / (track.length - 1)) * 100}%` }}
              >
                {new Date(track[hoverIndex].timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'2-digit'})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineControl;
