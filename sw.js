// MedVault Service Worker
// Caches all app assets for full offline functionality

const CACHE_NAME = 'medvault-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  // Google Fonts — cached on first load
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
];

// ── INSTALL: cache all core assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, ignore failures (e.g. fonts if offline at install time)
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: remove old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first for app shell, network-first for everything else ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always serve index.html from cache if available (app shell)
  if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(event.request))
    );
    return;
  }

  // For Google Fonts and other external resources: stale-while-revalidate
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For local assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
