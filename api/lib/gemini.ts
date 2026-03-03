import { GoogleGenAI, Type } from '@google/genai';
import type { TickerDetails, HistoricalPoint, SentimentAnalysis, MorningBriefing } from '../../types';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateAnalysis(details: TickerDetails, history: HistoricalPoint[]): Promise<string> {
  const ai = getClient();
  const recentTrend = history.length > 0
    ? history.slice(-5).map(h => `${h.date}: $${h.price}`).join(', ')
    : 'No recent history available';
  const prompt = `Provide a concise 2-paragraph financial analysis of ${details.name} (${details.ticker}). Market position and recent trend: ${recentTrend}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 1024 }
    }
  });

  return response.text || 'Analysis currently unavailable.';
}

export async function generateBriefing(): Promise<MorningBriefing> {
  const ai = getClient();
  const prompt = `Generate a "HawkTrade Morning Briefing" with global news and 3 watch stocks. JSON format with summary and watchList array of {ticker, rationale, prediction}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 4096 }
    }
  });

  const data = JSON.parse(response.text || '{}');
  const sources: Array<{ title: string; uri: string }> = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });
  }

  return {
    summary: data.summary || 'Markets are currently processing global inputs.',
    stocks: data.watchList || [],
    sources: sources.slice(0, 5),
    timestamp: Date.now()
  };
}

export async function generateAnswer(ticker: string, question: string): Promise<string> {
  const ai = getClient();
  const prompt = `Ticker: ${ticker}. Question: ${question}. Provide a brief professional insight.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 1024 }
    }
  });

  return response.text || 'No data returned.';
}

export async function generateSentiment(ticker: string, text: string): Promise<SentimentAnalysis> {
  const ai = getClient();
  const prompt = `Analyze sentiment for ${ticker}: "${text}". Return JSON with ticker, score (-1 to 1), label (Bullish|Bearish|Neutral|Volatile), confidence, reasoning.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are a financial analyst. Return sentiment as JSON only.',
      temperature: 0.1,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 1024 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ticker: { type: Type.STRING },
          score: { type: Type.NUMBER },
          label: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral', 'Volatile'] },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ['ticker', 'score', 'label', 'confidence', 'reasoning']
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return {
    ticker: result.ticker ?? ticker,
    score: result.score ?? 0,
    label: (result.label as SentimentAnalysis['label']) ?? 'Neutral',
    confidence: result.confidence ?? 0,
    reasoning: result.reasoning ?? 'Sentiment engine is cooling down.'
  };
}
