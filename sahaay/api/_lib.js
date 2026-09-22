// Shared helpers for every serverless function in this API.
// Not itself a route — Vercel only turns files with a default export into
// endpoints, so this one is safe to import from the others.

import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export function getDb() {
  initAdmin();
  return getFirestore();
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Verifies the Firebase ID token in "Authorization: Bearer <token>" and
// returns the decoded token ({ uid, email, ... }). Throws HttpError(401) if
// missing/invalid — every handler should let this propagate to its catch.
export async function requireUser(req) {
  initAdmin();
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) throw new HttpError(401, 'Sign in required.');
  try {
    return await getAuth().verifyIdToken(match[1]);
  } catch {
    throw new HttpError(401, 'Your session expired — please sign in again.');
  }
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const MONTHLY_QUOTA = Number(process.env.MONTHLY_LISTING_QUOTA || 200);

// Loads (creating if missing) the user's Firestore doc, resets usage if the
// month rolled over, and returns { ref, data }. Does not write the reset —
// callers that only read can ignore it; generate.js writes it back.
export async function loadUserDoc(db, uid, email) {
  const ref = db.doc(`users/${uid}`);
  const snap = await ref.get();
  const month = currentMonthKey();
  if (!snap.exists) {
    const fresh = {
      email: email || null,
      subscriptionStatus: 'none',
      plan: null,
      razorpaySubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      usageMonth: month,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    await ref.set(fresh);
    return { ref, data: fresh };
  }
  const data = snap.data();
  if (data.usageMonth !== month) {
    data.usageMonth = month;
    data.usageCount = 0;
  }
  return { ref, data };
}

export function isSubscriptionActive(data) {
  if (data.subscriptionStatus !== 'active') return false;
  if (data.currentPeriodEnd && new Date(data.currentPeriodEnd) < new Date()) return false;
  return true;
}

/* ===================== Operator-only usage alert ===================== */
// A self-imposed daily cap on total Gemini calls across ALL subscribers —
// separate from each user's own monthly quota. If you're on Gemini's free
// tier, its real daily limit is shared across your whole key regardless of
// who's paying, so this exists purely so *you* find out you're close to it
// before customers start seeing errors. Set a bit below Google's actual
// limit to leave headroom. Customers never see any of this.
export const DAILY_GEMINI_CAP = Number(process.env.DAILY_GEMINI_CAP || 1400);

function todayKey() {
  return new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
}

async function notifyOperator(message) {
  // Always visible in Vercel's function logs even with no webhook configured.
  console.warn('[operator alert]', message);
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message, message }), // covers Slack/Discord ("text") and plain webhooks ("message")
    });
  } catch (err) {
    console.error('notifyOperator webhook failed (non-fatal):', err);
  }
}

/* ===================== Shared AI call (used by generate.js and free-generate.js) ===================== */
export const MAX_PHOTOS = 4;
export const MAX_BASE64_CHARS = 2_000_000; // ~1.5MB per photo after base64 overhead

export function validatePhotos(body) {
  const photos = Array.isArray(body?.photos) ? body.photos.slice(0, MAX_PHOTOS) : [];
  if (photos.length === 0) throw new HttpError(400, 'Add at least one photo.');
  for (const p of photos) {
    if (!p?.base64 || p.base64.length > MAX_BASE64_CHARS) {
      throw new HttpError(413, 'One of the photos is too large. Try a smaller image.');
    }
  }
  return photos;
}

export function buildPrompt(body) {
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

export function extractJson(text) {
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

export function normalizeResult(raw) {
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

export async function callGemini(prompt, photos) {
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

// Call once per successful Gemini call. Increments today's global counter
// and, the first time it crosses 80% of DAILY_GEMINI_CAP for the day, fires
// one operator notification (never repeats until the next UTC day). Never
// throws — a bookkeeping hiccup here must never break someone's listing.
export async function recordGeminiCallAndWarn(db) {
  try {
    const day = todayKey();
    const ref = db.doc(`system/dailyUsage_${day}`);
    const { count, justCrossed } = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : { count: 0, warned80: false };
      const count = (data.count || 0) + 1;
      const justCrossed = !data.warned80 && count >= DAILY_GEMINI_CAP * 0.8;
      tx.set(ref, { day, count, warned80: data.warned80 || justCrossed }, { merge: true });
      return { count, justCrossed };
    });
    if (justCrossed) {
      await notifyOperator(
        `SnapList: today's Gemini usage hit ${count}/${DAILY_GEMINI_CAP} (80%+ of your self-set daily cap). ` +
        `If this keeps happening, it's time to attach billing to the Gemini key.`
      );
    }
  } catch (err) {
    console.error('recordGeminiCallAndWarn failed (non-fatal):', err);
  }
}

/* ===================== Anonymous free-tier rate limiting ===================== */
// Used by free-generate.js (the unauthenticated endpoint the public
// product-photo-tool calls, with no Firebase key of its own). We never
// store a visitor's raw IP — only a salted one-way hash, and only for the
// current UTC day, purely to cap how many free generations one visitor can
// use without a login.
export const FREE_DAILY_IP_LIMIT = Number(process.env.FREE_DAILY_IP_LIMIT || 8);

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || 'sahaay-default-salt';
  return crypto.createHash('sha256').update(salt + ip).digest('hex').slice(0, 24);
}

// Atomically checks + increments a visitor's daily free-tier usage. Throws
// HttpError(429) if they're already at the limit; otherwise reserves one
// unit and returns the new count. A visitor is identified only by the
// hashed IP for today — nothing persists beyond that day's document.
export async function reserveFreeUsage(db, req) {
  const day = todayKey();
  const ipHash = hashIp(getClientIp(req));
  const ref = db.doc(`freeUsage/${day}_${ipHash}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = (snap.exists ? snap.data().count : 0) || 0;
    if (count >= FREE_DAILY_IP_LIMIT) {
      throw new HttpError(429, `You've used today's ${FREE_DAILY_IP_LIMIT} free generations. Add your own free API key in Settings for unlimited use, or try again tomorrow.`);
    }
    tx.set(ref, { day, count: count + 1 }, { merge: true });
    return count + 1;
  });
}
