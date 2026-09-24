// GET  /api/stores?slug=x   → public store data (for storefronts)
// GET  /api/stores?mine=1   → the signed-in owner's store      (auth)
// PUT  /api/stores          → create/update the owner's store  (auth)
//                              body: { store }   returns { slug, url }
import { data, requireUser, send, handleError, setCors, HttpError, slugify, isValidSlug, storeUrl, readBody, rateLimit } from './_lib.js';

const MAX_BYTES = 800 * 1024;   // Firestore documents max out at 1 MiB

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET' && req.query.slug) {
      const slug = String(req.query.slug);
      if (!isValidSlug(slug)) throw new HttpError(404, 'Store not found.');
      const doc = await data.getStore(slug);
      if (!doc) throw new HttpError(404, 'Store not found.');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('CDN-Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
      return send(res, 200, { store: doc.store });
    }

    if (req.method === 'GET' && req.query.mine) {
      const { uid } = await requireUser(req);
      const slug = await data.getOwnerSlug(uid);
      if (!slug) return send(res, 200, { store: null });
      const doc = await data.getStore(slug);
      res.setHeader('Cache-Control', 'no-store');
      return send(res, 200, { slug, url: storeUrl(req, slug), store: doc ? doc.store : null });
    }

    if (req.method === 'PUT') {
      const { uid } = await requireUser(req);
      rateLimit(req, 'save:' + uid, 120, 60_000);
      const body = readBody(req);
      const incoming = sanitize(body.store);

      let slug = await data.getOwnerSlug(uid);
      const merge = (existing) => mergeStore(existing ? existing.store : null, incoming, slug);
      if (slug) {
        await data.claimAndSave(uid, slug, merge);
      } else {
        // First save: find a free address based on the store name.
        const base = slugify(incoming.name);
        for (let i = 1; i <= 50 && !slug; i++) {
          const candidate = i === 1 ? base : `${base}-${i}`;
          if (await data.claimAndSave(uid, candidate, (existing) => mergeStore(existing ? existing.store : null, incoming, candidate))) slug = candidate;
        }
        if (!slug) throw new HttpError(409, 'Could not find a free store address. Try a different name.');
      }
      return send(res, 200, { slug, url: storeUrl(req, slug) });
    }

    throw new HttpError(405, 'Method not allowed.');
  } catch (err) {
    return handleError(res, err);
  }
}

// Validates the shape and size of an incoming store and removes private fields.
function sanitize(store) {
  if (!store || typeof store !== 'object' || Array.isArray(store)) throw new HttpError(400, 'Missing store.');
  const s = JSON.parse(JSON.stringify(store));
  delete s.orders;
  delete s.flags;
  if (!String(s.name || '').trim()) throw new HttpError(400, 'Your store needs a name.');
  if (!Array.isArray(s.products)) s.products = [];
  if (s.products.length > 500) throw new HttpError(400, 'Stores can have up to 500 products.');
  const json = JSON.stringify(s);
  if (json.includes('"data:')) throw new HttpError(400, 'Images must be uploaded before saving.');
  if (Buffer.byteLength(json) > MAX_BYTES) throw new HttpError(413, 'Your store is too large to save. Try shorter descriptions.');
  // Only allow image URLs we issued (https storage or dev uploads).
  const okUrl = (u) => !u || /^https:\/\//.test(u) || /^\/dev-uploads\//.test(u);
  const check = (u) => { if (!okUrl(u)) throw new HttpError(400, 'Invalid image address.'); };
  check(s.hero && s.hero.image);
  check(s.owner && s.owner.photo);
  check(s.app && s.app.icon);
  if (s.app && s.app.icons) Object.values(s.app.icons).forEach(check);
  if (typeof s.logo === 'string' && s.logo.length > 16) check(s.logo);
  s.products.forEach((p) => { (p.images || []).forEach(check); });
  return s;
}

// Stock is sold down by orders on the server, so an owner's save must not
// overwrite it with a stale number — unless they changed stock themselves
// since (tracked with stockSetAt).
function mergeStore(existing, incoming, slug) {
  const prev = new Map(((existing && existing.products) || []).map((p) => [p.id, p]));
  incoming.products = incoming.products.map((p) => {
    const old = prev.get(p.id);
    if (old && (Number(p.stockSetAt) || 0) <= (Number(old.stockSetAt) || 0)) {
      return { ...p, stock: old.stock, stockSetAt: old.stockSetAt };
    }
    return p;
  });
  incoming.slug = slug;
  incoming.updatedAt = new Date().toISOString();
  return incoming;
}
