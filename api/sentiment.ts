import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateSentiment } from './lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker, text } = req.body;
    if (!ticker || !text) {
      return res.status(400).json({ error: 'Missing ticker or text' });
    }

    const sentiment = await generateSentiment(ticker, text);
    return res.status(200).json(sentiment);
  } catch (err: any) {
    console.error('Sentiment API error:', err);
    const msg = err?.message || 'Sentiment analysis failed';
    const status = msg.includes('not configured') ? 503 : 500;
    return res.status(status).json({ error: msg });
  }
}
