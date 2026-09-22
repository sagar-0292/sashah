// POST /api/generate — the paid AI proxy.
// Verifies the caller is signed in and subscribed, enforces a monthly usage
// cap (so one account can't run up the AI bill), calls Gemini with OUR
// server-side key, and returns a clean parsed listing. The API key never
// reaches the browser.

import {
  getDb, requireUser, setCors, HttpError, MONTHLY_QUOTA, isSubscriptionActive,
  recordGeminiCallAndWarn, validatePhotos, buildPrompt, extractJson, normalizeResult, callGemini,
} from './_lib.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    const db = getDb();
    const userRef = db.doc(`users/${user.uid}`);
    const photos = validatePhotos(req.body);

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

    const prompt = buildPrompt(req.body);
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
