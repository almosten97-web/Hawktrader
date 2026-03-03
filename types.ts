
export interface StockMetric {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface TickerDetails {
  name: string;
  ticker: string;
  description: string;
  homepage_url: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
  sic_description?: string;
  market_cap?: number;
}

export interface QuoteData {
  p: number; // price
  s: number; // size
  t: number; // timestamp
}

export interface HistoricalPoint {
  date: string;
  price: number;
  volume: number;
}

export interface HotlistTicker {
  ticker: string;
  price: number;
  changePercent: number;
  reason: 'High Vol' | 'Bullish Sentiment' | 'Gainer';
  sentimentScore: number;
  isSimulated?: boolean;
}

export interface WatchlistItem {
  ticker: string;
  addedAt: number;
  coolDownUntil: number;
}

export interface SentimentAnalysis {
  ticker: string;
  score: number; // -1 to 1
  label: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  confidence: number; // 0 to 1
  reasoning: string;
}

export interface BriefingStock {
  ticker: string;
  rationale: string;
  prediction: string;
}

export interface MorningBriefing {
  summary: string;
  stocks: BriefingStock[];
  sources: Array<{ title: string; uri: string }>;
  timestamp: number;
}

export interface DashboardState {
  ticker: string;
  details: TickerDetails | null;
  history: HistoricalPoint[];
  liveQuote: QuoteData | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  isMock: boolean;
  error: string | null;
  watchlist: WatchlistItem[];
  morningBriefing: MorningBriefing | null;
}
