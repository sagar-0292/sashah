// POST /api/razorpay-webhook — Razorpay calls this directly (not the
// browser) whenever a subscription's state changes. This is the ONLY place
// that actually flips a user to "active" — never trust the client for that.
//
// Configure this exact URL in Razorpay Dashboard → Settings → Webhooks,
// subscribed to at least: subscription.activated, subscription.charged,
// subscription.completed, subscription.cancelled, subscription.halted,
// subscription.paused. Use the same secret you set as RAZORPAY_WEBHOOK_SECRET.

import crypto from 'crypto';
import { getDb } from './_lib.js';

// Signature verification needs the exact raw bytes Razorpay signed, so we
// turn off Vercel's automatic JSON body parsing for this function only.
export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const ACTIVE_EVENTS = new Set(['subscription.activated', 'subscription.charged']);
const INACTIVE_EVENTS = new Set(['subscription.cancelled', 'subscription.halted', 'subscription.completed', 'subscription.paused']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await readRawBody(req);
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');

  if (!signature || signature !== expected) {
    console.warn('razorpay-webhook: signature mismatch');
    return res.status(400).json({ ok: false, error: 'invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid JSON' });
  }

  try {
    const sub = event?.payload?.subscription?.entity;
    const uid = sub?.notes?.firebaseUid;

    if (uid && (ACTIVE_EVENTS.has(event.event) || INACTIVE_EVENTS.has(event.event))) {
      const db = getDb();
      const ref = db.doc(`users/${uid}`);

      if (ACTIVE_EVENTS.has(event.event)) {
        await ref.set(
          {
            subscriptionStatus: 'active',
            razorpaySubscriptionId: sub.id,
            plan: sub.plan_id,
            cancelAtPeriodEnd: false,
            currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
          },
          { merge: true }
        );
      } else {
        await ref.set({ subscriptionStatus: 'inactive' }, { merge: true });
      }
    } else if (!uid) {
      console.warn(`razorpay-webhook: event ${event?.event} had no firebaseUid note, skipping`);
    }

    // Always 200 once signature checks out, so Razorpay doesn't keep retrying
    // an event we've already understood (even ones we don't act on above).
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('razorpay-webhook error:', err);
    return res.status(500).json({ ok: false });
  }
}
