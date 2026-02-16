import { QuoteData } from '../types';
import { getMockQuote } from './mockData';

const FINNHUB_API_KEY = 'd69lkahr01qhe6mnu960d69lkahr01qhe6mnu96g';
const BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Fetches real-time price from Finnhub.
 * Finnhub free tier allows 60 requests per minute.
 * Includes a robust fallback to simulated data on network failure.
 */
export const fetchFinnhubQuote = async (ticker: string): Promise<QuoteData | null> => {
  try {
    // Standardize ticker for Finnhub (remove Polygon prefixes for crypto if present)
    const symbol = ticker.replace('X:', '').replace('C:', '');
    const url = `${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Finnhub API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Finnhub returns 'c' as the current price. 
    // If c is 0, it usually means the symbol wasn't found or API limit reached.
    if (data.c && data.c !== 0) {
      return {
        p: data.c,
        s: 0, // Finnhub basic quote doesn't provide size
        t: data.t * 1000 // Convert seconds to milliseconds
      };
    }
    
    // If price is 0 or missing, trigger fallback
    console.warn(`Finnhub returned empty data for ${ticker}, using simulation.`);
    return getMockQuote(ticker);
  } catch (error) {
    // This catches 'Failed to fetch' (network/CORS issues)
    console.error("Finnhub fetch error:", error);
    console.warn(`Attempting recovery with simulated live feed for ${ticker}...`);
    return getMockQuote(ticker);
  }
};