// MedVault Service Worker v3 — with background notification support
const CACHE = 'medvault-v3';
const ASSETS = ['./', './index.html', './manifest.json'];

// ── Install & Activate ────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('index.html') || url.pathname === '/') {
    e.respondWith(caches.match('./index.html').then(c => c || fetch(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      if (r.ok) { const cl = r.clone(); caches.open(CACHE).then(cache => cache.put(e.request, cl)); }
      return r;
    }))
  );
});

// ── Notification click ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(cls => {
      if (cls.length > 0) { cls[0].focus(); return; }
      return clients.openWindow('./');
    })
  );
});

// ── Periodic Background Sync ──────────────────────────────────
// Fires on Android Chrome even when app is closed
self.addEventListener('periodicsync', e => {
  if (e.tag === 'medvault-daily-check') {
    e.waitUntil(checkAndNotify());
  }
});

// ── Push event (for future server-side push) ──────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'MedVault', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'medvault-alert',
      renotify: true,
    })
  );
});

// ── Check medicines and fire notification if needed ───────────
async function checkAndNotify() {
  try {
    // Read reminder settings from localStorage via client
    const allClients = await clients.matchAll({ includeUncontrolled: true });

    // Try to get data from an open client
    for (const client of allClients) {
      const channel = new MessageChannel();
      client.postMessage({ type: 'GET_LOW_STOCK' }, [channel.port2]);
      const result = await new Promise((resolve) => {
        channel.port1.onmessage = e => resolve(e.data);
        setTimeout(() => resolve(null), 2000);
      });
      if (result && result.items && result.items.length > 0) {
        await fireBackgroundNotification(result.items);
        return;
      }
    }

    // Fallback: read from IndexedDB directly
    const data = await readFromIDB();
    if (data) {
      const lowItems = getLowStockFromData(data);
      if (lowItems.length > 0) await fireBackgroundNotification(lowItems);
    }
  } catch(e) {
    console.warn('SW checkAndNotify error:', e);
  }
}

async function fireBackgroundNotification(items) {
  const title = `💊 MedVault — ${items.length} medicine${items.length > 1 ? 's' : ''} need attention`;
  const body = items.slice(0, 4).join('\n') + (items.length > 4 ? `\n+${items.length - 4} more` : '');
  await self.registration.showNotification(title, {
    body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'medvault-daily',
    renotify: true,
    requireInteraction: false,
  });
}

// Read app data from IndexedDB (service worker context)
function readFromIDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('medvault_db', 1);
      req.onsuccess = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('appdata')) { resolve(null); return; }
        const tx = db.transaction('appdata', 'readonly');
        const st = tx.objectStore('appdata');
        const get = st.get('mv_data');
        get.onsuccess = () => resolve(get.result ? get.result.value : null);
        get.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch(e) { resolve(null); }
  });
}

// Simple low stock check without full app logic
function getLowStockFromData(data) {
  const items = [];
  (data.profiles || []).forEach(p => {
    (p.medicines || []).forEach(m => {
      if (m.count === 0) items.push(`${p.name}: ${m.name} — OUT OF STOCK`);
      else if (m.count <= 4) items.push(`${p.name}: ${m.name} — only ${m.count} left`);
    });
  });
  (data.sosMeds || []).forEach(m => {
    if (m.count === 0) items.push(`SOS: ${m.name} — OUT OF STOCK`);
    else if (m.count <= 4) items.push(`SOS: ${m.name} — only ${m.count} left`);
  });
  return items;
}

// ── Message from app ──────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_REMINDER') {
    // Store schedule info — SW will use it for periodic sync
    console.log('SW: reminder schedule received', e.data);
  }
});
