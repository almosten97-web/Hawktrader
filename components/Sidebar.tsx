import React, { useState } from 'react';
import { TickerDetails, WatchlistItem } from '../types';

const POLYGON_API_KEY = 'niQ5njzWp9LYlkwYLfMz7htVsY_n3HB5';

interface SidebarProps {
  details: TickerDetails | null;
  isLoading: boolean;
  view: 'market' | 'learn';
  watchlist?: WatchlistItem[];
  onViewTicker?: (ticker: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ details, isLoading, view, watchlist = [], onViewTicker }) => {
  const [capital, setCapital] = useState<string>('10000');

  if (isLoading && !details) {
    return (
      <div className="p-6 space-y-8 animate-pulse">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto"></div>
          <div className="h-20 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const renderWatchlist = () => {
    if (watchlist.length === 0) return null;

    return (
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Watchlist</h4>
        <div className="space-y-2">
          {watchlist.map(item => {
            const isCooledDown = Date.now() >= item.coolDownUntil;
            return (
              <div 
                key={item.ticker} 
                onClick={() => onViewTicker?.(item.ticker)}
                className="bg-slate-800/40 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors group"
              >
                <div>
                  <span className="text-sm font-bold group-hover:text-blue-400">{item.ticker}</span>
                  <p className="text-[9px] text-slate-500 font-mono">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
                {isCooledDown ? (
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 font-black uppercase">Ready</span>
                ) : (
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-black uppercase">Cooling</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMarketDetails = () => {
    if (!details) return (
      <div className="p-6 text-center text-slate-500 h-full flex flex-col justify-center italic">
        Select a stock to view detailed company information.
        {renderWatchlist()}
      </div>
    );

    return (
      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 shadow-xl ring-4 ring-slate-800 overflow-hidden">
             {details.branding?.icon_url ? (
               <img src={`${details.branding.icon_url}?apiKey=${POLYGON_API_KEY}`} alt={details.name} className="max-w-full max-h-full object-contain" />
             ) : details.branding?.logo_url ? (
              <img src={`${details.branding.logo_url}?apiKey=${POLYGON_API_KEY}`} alt={details.name} className="max-w-full max-h-full object-contain" />
             ) : (
               <span className="text-3xl font-bold text-slate-900">{details.ticker[0]}</span>
             )}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{details.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">{details.ticker}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">About</h4>
          <p className="text-sm text-slate-400 leading-relaxed italic">
            {details.description || 'No description available for this company.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-800/30 p-3 rounded-lg flex justify-between items-center">
              <span className="text-xs text-slate-500">Industry</span>
              <span className="text-xs font-medium text-slate-300">{details.sic_description?.split('-')[0] || 'Unknown'}</span>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg flex justify-between items-center">
              <span className="text-xs text-slate-500">Market Cap</span>
              <span className="text-xs font-medium text-slate-300">
                {details.market_cap ? `$${(details.market_cap / 1e9).toFixed(1)}B` : '---'}
              </span>
            </div>
        </div>
        
        {renderWatchlist()}
      </div>
    );
  };

  const renderDisciplinePanel = () => {
    const riskAmount = (parseFloat(capital) || 0) * 0.01;
    return (
      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-emerald-400">Hawk Discipline</h3>
          <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-wide">Consistency Over Chaos</p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-4">
          <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">1% Risk Calculator</h4>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Total Trading Capital ($)</label>
            <input 
              type="number" 
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
            <div className="text-xs text-slate-400">Max Risk / Trade:</div>
            <div className="text-xl font-mono font-bold text-emerald-400">${riskAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Daily Protocol</h4>
          <ul className="space-y-3">
            {[
              "Stop trading after 3 consecutive losses.",
              "Close all positions before the bell.",
              "Journal every trade, especially the red ones.",
              "1% gain target = Success."
            ].map((rule, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-slate-400">
                <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {view === 'market' ? renderMarketDetails() : renderDisciplinePanel()}
    </div>
  );
};

export default Sidebar;