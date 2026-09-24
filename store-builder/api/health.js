// GET /api/health → lets the builder detect that the hosted platform is running.
import { DEV, setCors } from './_lib.js';

export default function handler(req, res) {
  setCors(res);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, dev: DEV, ai: !!process.env.GEMINI_API_KEY });
}
