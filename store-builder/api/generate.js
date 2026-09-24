// POST /api/generate  → AI-written homepage copy for a new store     (auth)
// body: { category, name, description, ownerName, ownerBio }
// returns { tagline, eyebrow, heroHeading, heroSubheading, productsHeading, about, ownerBio }
// Returns 501 when no GEMINI_API_KEY is set; the builder then falls back to
// its own templates, so stores still launch without AI.
import { requireUser, send, handleError, setCors, HttpError, readBody, rateLimit } from './_lib.js';

const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
    const { uid } = await requireUser(req);
    rateLimit(req, 'gen:' + uid, 6, 60_000);
    if (!process.env.GEMINI_API_KEY) throw new HttpError(501, 'AI copywriting is not configured.');

    const b = readBody(req);
    const input = {
      category: str(b.category, 40), name: str(b.name, 60), description: str(b.description, 800),
      ownerName: str(b.ownerName, 60), ownerBio: str(b.ownerBio, 800),
    };
    if (!input.name || !input.description) throw new HttpError(400, 'A name and description are needed.');

    const prompt = `You write homepage copy for small independent online shops, mostly in India.
Write warm, specific, premium-sounding copy in plain English. Never invent facts, awards, numbers, prices, locations or claims that are not in the input. No emojis. No exclamation marks.

Shop name: ${input.name}
Type of business: ${input.category}
Owner's description of the business: """${input.description}"""
Owner's name: ${input.ownerName || '(not given)'}
Owner's bio, in their words: """${input.ownerBio || '(not given)'}"""

Return JSON with exactly these string fields:
- "tagline": one line, max 70 characters, what the shop offers
- "eyebrow": 2-4 words, uppercase-friendly, e.g. "Handmade in Jaipur" (only use places mentioned in the input)
- "heroHeading": a short, evocative homepage headline, max 60 characters, not the shop name
- "heroSubheading": one sentence, max 140 characters
- "productsHeading": 2-4 words heading above the product grid
- "about": 2-3 sentences about the business for an "Our story" section, based only on the description
- "ownerBio": the owner's bio polished into 2-3 sentences in first person, keeping every fact and adding none. Empty string if no bio was given.`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) throw new HttpError(502, 'The AI service is busy. Please try again.');
    const text = out?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    let j;
    try { j = JSON.parse(text); } catch { throw new HttpError(502, 'The AI returned an unexpected answer.'); }
    return send(res, 200, {
      tagline: str(j.tagline, 90), eyebrow: str(j.eyebrow, 40), heroHeading: str(j.heroHeading, 90),
      heroSubheading: str(j.heroSubheading, 180), productsHeading: str(j.productsHeading, 50),
      about: str(j.about, 700), ownerBio: str(j.ownerBio, 700),
    });
  } catch (err) {
    return handleError(res, err);
  }
}
