
import React from 'react';
import { MorningBriefing } from '../types';

interface MorningBriefingProps {
  data: MorningBriefing | null;
  loading: boolean;
}

const MorningBriefingComponent: React.FC<MorningBriefingProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4"></div>
        <div className="h-20 bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
          <div className="h-32 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600/10 via-slate-900/50 to-blue-600/5 border border-indigo-500/20 rounded-3xl p-8 space-y-8 relative overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">Neural Intel Briefing</h2>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></span>
              Synchronized: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.sources.map((source, i) => (
            <a 
              key={i}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 hover:bg-indigo-600 hover:text-white transition-all border border-slate-700/50"
              title={source.title}
            >
              {i + 1}
            </a>
          ))}
          <span className="text-[10px] text-slate-600 font-bold uppercase ml-2">Verification Sources</span>
        </div>
      </div>

      <div className="bg-slate-950/50 border border-white/5 p-6 rounded-2xl relative">
        <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">Global Snapshot</div>
        <p className="text-slate-300 leading-relaxed italic text-sm">
          "{data.summary}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.stocks.map((stock, i) => (
          <div 
            key={i} 
            className="group bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-all cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-indigo-400 font-mono tracking-tighter">{stock.ticker}</span>
              <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-400 font-black uppercase">Morning Tip</div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Neural Rationale</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">
                  {stock.rationale}
                </p>
              </div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-[9px] text-indigo-500 uppercase font-black tracking-widest mb-1">Hawk Prediction</p>
                <p className="text-xs text-white font-bold leading-tight">
                  {stock.prediction}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">
        <span>Protocol: Expert Synthesis Layer</span>
        <span className="flex items-center gap-2">
          <span className="text-indigo-400">Status:</span> Nominal Analysis Phase
        </span>
      </div>
    </div>
  );
};

export default MorningBriefingComponent;
