// POST /api/generate — the paid AI proxy.
// Verifies the caller is signed in and subscribed, enforces a monthly usage
// cap (so one account can't run up the AI bill), calls Gemini with OUR
// server-side key, and returns a clean parsed listing. The API key never
// reaches the browser.

import { getDb, requireUser, setCors, HttpError, MONTHLY_QUOTA, isSubscriptionActive, recordGeminiCallAndWarn } from './_lib.js';

const MAX_PHOTOS = 4;
const MAX_BASE64_CHARS = 2_000_000; // ~1.5MB per photo after base64 overhead

function buildPrompt(body) {
  const { productName, category, platform, features, tone, length, useEmojis } = body;
  const lines = [];
  lines.push(
    'You are an expert e-commerce copywriter. Look carefully at the attached product photo(s) and write a ready-to-publish online listing for the item shown.'
  );
  lines.push(
    'Base what you can see (shape, material, color, style, condition, notable features) on the photos. Use any extra facts given below as ground truth. Never invent brand names, certifications, materials, prices, or claims that are not visible in the photo or given below — if unsure, describe generally instead of guessing.'
  );
  lines.push(`Where this will be sold: ${platform || 'a general online store'}.`);
  lines.push(`Tone of voice: ${tone || 'Friendly & persuasive'}.`);
  lines.push(`Length: ${length || 'Standard'}.`);
  lines.push(`Emojis: ${useEmojis ? 'use a few tasteful emojis' : 'do not use any emojis'}.`);
  if (productName) lines.push(`Product name / brand provided by seller: ${productName}.`);
  if (category) lines.push(`Category provided by seller: ${category}.`);
  if (features) lines.push(`Extra details provided by seller (treat as accurate): ${features}`);

  lines.push('');
  lines.push('Respond with ONLY a single valid JSON object (no markdown fences, no commentary) with exactly these keys:');
  lines.push(`{
  "title": "short SEO-friendly product title, under 90 characters",
  "shortDescription": "1-2 sentence hook/summary, great for a search result or social caption",
  "longDescription": "2-4 short paragraphs, persuasive and descriptive, suitable as the main listing body",
  "bullets": ["5-6 short feature/benefit bullet points, each under 15 words"],
  "tags": ["8-12 relevant keyword tags a buyer might search, lowercase, no # symbol"],
  "suggestedCategory": "one best-fit product category"
}`);
  return lines.join('\n');
}

function extractJson(text) {
  if (!text) throw new Error('empty AI response');
  let cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('could not parse AI response as JSON');
  }
}

function normalizeResult(raw) {
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean).map(String) : []);
  return {
    title: String(raw.title || raw.productTitle || '').trim(),
    shortDescription: String(raw.shortDescription || raw.summary || '').trim(),
    longDescription: String(raw.longDescription || raw.description || '').trim(),
    bullets: arr(raw.bullets || raw.highlights || raw.features),
    tags: arr(raw.tags || raw.keywords),
    suggestedCategory: String(raw.suggestedCategory || raw.category || '').trim(),
  };
}

async function callGemini(prompt, photos) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const parts = [{ text: prompt }];
  photos.forEach((p) => parts.push({ inline_data: { mime_type: p.mime || 'image/jpeg', data: p.base64 } }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new HttpError(502, data?.error?.message || `AI provider error (${res.status})`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) throw new HttpError(502, 'The AI returned an empty response. Please try again.');
  return text;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    const db = getDb();
    const userRef = db.doc(`users/${user.uid}`);

    const photos = Array.isArray(req.body?.photos) ? req.body.photos.slice(0, MAX_PHOTOS) : [];
    if (photos.length === 0) throw new HttpError(400, 'Add at least one photo.');
    for (const p of photos) {
      if (!p?.base64 || p.base64.length > MAX_BASE64_CHARS) {
        throw new HttpError(413, 'One of the photos is too large. Try a smaller image.');
      }
    }

    // Transaction: read subscription + usage, enforce both, and reserve one
    // unit of quota atomically, so two simultaneous requests can't both slip
    // through under the cap.
    const usageAfter = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const month = new Date().toISOString().slice(0, 7);
      let data = snap.exists
        ? snap.data()
        : { subscriptionStatus: 'none', usageMonth: month, usageCount: 0 };

      if (!isSubscriptionActive(data)) {
        throw new HttpError(402, 'Your subscription is not active. Please subscribe to keep generating listings.');
      }
      if (data.usageMonth !== month) {
        data.usageMonth = month;
        data.usageCount = 0;
      }
      if (data.usageCount >= MONTHLY_QUOTA) {
        throw new HttpError(429, `You've used all ${MONTHLY_QUOTA} listings included this month. It resets on the 1st.`);
      }
      const newCount = data.usageCount + 1;
      tx.set(userRef, { usageMonth: data.usageMonth, usageCount: newCount }, { merge: true });
      return newCount;
    });

    const prompt = buildPrompt(req.body || {});
    const rawText = await callGemini(prompt, photos);
    const result = normalizeResult(extractJson(rawText));
    await recordGeminiCallAndWarn(db); // operator-only heads-up near the free-tier cap; never shown to the customer

    return res.status(200).json({ ok: true, result, usage: { used: usageAfter, quota: MONTHLY_QUOTA } });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error('generate error:', err);
    return res.status(status).json({ ok: false, error: err.message || 'Something went wrong.' });
  }
}
