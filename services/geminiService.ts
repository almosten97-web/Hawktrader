
import { GoogleGenAI, Type } from "@google/genai";
import { HistoricalPoint, TickerDetails, SentimentAnalysis, MorningBriefing } from "../types";

export const getAIAnalysis = async (
  details: TickerDetails, 
  history: HistoricalPoint[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const recentTrend = history.length > 0 
    ? history.slice(-5).map(h => `${h.date}: $${h.price}`).join(', ')
    : 'No recent history available';

  const prompt = `
    As a senior financial analyst, provide a concise (2-3 paragraph) analysis of ${details.name} (${details.ticker}).
    
    Context:
    - Description: ${details.description.substring(0, 500)}...
    - Recent 5-day Price Action: ${recentTrend}
    
    Instructions:
    - Briefly comment on the company's market position and industry relevance.
    - Analyze the recent price trend.
    - Maintain a professional, objective tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        // Removed thinkingBudget: 0 as gemini-3-pro-preview requires thinking mode.
      }
    });
    
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "The AI analyst is currently offline.";
  }
};

export const askGemini = async (ticker: string, question: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Ticker: ${ticker}. Question: ${question}. Provide a brief, professional financial insight based on current market knowledge.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.4 }
    });
    return response.text || "No data returned.";
  } catch (err) {
    return "Error connecting to Gemini Terminal.";
  }
};

export const analyzeSentiment = async (ticker: string, text: string): Promise<SentimentAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a specialized Financial Analyst AI for HawkTrade. Your sole purpose is to perform Aspect-Based Sentiment Analysis on stock market data.

Guidelines:
- Scoring: Provide a score between -1.0 (Strongly Bearish) and 1.0 (Strongly Bullish).
- Logic: Weigh fundamental news (earnings, product launches) more heavily than social media 'hype'.
- Output Format: You MUST return responses in a strict JSON format. Do not include markdown formatting or extra text.`;

  const prompt = `Analyze the market sentiment for ticker: ${ticker} based on the following insights: "${text}".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            score: { type: Type.NUMBER, description: "Sentiment score from -1 to 1" },
            label: { 
              type: Type.STRING, 
              enum: ["Bullish", "Bearish", "Neutral", "Volatile"],
              description: "The one-word 'vibe' of the asset" 
            },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
            reasoning: { type: Type.STRING, description: "Max 2 sentence explanation" }
          },
          required: ["ticker", "score", "label", "confidence", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      ticker: result.ticker ?? ticker,
      score: result.score ?? 0,
      label: (result.label as any) ?? 'Neutral',
      confidence: result.confidence ?? 0,
      reasoning: result.reasoning ?? 'Insufficient data for analysis.'
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { 
      ticker, 
      score: 0, 
      label: 'Neutral', 
      confidence: 0, 
      reasoning: 'The Neural Sentiment Engine encountered an error.' 
    };
  }
};

export const getMorningBriefing = async (): Promise<MorningBriefing> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Generate a high-level "HawkTrade Morning Briefing" for today. 
  Focus on:
  1. Top market-moving news globally.
  2. 3 Specific stocks to watch today with deep expert reasoning.
  3. Price predictions for these 3 stocks based on expert understanding of current events.
  
  Provide the output in JSON format with fields: summary (string), watchList (array of {ticker, rationale, prediction}).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            watchList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  prediction: { type: Type.STRING }
                },
                required: ["ticker", "rationale", "prediction"]
              }
            }
          },
          required: ["summary", "watchList"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    const sources: Array<{ title: string; uri: string }> = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      summary: data.summary || "Unable to aggregate global news stream.",
      stocks: data.watchList || [],
      sources: sources.slice(0, 5),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Morning briefing error:", error);
    throw error;
  }
};
