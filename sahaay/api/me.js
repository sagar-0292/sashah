// GET /api/me — the signed-in user's subscription/usage status. The
// frontend polls this to decide whether to show the app or the paywall,
// instead of trusting anything client-side.

import { getDb, requireUser, setCors, loadUserDoc, isSubscriptionActive, MONTHLY_QUOTA } from './_lib.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    const db = getDb();
    const { data } = await loadUserDoc(db, user.uid, user.email);

    return res.status(200).json({
      ok: true,
      email: data.email || user.email || null,
      subscriptionStatus: data.subscriptionStatus,
      active: isSubscriptionActive(data),
      cancelAtPeriodEnd: !!data.cancelAtPeriodEnd,
      currentPeriodEnd: data.currentPeriodEnd || null,
      usage: { used: data.usageCount || 0, quota: MONTHLY_QUOTA },
    });
  } catch (err) {
    const status = err.status || 401;
    return res.status(status).json({ ok: false, error: err.message || 'Not signed in.' });
  }
}
