/* Service worker for hosted Sahaay stores, served at /s/{slug}/sw.js so its
 * scope is just that one store. Network-first so owners' changes show up
 * straight away, with the last copy kept for offline use. */
var CACHE = 'sahaay-store-v1:' + self.registration.scope;

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('sahaay-store-') === 0 && k.slice(-self.registration.scope.length) === self.registration.scope && k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var cacheable = url.origin === location.origin
    ? (req.mode === 'navigate' || /^\/(storefront\.(js|css))$/.test(url.pathname) || url.pathname.indexOf('/dev-uploads/') === 0)
    : /(fonts\.(googleapis|gstatic)\.com|firebasestorage\.googleapis\.com)$/.test(url.hostname);
  if (!cacheable) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok || res.type === 'opaque') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) { return hit || caches.match(self.registration.scope); });
  }));
});
