import React, { useState } from 'react';

interface TickerSearchProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
}

const TickerSearch: React.FC<TickerSearchProps> = ({ onSearch, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group flex items-center gap-1">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
          <svg className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="Ticker..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 uppercase"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
      >
        {isLoading ? '...' : 'Go'}
      </button>
    </form>
  );
};

export default TickerSearch;
