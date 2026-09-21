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
