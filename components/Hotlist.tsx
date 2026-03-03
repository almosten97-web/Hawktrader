
import React, { useEffect, useState } from 'react';
import { fetchHotlist } from '../services/hotlistService';
import { HotlistTicker, MorningBriefing } from '../types';
import MorningBriefingComponent from './MorningBriefing';

interface HotlistProps {
  onAddToWatchlist: (ticker: string) => void;
  onViewTicker: (ticker: string) => void;
  watchlist: string[];
  morningBriefing: MorningBriefing | null;
  isBriefingLoading: boolean;
}

const Hotlist: React.FC<HotlistProps> = ({ 
  onAddToWatchlist, 
  onViewTicker, 
  watchlist, 
  morningBriefing, 
  isBriefingLoading 
}) => {
  const [candidates, setCandidates] = useState<HotlistTicker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchHotlist();
      setCandidates(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Morning Intelligence Briefing Section */}
      <section className="space-y-4">
        <MorningBriefingComponent data={morningBriefing} loading={isBriefingLoading} />
      </section>

      {/* Discovery Hotlist Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
              Discovery Hotlist
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Scanning High-Momentum Assets</p>
          </div>
          <div className="px-4 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner">
            Live Feed Active
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-slate-900/50 border border-slate-800 rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((c) => {
              const isAdded = watchlist.includes(c.ticker);
              const colorClass = c.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400';
              const reasonColor = c.reason === 'Bullish Sentiment' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                c.reason === 'Gainer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                'bg-purple-500/10 text-purple-400 border-purple-500/20';

              return (
                <div 
                  key={c.ticker}
                  className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:border-slate-600 transition-all group relative overflow-hidden shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="cursor-pointer space-y-1"
                      onClick={() => onViewTicker(c.ticker)}
                    >
                      <h4 className="text-2xl font-black group-hover:text-indigo-400 transition-colors font-mono tracking-tighter">{c.ticker}</h4>
                      <p className={`text-xs font-mono font-bold ${colorClass}`}>
                        {c.changePercent >= 0 ? '+' : ''}{c.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${reasonColor}`}>
                      {c.reason}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Last Quote</p>
                      <p className="text-xl font-mono font-black text-white tracking-tight">${c.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => onAddToWatchlist(c.ticker)}
                      disabled={isAdded}
                      className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-lg ${isAdded ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-90'}`}
                    >
                      {isAdded ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {c.isSimulated && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500/20"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Hotlist;
