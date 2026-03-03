import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'POLYGON_API_KEY not configured' });
  }

  const { ticker, days = 30 } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Missing ticker' });
  }

  try {
    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days));
    const from = fromDate.toISOString().split('T')[0];

    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error || 'Polygon error' });
    }
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('History API error:', err);
    return res.status(500).json({ error: err?.message || 'History fetch failed' });
  }
}
