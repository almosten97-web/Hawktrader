
import React, { useState, useEffect } from 'react';
import { DashboardState } from '../types';
import StockChart from './StockChart';
import StatsCard from './StatsCard';
import SentimentAnalyzer from './SentimentAnalyzer';
import { askGemini } from '../services/geminiService';

interface DashboardProps {
  state: DashboardState;
  aiAnalysis: string;
  isAnalyzing: boolean;
  isBriefingLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, aiAnalysis, isAnalyzing, isBriefingLoading }) => {
  const { details, history, liveQuote, lastUpdated, isLoading, isMock, ticker, watchlist } = state;
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const watchlistInfo = watchlist.find(i => i.ticker === ticker);
  const isCooledDown = watchlistInfo ? Date.now() >= watchlistInfo.coolDownUntil : true;

  useEffect(() => {
    if (!watchlistInfo || isCooledDown) return;

    const interval = setInterval(() => {
      const diff = watchlistInfo.coolDownUntil - Date.now();
      if (diff <= 0) {
        setIsPriceUpdating(false);
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [watchlistInfo, isCooledDown]);

  useEffect(() => {
    if (liveQuote?.p) {
      setIsPriceUpdating(true);
      const timer = setTimeout(() => setIsPriceUpdating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [liveQuote?.p]);

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    setChatLoading(true);
    const resp = await askGemini(ticker, chatInput);
    setChatResponse(resp);
    setChatLoading(false);
  };

  if (isLoading && !details) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>)}
        </div>
        <div className="h-[400px] bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  const lastHistoricalPrice = history.length > 0 ? history[history.length - 1].price : 0;
  const currentPrice = liveQuote?.p || lastHistoricalPrice;
  const previousPrice = history.length > 1 ? history[history.length - 2].price : lastHistoricalPrice;
  const priceColor = currentPrice >= previousPrice ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12">
      {!isCooledDown && (
        <div className="bg-amber-500/5 border border-amber-500/10 py-1 px-4 rounded-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Protocol Cooldown</span>
            <span className="text-[9px] text-slate-500 italic">48h Research Active.</span>
          </div>
          <p className="text-[10px] font-mono font-bold text-amber-500">{timeLeft}</p>
        </div>
      )}

      {/* Ultra-Thin Strategy Banner */}
      <div className="bg-blue-600/5 border border-blue-500/10 py-1.5 px-4 rounded-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-blue-600 rounded text-white scale-75">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Hawk Strategy Sync</span>
          <span className="text-[9px] text-slate-600 hidden lg:inline uppercase tracking-tighter">1% Risk Tolerance • RSI Scanning Engaged</span>
        </div>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all text-[9px] font-bold uppercase tracking-widest ${isChatOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400'}`}
        >
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
             <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          </svg>
          {isChatOpen ? 'Exit' : 'Ask Gemini'}
        </button>
      </div>

      {/* Gemini Chat Input Field */}
      {isChatOpen && (
        <div className="bg-slate-900/80 border border-blue-500/20 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-md">
          <form onSubmit={handleAskGemini} className="flex gap-2">
            <input 
              autoFocus
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Query Gemini Terminal about ${ticker}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
            />
            <button 
              disabled={chatLoading}
              className="px-4 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/10"
            >
              {chatLoading ? 'Processing...' : 'Ask'}
            </button>
          </form>
          {chatResponse && (
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 animate-in fade-in duration-500">
               <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                 <span className="text-blue-500 mr-2 font-bold">GEMINI:</span>
                 {chatResponse}
               </p>
            </div>
          )}
        </div>
      )}

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight text-white">
              {details?.name || state.ticker}
              <span className="ml-2 text-slate-500 font-medium text-xl tracking-normal">{details?.ticker}</span>
            </h2>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">{details?.sic_description || 'Public Equity'}</p>
        </div>
        
        <div className="flex flex-col items-start md:items-end">
          <div className={`text-5xl font-mono font-bold transition-all duration-300 ${priceColor} ${isPriceUpdating ? 'scale-105 opacity-80' : 'scale-100'}`}>
            ${currentPrice > 0 ? currentPrice.toFixed(2) : '---'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isMock ? 'bg-amber-500/5 border-amber-500/10' : 'bg-slate-900 border-slate-800'}`}>
              <div className={`w-1 h-1 rounded-full ${!isMock ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
              <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">
                {isMock ? 'SIMULATED' : 'LIVE FEED'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Day High" value={history.length > 0 ? `$${Math.max(...history.slice(-1).map(h => h.price)).toFixed(2)}` : '---'} />
        <StatsCard label="Day Low" value={history.length > 0 ? `$${Math.min(...history.slice(-1).map(h => h.price)).toFixed(2)}` : '---'} />
        <StatsCard label="Prev Close" value={history.length > 0 ? `$${history[history.length - 1].price.toFixed(2)}` : '---'} />
        <StatsCard label="Volume" value={history.length > 0 ? (history[history.length - 1].volume / 1000000).toFixed(1) + 'M' : '---'} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-inner">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Price Action
            </h3>
            <div className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-500 rounded-full text-[9px] font-bold uppercase tracking-widest">30D History</div>
          </div>
          <div className="w-full h-[320px] relative overflow-hidden block">
            <StockChart data={history} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 px-1 text-white">
            <span className="w-1.5 h-3 bg-purple-500 rounded-full"></span>
            Sentiment Analysis
          </h3>
          <SentimentAnalyzer 
            ticker={ticker} 
            contextText={aiAnalysis || "Aggregating fundamental data for neural vibe check."} 
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10 rounded-2xl p-6 overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">Hawk Insights</h3>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Neural Engine Report</p>
          </div>
        </div>
        {isAnalyzing ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-3.5 bg-slate-800/50 rounded w-full"></div>
            <div className="h-3.5 bg-slate-800/50 rounded w-11/12"></div>
          </div>
        ) : (
          <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm font-medium">
            {aiAnalysis || "Generating neural insights..."}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
