
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchTickerDetails, 
  fetchHistoricalData
} from './services/polygonService';
import { fetchFinnhubQuote } from './services/finnhubService';
import { getAIAnalysis, getMorningBriefing } from './services/geminiService';
import { DashboardState, WatchlistItem, MorningBriefing } from './types';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import TickerSearch from './components/TickerSearch';
import StrategyCenter from './components/StrategyCenter';
import Hotlist from './components/Hotlist';

const POLLING_INTERVAL = 5000;

const App: React.FC = () => {
  const [view, setView] = useState<'market' | 'learn' | 'hotlist'>('market');
  const [state, setState] = useState<DashboardState>({
    ticker: 'AAPL',
    details: null,
    history: [],
    liveQuote: null,
    lastUpdated: null,
    isLoading: false,
    isMock: false,
    error: null,
    watchlist: [],
    morningBriefing: null,
  });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('hawk_watchlist');
      if (savedWatchlist) {
        const parsed = JSON.parse(savedWatchlist);
        if (Array.isArray(parsed)) {
          setState(prev => ({ ...prev, watchlist: parsed }));
        }
      }
    } catch {
      // Corrupt localStorage – ignore
    }

    try {
      const savedBriefing = localStorage.getItem('hawk_morning_briefing');
      if (savedBriefing) {
        const parsed = JSON.parse(savedBriefing);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) {
          setState(prev => ({ ...prev, morningBriefing: parsed }));
        } else {
          triggerMorningBriefing();
        }
      } else {
        triggerMorningBriefing();
      }
    } catch {
      triggerMorningBriefing();
    }
  }, []);

  const triggerMorningBriefing = async () => {
    setIsBriefingLoading(true);
    try {
      const briefing = await getMorningBriefing();
      setState(prev => ({ ...prev, morningBriefing: briefing }));
      localStorage.setItem('hawk_morning_briefing', JSON.stringify(briefing));
    } catch (err) {
      console.error("Briefing error:", err);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const saveWatchlist = (list: WatchlistItem[]) => {
    localStorage.setItem('hawk_watchlist', JSON.stringify(list));
  };

  const startPolling = useCallback((ticker: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const quote = await fetchFinnhubQuote(ticker);
        if (quote) {
          setState(prev => ({
            ...prev,
            liveQuote: quote,
            lastUpdated: new Date()
          }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLLING_INTERVAL);
  }, []);

  const loadData = useCallback(async (ticker: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, ticker }));
    
    try {
      const details = await fetchTickerDetails(ticker);
      const history = await fetchHistoricalData(ticker);
      const quote = await fetchFinnhubQuote(ticker);
      const isMockData = !details
        ? true
        : (details.description?.includes?.('simulated data') ?? false);

      setState(prev => ({
        ...prev,
        details,
        history,
        liveQuote: quote,
        lastUpdated: new Date(),
        isLoading: false,
        isMock: isMockData
      }));

      if (details) {
        setIsAnalyzing(true);
        try {
          const analysis = await getAIAnalysis(details, history);
          setAiAnalysis(analysis);
        } finally {
          setIsAnalyzing(false);
        }
      }

      startPolling(ticker);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Critical failure loading stock data."
      }));
    }
  }, [startPolling]);

  useEffect(() => {
    loadData('AAPL');
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadData]);

  const handleSearch = (ticker: string) => {
    setView('market');
    loadData(ticker.toUpperCase());
  };

  const addToWatchlist = (ticker: string) => {
    const now = Date.now();
    const coolDown = now + (48 * 60 * 60 * 1000); 
    const newItem: WatchlistItem = {
      ticker,
      addedAt: now,
      coolDownUntil: coolDown
    };
    const newList = [...state.watchlist, newItem];
    setState(prev => ({ ...prev, watchlist: newList }));
    saveWatchlist(newList);
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 cursor-pointer" 
                onClick={() => setView('market')}
              >
                π
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">HawkTrade</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              <button 
                onClick={() => setView('market')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'market' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Market
              </button>
              <button 
                onClick={() => setView('hotlist')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'hotlist' ? 'bg-slate-800 text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Hotlist
              </button>
              <button 
                onClick={() => setView('learn')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'learn' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Strategy
              </button>
            </nav>
          </div>
          
          <div className="max-w-[240px] flex-1">
            <TickerSearch onSearch={handleSearch} isLoading={state.isLoading} />
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className={`px-3 py-1 border rounded-full text-[10px] font-medium uppercase tracking-wider flex items-center gap-2 transition-colors ${state.isMock ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${state.isMock ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {state.isMock ? 'Simulated' : 'Live Term'}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {state.error ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-4">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <button onClick={() => loadData('AAPL')} className="mt-4 px-6 py-2 bg-blue-600 rounded-xl text-sm font-bold">Retry</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-scroll p-4 lg:p-6 custom-scrollbar min-h-0">
              {view === 'market' ? (
                <Dashboard state={state} aiAnalysis={aiAnalysis} isAnalyzing={isAnalyzing} isBriefingLoading={isBriefingLoading} />
              ) : view === 'hotlist' ? (
                <Hotlist
                  onAddToWatchlist={addToWatchlist}
                  onViewTicker={handleSearch}
                  watchlist={state.watchlist.map(i => i.ticker)}
                  morningBriefing={state.morningBriefing}
                  isBriefingLoading={isBriefingLoading}
                />
              ) : (
                <StrategyCenter />
              )}
            </div>
            {view !== 'learn' && (
              <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50 overflow-y-auto hidden md:block min-h-0">
                <Sidebar
                  details={state.details}
                  isLoading={state.isLoading}
                  view={view === 'market' ? 'market' : 'learn'}
                  watchlist={state.watchlist}
                  onViewTicker={handleSearch}
                />
              </aside>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
