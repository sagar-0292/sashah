// Local development server for Sahaay Stores — no accounts, no installs.
//   node dev-server.js        →  http://localhost:3000
// Serves the static files, runs the /api functions with an in-memory
// database (SAHAAY_DEV=1), and applies the same /s/{slug} rewrites as
// vercel.json. Data is lost when the server stops.
process.env.SAHAAY_DEV = '1';

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

const { devUploads } = await import('./api/_lib.js');

function route(pathname) {
  let m;
  if ((m = pathname.match(/^\/s\/([^/]+)\/manifest\.webmanifest$/))) return { api: 'manifest', query: { slug: m[1] } };
  if ((m = pathname.match(/^\/s\/([^/]+)\/sw\.js$/))) return { file: 'store-sw.js' };
  if ((m = pathname.match(/^\/s\/([^/]+)\/?$/))) return { api: 'render', query: { slug: m[1] } };
  if ((m = pathname.match(/^\/api\/([a-z-]+)$/))) return { api: m[1], query: {} };
  return { file: pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1)) };
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const r = route(url.pathname);

  if (url.pathname.startsWith('/dev-uploads/')) {
    const f = devUploads.get(url.pathname.slice('/dev-uploads/'.length));
    if (!f) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': f.type, 'Cache-Control': 'public, max-age=31536000' });
    return res.end(f.buf);
  }

  if (r.api) {
    if (r.api.startsWith('_') || !fs.existsSync(path.join(ROOT, 'api', r.api + '.js'))) { res.writeHead(404); return res.end('Not found'); }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString();
    // Minimal Vercel-style req/res.
    req.query = { ...Object.fromEntries(url.searchParams), ...r.query };
    try { req.body = raw && /json/.test(req.headers['content-type'] || '') ? JSON.parse(raw) : raw; } catch { req.body = raw; }
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); return res; };
    res.send = (body) => { res.end(body); return res; };
    try {
      const mod = await import(pathToFileURL(path.join(ROOT, 'api', r.api + '.js')).href);
      await mod.default(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) { res.statusCode = 500; res.end('Server error'); }
    }
    return;
  }

  const file = path.normalize(path.join(ROOT, r.file));
  if (!file.startsWith(ROOT) || /(^|[\\/])(api|node_modules)([\\/]|$)/.test(path.relative(ROOT, file)) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Sahaay Stores dev server → http://localhost:${PORT}  (in-memory data, dev sign-in)`);
});
