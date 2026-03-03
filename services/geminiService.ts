import type { HistoricalPoint, TickerDetails, SentimentAnalysis, MorningBriefing } from '../types';

const ANALYSIS_CACHE_KEY = 'hawk_analysis_cache';

const API_BASE = '';

/**
 * Request Queue Manager - staggers requests to avoid overwhelming the API
 */
class ApiRequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly STAGGER_DELAY = 2500;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLast = now - this.lastRequestTime;
          if (timeSinceLast < this.STAGGER_DELAY) {
            await new Promise(r => setTimeout(r, this.STAGGER_DELAY - timeSinceLast));
          }
          this.lastRequestTime = Date.now();
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }
    this.isProcessing = false;
  }
}

const apiQueue = new ApiRequestQueue();

async function apiFetch<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `API error ${res.status}`);
  }

  return data as T;
}

export const getAIAnalysis = async (
  details: TickerDetails,
  history: HistoricalPoint[]
): Promise<string> => {
  const ticker = details.ticker;

  try {
    const cache = JSON.parse(localStorage.getItem(ANALYSIS_CACHE_KEY) || '{}');
    if (cache[ticker] && Date.now() - cache[ticker].timestamp < 60 * 60 * 1000) {
      return cache[ticker].text;
    }
  } catch {
    /* ignore */
  }

  try {
    const { analysis } = await apiQueue.add(() =>
      apiFetch<{ analysis: string }>('/api/analyze', { details, history })
    );

    try {
      const cache = JSON.parse(localStorage.getItem(ANALYSIS_CACHE_KEY) || '{}');
      cache[ticker] = { text: analysis, timestamp: Date.now() };
      localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* ignore */
    }

    return analysis;
  } catch (err: any) {
    console.error('Analysis error:', err);
    const msg = err?.message || '';
    if (msg.includes('not configured') || msg.includes('503')) {
      return `Analysis for ${ticker} is paused. Configure GEMINI_API_KEY on your Vercel deployment.`;
    }
    return `Analysis for ${ticker} is temporarily unavailable. Please try again in 60 seconds.`;
  }
};

export const askGemini = async (ticker: string, question: string): Promise<string> => {
  try {
    const { answer } = await apiQueue.add(() =>
      apiFetch<{ answer: string }>('/api/ask', { ticker, question })
    );
    return answer;
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('not configured') || msg.includes('503')) {
      return 'Configure GEMINI_API_KEY on your Vercel deployment to enable the Gemini Terminal.';
    }
    return 'The Gemini Terminal is busy. Please wait a moment.';
  }
};

export const analyzeSentiment = async (ticker: string, text: string): Promise<SentimentAnalysis> => {
  try {
    const result = await apiQueue.add(() =>
      apiFetch<SentimentAnalysis>('/api/sentiment', { ticker, text })
    );
    return result;
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('not configured') || msg.includes('503')) {
      return { ticker, score: 0, label: 'Neutral', confidence: 0.5, reasoning: 'Configure GEMINI_API_KEY for AI sentiment.' };
    }
    return { ticker, score: 0, label: 'Neutral', confidence: 0.5, reasoning: 'Sentiment analysis temporarily unavailable.' };
  }
};

export const getMorningBriefing = async (): Promise<MorningBriefing> => {
  try {
    const briefing = await apiQueue.add(() =>
      apiFetch<MorningBriefing>('/api/briefing', {})
    );
    return briefing;
  } catch (err: any) {
    console.error('Briefing error:', err);
    const msg = err?.message || '';
    if (msg.includes('not configured') || msg.includes('503')) {
      return {
        summary: 'Configure GEMINI_API_KEY on your Vercel deployment for AI briefings.',
        stocks: [
          { ticker: 'SPY', rationale: 'Market benchmark.', prediction: 'Monitor.' },
          { ticker: 'QQQ', rationale: 'Tech sector.', prediction: 'Watch.' },
          { ticker: 'AAPL', rationale: 'Mega-cap tech.', prediction: 'Stable.' }
        ],
        sources: [],
        timestamp: Date.now()
      };
    }
    return {
      summary: 'The neural network is temporarily staggered. Reviewing historical benchmarks.',
      stocks: [{ ticker: 'SPY', rationale: 'Global benchmark.', prediction: 'Stable.' }],
      sources: [],
      timestamp: Date.now()
    };
  }
};
