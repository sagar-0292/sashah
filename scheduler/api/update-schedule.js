// api/update-schedule.js
// Called by the app when user saves their notification settings
// Stores settings in Firestore so the cron job can read them

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  // CORS headers — allow the app to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { familyId, tgToken, tgChatId, alertEmail, alertTime, alertEnabled } = req.body;

    if (!familyId) return res.status(400).json({ error: 'familyId required' });

    const db = getDb();
    await db.doc(`families/${familyId}/settings/notifications`).set({
      tgToken:      tgToken      || null,
      tgChatId:     tgChatId     || null,
      alertEmail:   alertEmail   || null,
      alertTime:    alertTime    || '09:00',
      alertEnabled: alertEnabled !== false,
      updatedAt:    new Date().toISOString(),
    }, { merge: true });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('update-schedule error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
