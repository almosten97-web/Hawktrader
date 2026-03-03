import { TickerDetails, HistoricalPoint } from '../types';
import { MOCK_DETAILS, generateMockHistory } from './mockData';

export const fetchTickerDetails = async (ticker: string): Promise<TickerDetails> => {
  try {
    const res = await fetch('/api/details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    const results = data?.results;
    if (!results || typeof results !== 'object') {
      throw new Error('Invalid or empty results');
    }
    return {
      name: results.name ?? `${ticker} Corp`,
      ticker: results.ticker ?? ticker,
      description: results.description ?? 'Company profile unavailable. Serving simulated data due to API limits.',
      homepage_url: results.homepage_url ?? '',
      sic_description: results.sic_description ?? 'General Industry',
      branding: results.branding,
      market_cap: results.market_cap
    };
  } catch (error) {
    console.warn(`Polygon API Error (Details), using mock for ${ticker}`);
    return MOCK_DETAILS[ticker] || {
      name: `${ticker} Corp`,
      ticker: ticker,
      description: 'Standard company profile unavailable. Serving simulated data due to API limits.',
      homepage_url: '',
      sic_description: 'General Industry'
    };
  }
};

export const fetchHistoricalData = async (
  ticker: string,
  days: number = 30
): Promise<HistoricalPoint[]> => {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, days })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) throw new Error('No results');

    return data.results.map((r: any) => ({
      date: new Date(r.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: r.c,
      volume: r.v
    }));
  } catch (error) {
    console.warn(`Polygon API Error (History), using mock for ${ticker}`);
    const base = ticker === 'AAPL' ? 175 : ticker === 'NVDA' ? 880 : 100;
    return generateMockHistory(base);
  }
};
