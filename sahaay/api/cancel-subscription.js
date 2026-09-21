// POST /api/cancel-subscription — cancels the signed-in user's Razorpay
// subscription at the end of the current billing cycle (they keep access
// until then). The webhook flips subscriptionStatus once it actually ends.

import Razorpay from 'razorpay';
import { getDb, requireUser, setCors, HttpError } from './_lib.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    const db = getDb();
    const ref = db.doc(`users/${user.uid}`);
    const snap = await ref.get();
    const subId = snap.data()?.razorpaySubscriptionId;
    if (!subId) throw new HttpError(400, 'No active subscription found.');

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    await razorpay.subscriptions.cancel(subId, true); // true = cancel at cycle end

    await ref.set({ cancelAtPeriodEnd: true }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error('cancel-subscription error:', err);
    return res.status(status).json({ ok: false, error: err.message || 'Could not cancel subscription.' });
  }
}
