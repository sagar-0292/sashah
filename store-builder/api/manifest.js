// GET /s/{slug}/manifest.webmanifest  (rewritten to /api/manifest?slug={slug})
// The installable-app manifest for one store, built from its app settings.
import { data, isValidSlug, handleError } from './_lib.js';

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '');
    const doc = isValidSlug(slug) ? await data.getStore(slug) : null;
    if (!doc || !doc.store.app || !doc.store.app.enabled) return res.status(404).json({ error: 'No app for this store.' });
    const s = doc.store, a = s.app, icons = a.icons || {};
    const list = [];
    if (icons['192']) list.push({ src: icons['192'], sizes: '192x192', type: 'image/png', purpose: 'any' });
    if (icons['512']) list.push({ src: icons['512'], sizes: '512x512', type: 'image/png', purpose: 'any' });
    if (icons.maskable) list.push({ src: icons.maskable, sizes: '512x512', type: 'image/png', purpose: 'maskable' });
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(JSON.stringify({
      id: `/s/${slug}/`,
      name: a.name || s.name,
      short_name: a.shortName || String(s.name).slice(0, 12),
      description: s.tagline || `Shop at ${s.name}`,
      start_url: `/s/${slug}/`,
      scope: `/s/${slug}/`,
      display: 'standalone',
      orientation: 'portrait',
      background_color: a.bg || (s.theme || {}).primary || '#ffffff',
      theme_color: '#ffffff',
      categories: ['shopping'],
      icons: list,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}
