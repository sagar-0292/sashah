// GET /s/{slug}/   (rewritten to /api/render?slug={slug})
// Serves a live store: the page shell with the store's data inlined, real
// <title>/description/og tags for search engines and WhatsApp link previews,
// and the PWA manifest + service worker when the store's app is enabled.
import { data, esc, isValidSlug, handleError } from './_lib.js';

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || '');
    const doc = isValidSlug(slug) ? await data.getStore(slug) : null;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (!doc) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).send(notFound());
    }
    const s = doc.store;
    const base = `/s/${slug}/`;
    const title = s.name + (s.tagline ? ' — ' + s.tagline : '');
    const desc = s.tagline || String(s.about || '').slice(0, 160) || `Shop online at ${s.name}`;
    const heroSec = ((s.pages || [])[0] || { sections: [] }).sections.find((x) => x.type === 'hero') || {};
    const ogImage = (heroSec.settings && heroSec.settings.image) || ((s.products || []).find((p) => p.images && p.images[0]) || {}).images?.[0] || '';
    const isImg = (u) => typeof u === 'string' && /^(https:|\/dev-uploads\/)/.test(u);
    const initials = (n) => String(n || '?').trim().split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'S';
    const appOn = s.app && s.app.enabled && s.app.icons && s.app.icons['192'];
    const favicon = appOn ? s.app.icons['192'] : (s.brand && s.brand.type === 'image' && isImg(s.logo)) ? s.logo
      : 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${esc((s.theme || {}).primary || '#111')}"/><text x="32" y="42" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="#fff">${esc(initials((s.brand && s.brand.text) || s.name))}</text></svg>`);
    // Escape so the JSON can't close the <script> tag or break on line separators.
    const json = JSON.stringify(s).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#ffffff">
<meta property="og:title" content="${esc(s.name)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
${ogImage && /^https:/.test(ogImage) ? `<meta property="og:image" content="${esc(ogImage)}">\n` : ''}<link rel="icon" href="${esc(favicon)}">
${appOn ? `<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="apple-touch-icon" href="${esc(s.app.icons['180'] || s.app.icons['192'])}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${esc(s.app.shortName || s.name)}">
` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="/storefront.css">
<style>html,body{margin:0;background:#fff;}</style>
</head>
<body>
<div id="sf-root"><noscript>${esc(s.name)} needs JavaScript turned on to show products.</noscript></div>
<script src="/sections.js"></script>
<script src="/storefront.js"></script>
<script>
var STORE = ${json};
var SLUG = ${JSON.stringify(slug)};
// Canonical address ends in "/" so the store's app scope (/s/{slug}/) covers it.
if (location.pathname === "/s/" + SLUG) history.replaceState(null, "", location.pathname + "/" + location.search + location.hash);
SahaayStorefront.mount(document.getElementById("sf-root"), STORE, {
  mode: "live",
  poweredUrl: "/",
  onOrder: function (o) {
    return fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: SLUG, customer: o.customer, payment: o.payment,
        items: o.items.map(function (i) { return { productId: i.productId, qty: i.qty }; }) })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || "We couldn't place your order. Please try again.");
        return j.order;
      });
    });
  }
});
${appOn ? `if ("serviceWorker" in navigator) { window.addEventListener("load", function () { navigator.serviceWorker.register("${base}sw.js", { scope: "${base}" }); }); }` : ''}
</script>
</body>
</html>`;
    // Browsers always re-check (stock must be fresh); Vercel's edge may serve
    // a copy for a few seconds to absorb traffic spikes.
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
    return res.status(200).send(html);
  } catch (err) {
    return handleError(res, err);
  }
}

function notFound() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Store not found</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 Inter,system-ui,sans-serif;background:#FBFAF8;color:#121211;text-align:center;padding:24px}h1{font-size:28px;margin:0 0 8px}p{color:#5F5D58;margin:0 0 24px}a{display:inline-block;background:#121211;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600}</style></head>
<body><div><h1>This store isn't here</h1><p>The link may be mistyped, or the store may have closed.</p><a href="/">Create your own store, free</a></div></body></html>`;
}
