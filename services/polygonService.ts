import { TickerDetails, HistoricalPoint } from '../types';
import { MOCK_DETAILS, generateMockHistory } from './mockData';

const BASE_URL = 'https://api.polygon.io';
const HARDCODED_API_KEY = 'niQ5njzWp9LYlkwYLfMz7htVsY_n3HB5';

export const fetchTickerDetails = async (ticker: string, apiKey: string = HARDCODED_API_KEY): Promise<TickerDetails> => {
  try {
    const url = `${BASE_URL}/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    return data.results;
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
  apiKey: string = HARDCODED_API_KEY, 
  days: number = 30
): Promise<HistoricalPoint[]> => {
  try {
    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const from = fromDate.toISOString().split('T')[0];

    const url = `${BASE_URL}/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) throw new Error("No results");

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
