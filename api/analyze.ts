import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAnalysis } from './lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { details, history } = req.body;
    if (!details || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Missing details or history' });
    }

    const analysis = await generateAnalysis(details, history);
    return res.status(200).json({ analysis });
  } catch (err: any) {
    console.error('Analyze API error:', err);
    const msg = err?.message || 'Analysis failed';
    const status = msg.includes('not configured') ? 503 : 500;
    return res.status(status).json({ error: msg });
  }
}
