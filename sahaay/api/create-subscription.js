// POST /api/create-subscription — starts a Razorpay recurring subscription
// for the signed-in user and hands back a subscription_id for Razorpay
// Checkout to open on the client. The webhook (razorpay-webhook.js) is what
// actually marks the user active once payment succeeds — this endpoint only
// creates the pending subscription.

import Razorpay from 'razorpay';
import { getDb, requireUser, setCors, HttpError } from './_lib.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireUser(req);
    const db = getDb();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      // Razorpay requires a finite number of billing cycles; 120 monthly
      // cycles (10 years) is effectively "until cancelled" for our purposes.
      total_count: 120,
      notes: { firebaseUid: user.uid },
    });

    await db.doc(`users/${user.uid}`).set(
      {
        email: user.email || null,
        razorpaySubscriptionId: subscription.id,
        subscriptionStatus: 'pending',
      },
      { merge: true }
    );

    return res.status(200).json({
      ok: true,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error('create-subscription error:', err);
    return res.status(status).json({ ok: false, error: err.message || 'Could not start subscription.' });
  }
}
