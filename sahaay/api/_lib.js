// Shared helpers for every serverless function in this API.
// Not itself a route — Vercel only turns files with a default export into
// endpoints, so this one is safe to import from the others.

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
