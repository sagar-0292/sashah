// Shared helpers for the Sahaay Stores API (Vercel serverless functions).
// Not itself a route — Vercel only turns files with a default export into
// endpoints, so this one is safe to import from the others.
//
// Two storage backends sit behind one interface:
//   • Firestore + Firebase Storage in production (firebase-admin)
//   • an in-memory store when SAHAAY_DEV=1 (used by dev-server.js), so the
//     whole platform can run locally with no cloud accounts.

import crypto from 'crypto';

export const DEV = process.env.SAHAAY_DEV === '1';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, body) {
  res.status(status).json(body);
}

export function handleError(res, err) {
  if (err instanceof HttpError) return send(res, err.status, { error: err.message });
  console.error(err);
  return send(res, 500, { error: 'Something went wrong. Please try again.' });
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/* ------------------------------ firebase-admin ----------------------------- */
let adminMods = null;
async function admin() {
  if (adminMods) return adminMods;
  const [{ initializeApp, getApps, cert }, { getAuth }, { getFirestore, FieldValue }, { getStorage }] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/auth'), import('firebase-admin/firestore'), import('firebase-admin/storage')
  ]);
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
  adminMods = { auth: getAuth(), db: getFirestore(), storage: getStorage(), FieldValue };
  return adminMods;
}

/* ---------------------------------- auth ---------------------------------- */
// Verifies "Authorization: Bearer <Firebase ID token>" (anonymous users
// included) and returns { uid }. In dev, tokens look like "dev-<uid>".
export async function requireUser(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!m) throw new HttpError(401, 'Sign in required.');
  if (DEV) {
    if (!/^dev-[\w-]{4,64}$/.test(m[1])) throw new HttpError(401, 'Invalid dev token.');
    return { uid: m[1].slice(4) };
  }
  try {
    const { auth } = await admin();
    return await auth.verifyIdToken(m[1]);
  } catch {
    throw new HttpError(401, 'Your session expired. Please sign in again.');
  }
}

/* --------------------------------- storage --------------------------------- */
// Firestore layout:
//   stores/{slug}                 { ownerUid, store, updatedAt }
//   stores/{slug}/orders/{id}     order
//   owners/{uid}                  { slug }
const memory = globalThis.__sahaayMemory || (globalThis.__sahaayMemory = {
  stores: new Map(), owners: new Map(), orders: new Map(), uploads: new Map()
});
export const devUploads = memory.uploads;

const firestoreBackend = {
  async getStore(slug) {
    const { db } = await admin();
    const snap = await db.doc(`stores/${slug}`).get();
    return snap.exists ? snap.data() : null;
  },
  async getOwnerSlug(uid) {
    const { db } = await admin();
    const snap = await db.doc(`owners/${uid}`).get();
    return snap.exists ? snap.data().slug : null;
  },
  // Creates or updates the owner's store. `mutate(existingDocOrNull)` returns
  // the store object to write; runs in a transaction so slugs stay unique.
  async claimAndSave(uid, slug, mutate) {
    const { db } = await admin();
    return db.runTransaction(async (tx) => {
      const ref = db.doc(`stores/${slug}`);
      const snap = await tx.get(ref);
      if (snap.exists && snap.data().ownerUid !== uid) return false;
      const store = mutate(snap.exists ? snap.data() : null);
      tx.set(ref, { ownerUid: uid, store, updatedAt: new Date().toISOString() });
      tx.set(db.doc(`owners/${uid}`), { slug });
      return true;
    });
  },
  async placeOrder(slug, build) {
    const { db } = await admin();
    return db.runTransaction(async (tx) => {
      const ref = db.doc(`stores/${slug}`);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpError(404, 'Store not found.');
      const doc = snap.data();
      const { order, store } = build(doc.store);
      tx.update(ref, { store, updatedAt: new Date().toISOString() });
      tx.set(db.doc(`stores/${slug}/orders/${order.id}`), order);
      return order;
    });
  },
  async listOrders(slug) {
    const { db } = await admin();
    const snap = await db.collection(`stores/${slug}/orders`).orderBy('createdAt', 'desc').limit(500).get();
    return snap.docs.map((d) => d.data());
  },
  async updateOrder(slug, id, patch) {
    const { db } = await admin();
    const ref = db.doc(`stores/${slug}/orders/${id}`);
    if (!(await ref.get()).exists) throw new HttpError(404, 'Order not found.');
    await ref.update(patch);
  },
  async deleteOrder(slug, id) {
    const { db } = await admin();
    await db.doc(`stores/${slug}/orders/${id}`).delete();
  },
  async uploadImage(uid, buf, type) {
    const { storage } = await admin();
    const bucket = storage.bucket();
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    const path = `stores/${uid}/${crypto.randomUUID()}.${ext}`;
    const token = crypto.randomUUID();
    await bucket.file(path).save(buf, {
      resumable: false,
      contentType: type,
      metadata: { cacheControl: 'public, max-age=31536000, immutable', metadata: { firebaseStorageDownloadTokens: token } },
    });
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  },
};

