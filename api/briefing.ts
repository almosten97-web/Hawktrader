import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateBriefing } from './lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const briefing = await generateBriefing();
    return res.status(200).json(briefing);
  } catch (err: any) {
    console.error('Briefing API error:', err);
    const msg = err?.message || 'Briefing failed';
    const status = msg.includes('not configured') ? 503 : 500;
    return res.status(status).json({ error: msg });
  }
}
