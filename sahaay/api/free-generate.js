// POST /api/free-generate — the ANONYMOUS AI proxy the public, free
// product-photo-tool calls by default (no login, no user-supplied API key).
//
// This is what actually keeps the operator's Gemini key hidden from every
// visitor: the key lives only in this function's environment (GEMINI_API_KEY),
// never in any file served to a browser. A visitor is rate-limited by a
// salted hash of their IP (see reserveFreeUsage in _lib.js) — no account,
// no cookie, nothing that identifies them beyond "today, this many requests".
//
// This endpoint is intentionally NOT behind Firebase Auth — that's the
// whole point (zero friction for a first-time visitor). The tradeoff is it
// shares Gemini's free-tier daily cap with the paid /api/generate traffic,
// which is exactly what recordGeminiCallAndWarn's operator alert is for.

import {
  getDb, setCors, HttpError, reserveFreeUsage, FREE_DAILY_IP_LIMIT,
  recordGeminiCallAndWarn, validatePhotos, buildPrompt, extractJson, normalizeResult, callGemini,
} from './_lib.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const photos = validatePhotos(req.body);
    const usedToday = await reserveFreeUsage(db, req);

    const prompt = buildPrompt(req.body);
    const rawText = await callGemini(prompt, photos);
    const result = normalizeResult(extractJson(rawText));
    await recordGeminiCallAndWarn(db);

    return res.status(200).json({
      ok: true,
      result,
      usage: { used: usedToday, limit: FREE_DAILY_IP_LIMIT },
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error('free-generate error:', err);
    return res.status(status).json({ ok: false, error: err.message || 'Something went wrong.' });
  }
}
