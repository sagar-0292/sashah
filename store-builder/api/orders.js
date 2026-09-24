// POST   /api/orders                 → customer places an order (public)
//                                       body: { slug, items:[{productId, qty}], customer, payment }
// GET    /api/orders                 → the owner's orders            (auth)
// PATCH  /api/orders   { id, status } → update an order's status     (auth)
// DELETE /api/orders?id=x            → delete an order               (auth)
import crypto from 'crypto';
import { data, requireUser, send, handleError, setCors, HttpError, isValidSlug, readBody, rateLimit } from './_lib.js';

const STATUSES = ['new', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'POST') {
      rateLimit(req, 'order', 10, 60_000);
      const body = readBody(req);
      const slug = String(body.slug || '');
      if (!isValidSlug(slug)) throw new HttpError(404, 'Store not found.');
      const order = await data.placeOrder(slug, (store) => buildOrder(store, body));
      return send(res, 200, { order });
    }

    const { uid } = await requireUser(req);
    const slug = await data.getOwnerSlug(uid);
    if (!slug) throw new HttpError(404, 'You don\'t have a store yet.');

    if (req.method === 'GET') return send(res, 200, { orders: await data.listOrders(slug) });

    if (req.method === 'PATCH') {
      const body = readBody(req);
      if (!STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown status.');
      await data.updateOrder(slug, String(body.id), { status: body.status, updatedAt: new Date().toISOString() });
      return send(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      await data.deleteOrder(slug, String(req.query.id || ''));
      return send(res, 200, { ok: true });
    }

    throw new HttpError(405, 'Method not allowed.');
  } catch (err) {
    return handleError(res, err);
  }
}

const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

// Prices, stock and totals are always recomputed from the saved store —
// nothing the browser sends about money is trusted.
function buildOrder(store, body) {
  const customer = {
    name: str(body.customer && body.customer.name, 80),
    phone: str(body.customer && body.customer.phone, 30),
    address: str(body.customer && body.customer.address, 400),
    note: str(body.customer && body.customer.note, 400),
  };
  if (!customer.name || !customer.phone || !customer.address) throw new HttpError(400, 'Please fill in your name, phone and address.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw new HttpError(400, 'Your cart is empty.');

  const products = new Map((store.products || []).map((p) => [p.id, p]));
  const items = body.items.map((it) => {
    const p = products.get(String(it.productId));
    const qty = Math.floor(Number(it.qty));
    if (!p || p.active === false) throw new HttpError(409, 'An item in your cart is no longer available.');
    if (!(qty >= 1 && qty <= 99)) throw new HttpError(400, 'Invalid quantity.');
    const tracked = p.stock !== null && p.stock !== '' && p.stock !== undefined;
    if (tracked && Number(p.stock) < qty) {
      throw new HttpError(409, Number(p.stock) > 0 ? `Only ${Number(p.stock)} of “${p.title}” left.` : `“${p.title}” just sold out.`);
    }
    if (tracked) p.stock = Number(p.stock) - qty;
    return { productId: p.id, title: p.title, price: Number(p.price) || 0, qty };
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const sh = store.shipping || {};
  let shipping = Number(sh.flat) || 0;
  if (Number(sh.freeAbove) > 0 && subtotal >= Number(sh.freeAbove)) shipping = 0;

  const pay = store.payments || {};
  const allowed = [pay.upi && 'upi', pay.cod && 'cod'].filter(Boolean);
  if (!allowed.length) allowed.push('confirm');
  const payment = allowed.includes(body.payment) ? body.payment : allowed[0];

  const d = new Date();
  const id = 'ORD-' + String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const order = { id, createdAt: d.toISOString(), items, customer, subtotal, shipping, total: subtotal + shipping, payment, status: 'new' };
  return { order, store };
}
