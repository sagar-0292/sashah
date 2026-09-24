// POST /api/upload  { dataUrl }  → { url }      (auth)
// Images are resized in the browser before upload, so 3 MB is generous.
import { data, requireUser, send, handleError, setCors, HttpError, readBody, rateLimit } from './_lib.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 3 * 1024 * 1024;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
    const { uid } = await requireUser(req);
    rateLimit(req, 'upload:' + uid, 60, 60_000);
    const m = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(readBody(req).dataUrl || ''));
    if (!m || !TYPES.includes(m[1])) throw new HttpError(400, 'Please upload a JPEG, PNG or WebP image.');
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > MAX) throw new HttpError(413, 'That image is too large.');
    return send(res, 200, { url: await data.uploadImage(uid, buf, m[1]) });
  } catch (err) {
    return handleError(res, err);
  }
}
