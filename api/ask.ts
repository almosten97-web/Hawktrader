import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAnswer } from './lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ticker, question } = req.body;
    if (!ticker || !question) {
      return res.status(400).json({ error: 'Missing ticker or question' });
    }

    const answer = await generateAnswer(ticker, question);
    return res.status(200).json({ answer });
  } catch (err: any) {
    console.error('Ask API error:', err);
    const msg = err?.message || 'Request failed';
    const status = msg.includes('not configured') ? 503 : 500;
    return res.status(status).json({ error: msg });
  }
}
