
import React, { useState, useEffect } from 'react';
import SentimentAnalyzer from './SentimentAnalyzer';

interface Module {
  id: number;
  title: string;
  description: string;
  tag: string;
  color: string;
  accent: string;
  content: string[];
  missions: string[];
}

const MODULES: Module[] = [
  {
    id: 1,
    title: "The 'Slow Money' Mindset",
    description: "Why chasing 100% gains leads to 100% losses. Learn to prioritize survival over the home run.",
    tag: "Mindset",
    color: "from-blue-500/20 to-blue-600/5",
    accent: "bg-blue-500",
    content: [
      "The Myth of the 'Home Run': Most retail traders blow their accounts looking for one big win. Professionals look for 1000 small ones.",
      "The Power of Compounding: A 1% gain per week results in over 60% growth annually.",
      "Defining Your 'Stop' Point: Successful traders know exactly when to walk away."
    ],
    missions: [
      "Accepted 1% daily as a massive victory.",
      "Set a maximum daily loss limit.",
      "Committed to closing the app after target hit."
    ]
  },
  {
    id: 2,
    title: "Risk Architecture",
    description: "The 1% Invariant: Absolute risk caps per entry. Hard stop enforcement required.",
    tag: "Risk",
    color: "from-rose-500/20 to-rose-600/5",
    accent: "bg-rose-500",
    content: [
      "The 1% Absolute Rule: If your account is $10k, you never lose more than $100 on a single trade.",
      "Hard vs. Soft Brackets: Use hard bracket orders to protect your capital effectively.",
      "Risk-to-Reward (R:R): Never enter a trade where the potential reward isn't at least 2x the risk."
    ],
    missions: [
      "Calculated 1% risk pool in the sidebar.",
      "Enabled hard bracket order protocols.",
      "Verified average R:R is above 2.0."
    ]
  },
  {
    id: 3,
    title: "Technical Execution",
    description: "High-probability setups using RSI and Moving Averages.",
    tag: "Execution",
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "bg-emerald-500",
    content: [
      "RSI Discipline: Look for longs at RSI 30 bounces, and shorts at RSI 70 rejections.",
      "Trend Alignment: Only trade in the direction of the 200-period Moving Average.",
      "The 'Wait' Strategy: Sometimes the most profitable move is not clicking the buy button."
    ],
    missions: [
      "Identified a support bounce on chart.",
      "Waited for candle confirmation before entry.",
      "Logged session with zero FOMO entries."
    ]
  },
  {
    id: 4,
    title: "Post-Trade Audit",
    description: "Neutral auditing of execution accuracy. Rules-based reward systems.",
    tag: "Discipline",
    color: "from-purple-500/20 to-purple-600/5",
    accent: "bg-purple-500",
    content: [
      "Reviewing the Red: A loss is just tuition. Analyze it objectively.",
      "Process Fidelity: Track protocol adherence streaks, not P/L.",
      "Emotional Log: Write down how you felt during the drawdown."
    ],
    missions: [
      "Logged emotions for today's biggest trade.",
      "Analyzed one loss without anger.",
      "Hit a 3-day 'Rule Following' streak."
    ]
  }
];

const StrategyCenter: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedNotes = localStorage.getItem('hawk_strategy_notes');
    const savedMissions = localStorage.getItem('hawk_missions');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedMissions) setCompletedMissions(JSON.parse(savedMissions));
  }, []);

  const saveNote = (id: number, text: string) => {
    const newNotes = { ...notes, [id]: text };
    setNotes(newNotes);
    localStorage.setItem('hawk_strategy_notes', JSON.stringify(newNotes));
  };

  const toggleMission = (mission: string) => {
    const newMissions = { ...completedMissions, [mission]: !completedMissions[mission] };
    setCompletedMissions(newMissions);
    localStorage.setItem('hawk_missions', JSON.stringify(newMissions));
  };

  const activeModule = MODULES.find(m => m.id === activeModuleId);

  if (activeModule) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setActiveModuleId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group mb-4"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Strategy Center
        </button>

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${activeModule.accent}`}>
              {activeModule.tag}
            </span>
            <h2 className="text-4xl font-bold">{activeModule.title}</h2>
          </div>
          <p className="text-xl text-slate-400 leading-relaxed">{activeModule.description}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Key Principles
              </h3>
              <div className="space-y-6">
                {activeModule.content.map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-blue-500 font-mono font-bold pt-1">0{i+1}</div>
                    <p className="text-slate-300 leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                Personal Strategy Journal
              </h3>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Input specific rules or reflections</p>
              <textarea 
                value={notes[activeModule.id] || ''}
                onChange={(e) => saveNote(activeModule.id, e.target.value)}
                placeholder="Ex: My daily loss limit for this asset is exactly $150..."
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 resize-none font-mono text-sm"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Auto-saving locally...</span>
                <span>{notes[activeModule.id]?.length || 0} characters</span>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6">Hawk Missions</h3>
              <div className="space-y-4">
                {activeModule.missions.map((m, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={!!completedMissions[m]}
                      onChange={() => toggleMission(m)}
                      className="mt-1 w-4 h-4 bg-slate-950 border-slate-800 rounded checked:bg-emerald-500 focus:ring-0 transition-all"
                    />
                    <span className={`text-sm transition-colors ${completedMissions[m] ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>
                      {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1">
              <SentimentAnalyzer 
                ticker="MARKET" 
                contextText={activeModule.content.join(' ') + " " + (notes[activeModule.id] || "")} 
              />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 animate-in fade-in duration-700">
      <section className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Strategy Library</h2>
        <p className="text-slate-400 max-w-2xl text-lg">
          Master the "Small Win" strategy. Trade with discipline and prioritize capital preservation.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MODULES.map((m) => {
          const progress = m.missions.filter(ms => completedMissions[ms]).length;
          const percent = Math.round((progress / m.missions.length) * 100);
          
          return (
            <div 
              key={m.id} 
              onClick={() => setActiveModuleId(m.id)}
              className={`group relative overflow-hidden bg-gradient-to-br ${m.color} border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-all cursor-pointer`}
            >
              <div className="space-y-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${m.accent}`}>
                  {m.tag}
                </span>
                <h3 className="text-2xl font-bold group-hover:text-white transition-colors">{m.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {m.description}
                </p>
                
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Progress</span>
                    <span className={percent === 100 ? 'text-emerald-500' : ''}>{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${percent === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-blue-500'}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all pt-2">
                  {percent > 0 ? 'Continue Lesson' : 'Start Learning'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">The Power of Compounding</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-mono font-bold text-emerald-400">1.0%</div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target Daily Return</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-mono font-bold text-blue-400">252</div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Trading Days / Year</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-mono font-bold text-rose-400">0.5%</div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Max Drawdown Target</p>
            </div>
          </div>
        </div>
        
        <SentimentAnalyzer 
          ticker="GLOBAL" 
          contextText="The market is showing resilience with a focus on risk management and consistent small gains over high volatility gambling." 
        />
      </div>
    </div>
  );
};

export default StrategyCenter;
