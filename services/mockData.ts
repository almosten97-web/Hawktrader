
import { TickerDetails, HistoricalPoint, QuoteData } from '../types';

export const MOCK_DETAILS: Record<string, TickerDetails> = {
  'AAPL': {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services.',
    homepage_url: 'https://www.apple.com',
    sic_description: 'Electronic Computers',
    market_cap: 2800000000000,
    branding: { logo_url: 'https://logo.clearbit.com/apple.com' }
  },
  'NVDA': {
    name: 'NVIDIA Corporation',
    ticker: 'NVDA',
    description: 'NVIDIA Corporation focuses on personal computer (PC) graphics, graphics processing unit (GPU), and also on artificial intelligence (AI).',
    homepage_url: 'https://www.nvidia.com',
    sic_description: 'Semiconductors & Related Devices',
    market_cap: 2200000000000,
    branding: { logo_url: 'https://logo.clearbit.com/nvidia.com' }
  }
};

export const generateMockHistory = (basePrice: number): HistoricalPoint[] => {
  const points: HistoricalPoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const randomVariation = (Math.random() - 0.5) * (basePrice * 0.05);
    points.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: basePrice + randomVariation + (i * 0.5), // Artificial slight uptrend
      volume: Math.floor(Math.random() * 50000000) + 10000000
    });
  }
  return points;
};

export const getMockQuote = (ticker: string): QuoteData => {
  const base = ticker === 'AAPL' ? 175 : ticker === 'NVDA' ? 880 : 100;
  return {
    p: base + (Math.random() - 0.5) * 5,
    s: 100,
    t: Date.now()
  };
};
