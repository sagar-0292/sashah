// POST /api/free-generate (aliased below via netlify.toml) — the anonymous
// AI proxy the free SnapList tool calls by default. No login, no
// user-supplied key: the operator's Gemini key lives only in this
// function's environment (GEMINI_API_KEY, set in Netlify's Site settings →
// Environment variables), never in any file shipped to a browser.
//
// Visitors are rate-limited per UTC day by a salted one-way hash of their
// IP, counted in memory for this function instance — the raw IP is never
// stored. (Netlify Blobs would give a persistent count across instances,
// but its automatic siteID/token injection isn't reliable in every
// deploy context, so this trades a little precision — a redeploy or a
// long-idle instance resets counts early — for something that always
// works with zero extra configuration.)

const crypto = require('crypto');

const MAX_PHOTOS = 4;
const MAX_BASE64_CHARS = 2_000_000; // ~1.5MB per photo after base64 overhead
const FREE_DAILY_IP_LIMIT = Number(process.env.FREE_DAILY_IP_LIMIT || 8);

function todayKey() {
  return new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
}

function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || 'snaplist-default-salt';
  return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 24);
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function validatePhotos(body) {
  const photos = Array.isArray(body?.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];
  if (photos.length === 0) throw httpError(400, 'Add at least one photo.');
  for (const p of photos) {
    if (!p?.base64 || p.base64.length > MAX_BASE64_CHARS) {
      throw httpError(413, 'One of the photos is too large. Try a smaller image.');
    }
  }
  return photos;
}

function buildPrompt(body) {
  const { productName, category, platform, features, tone, length, useEmojis } = body || {};
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
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
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
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw httpError(500, 'The site operator has not configured an AI key yet.');
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
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
  if (!res.ok) throw httpError(502, data?.error?.message || `AI provider error (${res.status})`);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) throw httpError(502, 'The AI returned an empty response. Please try again.');
  return text;
}

// In-memory usage counter, keyed by day + hashed IP. Persists only for the
// lifetime of this warm function instance (Netlify may spin up more than
// one under load, and any of them may be recycled at any time) — a
// best-effort deterrent against a single visitor hammering the endpoint,
// not a hard global cap.
const usageMap = new Map();

function reserveFreeUsage(ipHash) {
  const key = `${todayKey()}_${ipHash}`;
  const current = usageMap.get(key) || 0;
  if (current >= FREE_DAILY_IP_LIMIT) {
    throw httpError(429, `You've used today's ${FREE_DAILY_IP_LIMIT} free generations. Add your own free API key in Settings for unlimited use, or try again tomorrow.`);
  }
  usageMap.set(key, current + 1);
  if (usageMap.size > 5000) {
    const today = todayKey();
    for (const k of usageMap.keys()) if (!k.startsWith(today)) usageMap.delete(k);
  }
  return current + 1;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const photos = validatePhotos(body);

    const ip = event.headers['x-nf-client-connection-ip']
      || (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || 'unknown';
    const usedToday = reserveFreeUsage(hashIp(ip));

    const prompt = buildPrompt(body);
    const rawText = await callGemini(prompt, photos);
    const result = normalizeResult(extractJson(rawText));

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, result, usage: { used: usedToday, limit: FREE_DAILY_IP_LIMIT } }),
    };
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('free-generate error:', err);
    return {
      statusCode: status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message || 'Something went wrong.' }),
    };
  }
};
