import { QuoteData } from '../types';
import { getMockQuote } from './mockData';

export const fetchFinnhubQuote = async (ticker: string): Promise<QuoteData | null> => {
  try {
    const symbol = ticker.replace('X:', '').replace('C:', '');
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: symbol })
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();

    if (data.c && data.c !== 0) {
      return {
        p: data.c,
        s: 0,
        t: data.t * 1000
      };
    }

    console.warn(`Finnhub returned empty data for ${ticker}, using simulation.`);
    return getMockQuote(ticker);
  } catch (error) {
    console.error('Finnhub fetch error:', error);
    return getMockQuote(ticker);
  }
};
