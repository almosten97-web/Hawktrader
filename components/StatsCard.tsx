import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  tooltip?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, tooltip }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-all group cursor-help" title={tooltip}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-mono font-bold text-white tracking-tight">{value}</div>
    </div>
  );
};

export default StatsCard;