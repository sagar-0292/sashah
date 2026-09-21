'use strict';

const CACHE_NAME = 'sahaay-snaplist-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App-shell files are network-first so a shipped fix/price change reaches
// devices that already installed the PWA, not stuck on a stale cache.
// API calls (/api/...) and the Firebase/Razorpay CDN scripts always go to
// the network — this worker never caches or intercepts those.
const NETWORK_FIRST_FILES = new Set(['./', './index.html', './style.css', './app.js', './manifest.json']);

function isNetworkFirst(url) {
  const path = '.' + url.pathname.replace(/^.*\/sahaay/, '') || './';
  return NETWORK_FIRST_FILES.has(path) || path === './' || path.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // Firebase/Razorpay/Google Fonts — never intercept
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return; // never cache API responses

  const networkFirst = event.request.mode === 'navigate' || isNetworkFirst(url);

  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)); return res; })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
      return res;
    }))
  );
});
