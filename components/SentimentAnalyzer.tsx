
import React, { useState } from 'react';
import { analyzeSentiment } from '../services/geminiService';
import { SentimentAnalysis } from '../types';

interface SentimentAnalyzerProps {
  ticker: string;
  contextText: string;
}

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ ticker, contextText }) => {
  const [result, setResult] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!contextText || loading) return;
    setLoading(true);
    const data = await analyzeSentiment(ticker, contextText);
    setResult(data);
    setLoading(false);
  };

  const getScoreColor = (score: number, label?: string) => {
    if (label === 'Volatile') return 'from-amber-400 to-orange-600';
    if (score <= -0.3) return 'from-rose-500 to-red-700';
    if (score >= 0.3) return 'from-blue-500 to-indigo-700';
    return 'from-slate-400 to-slate-600';
  };

  const getLabelColorClass = (label: string) => {
    switch (label) {
      case 'Bullish': return 'text-blue-400';
      case 'Bearish': return 'text-rose-400';
      case 'Volatile': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getScorePosition = (score: number) => {
    // Convert -1..1 to 0..100%
    return ((score + 1) / 2) * 100;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 relative overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-500">
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${result ? (result.score > 0 ? 'bg-blue-500' : result.score < 0 ? 'bg-rose-500' : 'bg-slate-500') : 'bg-blue-600'}`}></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 shadow-inner">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Engine</h3>
            <p className="text-[10px] text-slate-500 font-mono">v3.1.0-alpha • {ticker}</p>
          </div>
        </div>
        {!result && (
          <button 
            onClick={runAnalysis}
            disabled={loading || !contextText}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {loading ? 'Processing...' : 'Analyze'}
          </button>
        )}
      </div>

      {!result && !loading && (
        <div className="py-6 text-center space-y-2 border-2 border-dashed border-slate-800/50 rounded-2xl">
          <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Awaiting Data Stream</p>
          <p className="text-[9px] text-slate-600 max-w-[180px] mx-auto leading-relaxed">System requires ticker context to initiate sentiment quantification.</p>
        </div>
      )}

      {loading && (
        <div className="py-12 space-y-6 flex flex-col items-center">
          <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] text-blue-400 font-mono animate-pulse uppercase tracking-[0.2em]">Parsing Linguistics</p>
            <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-1/2 animate-[loading_1s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 relative z-10">
          {/* Main Visual Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sentiment Score</span>
              <div className={`text-2xl font-mono font-black ${getLabelColorClass(result.label)}`}>
                {result.score > 0 ? '+' : ''}{result.score.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Confidence</span>
              <div className="text-2xl font-mono font-black text-white">
                {(result.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Sentiment Gauge */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className={`text-xs font-black uppercase tracking-[0.15em] ${getLabelColorClass(result.label)}`}>
                {result.label} Outlook
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Neural Weighting</span>
            </div>
            
            <div className="relative h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
              <div 
                className={`absolute inset-y-0 left-0 bg-gradient-to-r transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)] ${getScoreColor(result.score, result.label)}`}
                style={{ width: `${getScorePosition(result.score)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/10 z-10"></div>
            </div>
            
            <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-widest">
              <span>Bearish (-1.0)</span>
              <span>Neutral</span>
              <span>Bullish (+1.0)</span>
            </div>
          </div>

          {/* AI Reasoning Text */}
          <div className="bg-blue-500/[0.03] border border-blue-500/10 p-5 rounded-2xl shadow-inner relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30"></div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              <span className="text-blue-500 font-black mr-2 uppercase text-[9px]">Insight:</span>
              {result.reasoning}
            </p>
          </div>

          {/* Footer / Reset */}
          <div className="flex items-center justify-center pt-2">
             <button 
              onClick={() => setResult(null)}
              className="px-6 py-2 text-[9px] text-slate-500 hover:text-white uppercase font-black tracking-widest border border-slate-800/50 hover:border-slate-700 rounded-full transition-all bg-slate-900/40 hover:bg-slate-800 active:scale-95"
            >
              Recalibrate Sensors
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default SentimentAnalyzer;
