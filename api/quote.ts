import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'FINNHUB_API_KEY not configured' });
  }

  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' });
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || 'Finnhub error' });
    }
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Quote API error:', err);
    return res.status(500).json({ error: err?.message || 'Quote fetch failed' });
  }
}