const memoryBackend = {
  async getStore(slug) { return clone(memory.stores.get(slug) || null); },
  async getOwnerSlug(uid) { return memory.owners.get(uid) || null; },
  async claimAndSave(uid, slug, mutate) {
    const cur = memory.stores.get(slug);
    if (cur && cur.ownerUid !== uid) return false;
    memory.stores.set(slug, { ownerUid: uid, store: clone(mutate(clone(cur || null))), updatedAt: new Date().toISOString() });
    memory.owners.set(uid, slug);
    return true;
  },
  async placeOrder(slug, build) {
    const cur = memory.stores.get(slug);
    if (!cur) throw new HttpError(404, 'Store not found.');
    const { order, store } = build(clone(cur.store));
    cur.store = store;
    const list = memory.orders.get(slug) || [];
    list.unshift(order);
    memory.orders.set(slug, list);
    return clone(order);
  },
  async listOrders(slug) { return clone(memory.orders.get(slug) || []); },
  async updateOrder(slug, id, patch) {
    const o = (memory.orders.get(slug) || []).find((x) => x.id === id);
    if (!o) throw new HttpError(404, 'Order not found.');
    Object.assign(o, patch);
  },
  async deleteOrder(slug, id) {
    memory.orders.set(slug, (memory.orders.get(slug) || []).filter((x) => x.id !== id));
  },
  async uploadImage(uid, buf, type) {
    const key = `${uid}-${crypto.randomUUID()}`;
    memory.uploads.set(key, { buf, type });
    return `/dev-uploads/${key}`;
  },
};

function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

export const data = DEV ? memoryBackend : firestoreBackend;

/* ---------------------------------- slugs ---------------------------------- */
const RESERVED = new Set(['api', 's', 'admin', 'app', 'www', 'dashboard', 'login', 'setup', 'store', 'stores', 'help', 'support', 'sahaay', 'static', 'assets', 'dev-uploads']);

export function slugify(name) {
  let s = String(name || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
  if (s.length < 3) s = (s + '-store').replace(/^-/, '');
  if (RESERVED.has(s)) s += '-store';
  return s;
}

export function isValidSlug(s) {
  return typeof s === 'string' && /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$/.test(s) && !RESERVED.has(s);
}

export function storeUrl(req, slug) {
  const pattern = process.env.STORE_URL_PATTERN; // e.g. "https://{slug}.sahaay.online"
  if (pattern) return pattern.replace('{slug}', slug);
  const proto = String(req.headers['x-forwarded-proto'] || (DEV ? 'http' : 'https')).split(',')[0];
  return `${proto}://${req.headers.host}/s/${slug}/`;
}

/* ------------------------------ rate limiting ------------------------------ */
// Best-effort, per serverless instance. Enough to blunt accidental floods;
// it keeps only a salted hash of the IP, never the IP itself.
const hits = new Map();
export function rateLimit(req, bucket, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const key = bucket + ':' + crypto.createHash('sha256').update((process.env.IP_HASH_SALT || 'sahaay') + ip).digest('hex').slice(0, 24);
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) throw new HttpError(429, 'Too many requests. Please wait a minute and try again.');
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
}

/* -------------------------------- escaping -------------------------------- */
export function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { throw new HttpError(400, 'Invalid JSON.'); }
}
