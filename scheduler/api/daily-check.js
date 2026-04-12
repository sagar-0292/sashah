// api/daily-check.js
// Runs on Vercel cron — checks all family groups and sends alerts

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Firebase Admin init ───────────────────────────────────────
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

// ── Send Telegram message ─────────────────────────────────────
async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  return res.ok;
}

// ── Send Email via EmailJS REST API ──────────────────────────
async function sendEmail(toEmail, message, subject) {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  process.env.EJS_SERVICE_ID,
      template_id: process.env.EJS_TEMPLATE_ID,
      user_id:     process.env.EJS_PUBLIC_KEY,
      template_params: {
        to_email:  toEmail,
        to_name:   'MedVault User',
        from_name: 'MedVault',
        message,
        subject,
        reply_to:  toEmail,
      },
    }),
  });
  return res.ok;
}

// ── Is medicine actually low ──────────────────────────────────
function isLow(m) {
  const dur = m.duration || { type: 'lifelong' };
  const hasCourse = dur.type && dur.type !== 'lifelong';

  if (hasCourse) {
    // For course medicines check if stock is insufficient
    const days = dur.type === 'weeks' ? (dur.qty || 1) * 7 : (dur.qty || 1);
    const start = new Date((dur.start || new Date().toISOString().slice(0, 10)) + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > end) return false; // course ended

    const timesPerDay = (m.schedule || []).length || 1;
    const daysLeft = Math.max(0, Math.round((end - today) / 86400000) + 1);
    const needed = daysLeft * timesPerDay;
    return (m.count || 0) < needed;
  }

  // Lifelong — use custom threshold or default 4
  const threshold = (m.threshold && m.threshold > 0) ? m.threshold : 4;
  return (m.count || 0) <= threshold;
}

// ── Should we send alert now (check scheduled time) ──────────
function shouldSendNow(alertTime) {
  if (!alertTime) return true; // no time set — always send
  const [h, m] = alertTime.split(':').map(Number);
  const now = new Date();
  // Convert UTC to IST (UTC+5:30)
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const istHour = ist.getUTCHours();
  const istMin  = ist.getUTCMinutes();
  // Allow a 30-minute window around the scheduled time
  const scheduledMinutes = h * 60 + m;
  const currentMinutes   = istHour * 60 + istMin;
  const diff = Math.abs(currentMinutes - scheduledMinutes);
  return diff <= 30;
}

// ── Main handler ──────────────────────────────────────────────
export default async function handler(req, res) {
  // Allow manual trigger via GET (for testing) or cron via GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret to prevent abuse
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow manual trigger with ?secret= param
    if (req.query.secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const db = getDb();
    const results = [];

    // Get all family groups that have notification settings
    const settingsSnap = await db.collection('families').get();

    for (const familyDoc of settingsSnap.docs) {
      const familyId = familyDoc.id;

      try {
        // Get notification settings for this family
        const notifDoc = await db.doc(`families/${familyId}/settings/notifications`).get();
        if (!notifDoc.exists) continue;

        const notif = notifDoc.data();
        const { tgToken, tgChatId, alertEmail, alertTime, alertEnabled } = notif;

        // Skip if alerts disabled
        if (alertEnabled === false) continue;

        // Check if it's the right time to send
        if (!shouldSendNow(alertTime)) continue;

        // Check if already sent today
        const today = new Date().toISOString().slice(0, 10);
        if (notif.lastSentDate === today) {
          results.push({ familyId, status: 'already_sent_today' });
          continue;
        }

        // Get medicine data
        const dataDoc = await db.doc(`families/${familyId}/sync/data`).get();
        if (!dataDoc.exists) continue;

        const data = dataDoc.data();
        const lowItems = [];

        // Check all profiles
        (data.profiles || []).forEach(p => {
          (p.medicines || []).forEach(m => {
            if (isLow(m)) {
              const threshold = (m.threshold && m.threshold > 0) ? m.threshold : 4;
              lowItems.push({
                name: `${p.name} — ${m.name}`,
                count: m.count,
                status: m.count === 0 ? 'OUT OF STOCK' : `Only ${m.count} left (alert at ≤${threshold})`,
              });
            }
          });
        });

        // Check SOS meds
        (data.sosMeds || []).forEach(m => {
          if (isLow(m)) {
            lowItems.push({
              name: `SOS: ${m.name}`,
              count: m.count,
              status: m.count === 0 ? 'OUT OF STOCK' : `Only ${m.count} left`,
            });
          }
        });

        if (lowItems.length === 0) {
          results.push({ familyId, status: 'all_stocked' });
          continue;
        }

        // Build message
        const itemLines = lowItems.map(i => `• ${i.name}: <b>${i.status}</b>`).join('\n');
        const tgMessage = `💊 <b>MedVault Daily Alert</b>\n\n${itemLines}\n\n<i>Please restock soon.</i>`;
        const emailMessage = `MedVault Daily Alert\n\n${lowItems.map(i => `• ${i.name}: ${i.status}`).join('\n')}\n\nPlease restock soon.\n\n— MedVault`;
        const emailSubject = `💊 MedVault — ${lowItems.length} medicine${lowItems.length > 1 ? 's' : ''} need attention`;

        const sent = {};

        // Send Telegram
        if (tgToken && tgChatId) {
          sent.telegram = await sendTelegram(tgToken, tgChatId, tgMessage);
        }

        // Send Email
        if (alertEmail) {
          sent.email = await sendEmail(alertEmail, emailMessage, emailSubject);
        }

        // Mark as sent today
        await db.doc(`families/${familyId}/settings/notifications`).update({
          lastSentDate: today,
        });

        results.push({ familyId, status: 'sent', itemCount: lowItems.length, sent });

      } catch (familyError) {
        console.error(`Error processing family ${familyId}:`, familyError);
        results.push({ familyId, status: 'error', error: familyError.message });
      }
    }

    return res.status(200).json({
      ok: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Daily check error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
