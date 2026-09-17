'use strict';

const CACHE_NAME = 'snaplist-v2';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// App-shell files (HTML/CSS/JS) change over time as we ship fixes, so they're
// network-first: always try to fetch the latest copy, and only fall back to
// the cache when the device is offline. This is what makes a code update
// (like a model-name fix) actually reach devices that already installed the
// PWA, instead of being served the stale cached JS forever.
// Icons rarely change, so those stay cache-first for speed.
const NETWORK_FIRST_FILES = new Set(['./', './index.html', './style.css', './app.js', './manifest.json']);

function isNetworkFirst(url) {
  const path = '.' + url.pathname.replace(/^.*\/product-photo-tool/, '') || './';
  return NETWORK_FIRST_FILES.has(path) || path === './' || path.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let AI provider calls pass straight through
  if (event.request.method !== 'GET') return;

  const networkFirst = event.request.mode === 'navigate' || isNetworkFirst(url);

  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      });
    })
  );
});
