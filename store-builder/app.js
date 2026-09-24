/* Sahaay Stores — builder app (landing, setup wizard, admin dashboard).
 * All data lives in localStorage under KEY; storefront.js turns that same
 * object into the customer-facing store, and Publish exports it together
 * with a PWA manifest, service worker and icons so it installs as an app. */
(function () {
  'use strict';

  var KEY = 'sahaay-stores:v1';
  var SF = SahaayStorefront;
  var esc = SF.esc;
  var PRESETS = SahaayPresets.PRESETS;
  var app = document.getElementById('app');
  var landing = document.getElementById('landing');

  var COLORS = ['#1F1D1B', '#8A5A44', '#B4553B', '#C27C88', '#2F6B4F', '#0E7A5F', '#2E4F7A', '#6B4FA0'];
  var SS = window.SahaaySections;
  var CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'NPR', 'LKR', 'BDT'];
  var STATUSES = [
    ['new', 'New', 'blue'], ['confirmed', 'Confirmed', 'amber'], ['paid', 'Paid', 'green'],
    ['shipped', 'Shipped', 'amber'], ['delivered', 'Delivered', 'green'], ['cancelled', 'Cancelled', 'red']
  ];

  // Lucide-style icons for the builder UI.
  var IC = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    orders: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    products: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    design: '<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5.6 5.6 0 0 0 22 10c0-4.4-4.5-8-10-8z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    publish: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    zip: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M11 7h2M11 10h2M11 13h2v3h-2z"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
    call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    tablet: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    store: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    food: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M9 3v6M16 21V3c2.5 1 3.5 4 3.5 7 0 2-1 3-3.5 3"/>',
    shirt: '<path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
    hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 12a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
    sparkle: '<path d="M12 3c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6zM19 15c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z"/>',
    lamp: '<path d="M8 3h8l3 8H5z"/><path d="M12 11v7M8 21h8"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    basket: '<path d="M3 10h18l-2 10H5z"/><path d="m8 10 4-7 4 7M9 14v3M15 14v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.6 4.9-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
    header: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
    footer: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7"/>',
    columns: '<rect x="3" y="5" width="8" height="14" rx="1.5"/><path d="M14 8h7M14 12h7M14 16h4"/>',
    text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    quote: '<path d="M7 11H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6a4 4 0 0 1-4 4M17 11h-3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6a4 4 0 0 1-4 4"/>',
    gallery: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
    play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h1l4 5V4L6 9H5a2 2 0 0 0-2 2zM14 8a5 5 0 0 1 0 8M17 5a9 9 0 0 1 0 14"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    pages: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    android: '<path d="M7 10v7a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-7z"/><path d="M7 9a5 5 0 0 1 10 0z"/><path d="m8 4 1.5 2M16 4l-1.5 2"/>',
    apple: '<path d="M16 3c0 2-1.5 3.5-3.5 3.5C12.5 4.5 14 3 16 3z"/><path d="M12.5 8c1.5 0 2.2-.8 3.5-.8 1.2 0 2.5.7 3.3 2-2.8 1.6-2.3 5.6.4 6.6-.7 1.9-2 4.2-3.6 4.2-1.2 0-1.6-.7-3.1-.7s-2 .7-3.2.7C8 20 5 16.2 5 12.3 5 9.4 6.9 7.3 9 7.3c1.3 0 2.2.7 3.5.7z"/>'
  };
  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[name] + '</svg>';
  }

  // ---------- storage ----------
  function load() {
    try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return null; }
  }
  // Fill in fields added after a store was first created.
  function migrate(s) {
    if (!s) return s;
    s.flags = s.flags || {};
    s.orders = s.orders || [];
    s.products = s.products || [];
    s.theme = s.theme || { template: 'classic', primary: '#1F1D1B', font: 'modern' };
    s.contact = s.contact || {};
    SS.upgrade(s);   // older stores → the section model
    s.payments = s.payments || {};
    s.shipping = s.shipping || {};
    s.owner = s.owner || { name: '', bio: '', photo: '' };
    s.app = s.app || { enabled: false, name: s.name, shortName: (s.name || '').slice(0, 12), bg: s.theme.primary, icon: '', banner: true };
    return s;
  }
  var store = load();

  // Saves locally and, on the hosted platform, publishes the change live.
  function save(opts) {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {
      toast('Storage is full. Try fewer or smaller photos.', 'alert');
      return false;
    }
    if (!(opts && opts.local)) queueSync();
    return true;
  }

  // ============================================================
  // Hosted platform (cloud) — auto-publishing
  // ============================================================
  var Cloud = window.SahaayCloud;
  var cloud = { on: false, ai: false, state: 'idle', error: '', timer: 0, running: false, again: false };

  function setSync(state, error) {
    cloud.state = state;
    cloud.error = error || '';
    var el = app.querySelector('[data-sync]');
    if (el) el.outerHTML = syncPill();
  }

  function syncPill() {
    if (!cloud.on) return '<span data-sync></span>';
    var map = {
      idle: ['green', 'Live'], saved: ['green', 'Live · saved'], pending: ['amber', 'Unsaved changes'],
      saving: ['amber', 'Publishing…'], error: ['red', 'Not published — retry']
    };
    var m = map[cloud.state] || map.idle;
    return '<button class="pill pill-' + m[0] + ' sync-pill" data-sync data-action="sync-now" title="' + esc(cloud.error || 'Changes publish automatically') + '">' + m[1] + '</button>';
  }

  function queueSync(delay) {
    if (!cloud.on || !store || !store.slug && !store.flags.launched) return;
    clearTimeout(cloud.timer);
    if (cloud.state !== 'saving') setSync('pending');
    cloud.timer = setTimeout(runSync, delay == null ? 1200 : delay);
  }

  function runSync() {
    if (!cloud.on || !store) return Promise.resolve();
    if (cloud.running) { cloud.again = true; return Promise.resolve(); }
    cloud.running = true;
    setSync('saving');
    return uploadPendingImages().then(ensureAppIcons).then(function () {
      return Cloud.saveStore(publicCopy(store));
    }).then(function (r) {
      store.slug = r.slug;
      store.url = r.url;
      store.flags.published = true;
      store.flags.publishedAt = new Date().toISOString();
      save({ local: true });
      setSync('saved');
    }).catch(function (e) {
      setSync('error', e.message);
    }).then(function () {
      cloud.running = false;
      if (cloud.again) { cloud.again = false; runSync(); }
    });
  }

  // What gets published: everything except orders and builder-only flags.
  function publicCopy(s) {
    var c = JSON.parse(JSON.stringify(s));
    delete c.orders; delete c.flags; delete c.url;
    return c;
  }

  // Uploads a freshly picked photo; on the hosted platform the store keeps a
  // URL instead of the image itself. Falls back to the inline image offline.
  function storeImage(dataUrl) {
    if (!cloud.on) return Promise.resolve(dataUrl);
    return Cloud.ensureUser().then(function () { return Cloud.upload(dataUrl); }).catch(function () { return dataUrl; });
  }

  // Catches any inline images left over (e.g. picked while offline).
  function uploadPendingImages() {
    var jobs = [];
    var up = function (get, set) {
      var v = get();
      if (typeof v === 'string' && v.indexOf('data:') === 0) jobs.push(Cloud.upload(v).then(set));
    };
    up(function () { return store.logo; }, function (u) { store.logo = u; });
    if (store.owner) up(function () { return store.owner.photo; }, function (u) { store.owner.photo = u; });
    (store.pages || []).forEach(function (pg) {
      pg.sections.forEach(function (sec) {
        var st = sec.settings || {};
        ['image', 'photo'].forEach(function (k) { up(function () { return st[k]; }, function (u) { st[k] = u; }); });
        (st.items || []).forEach(function (it) { up(function () { return it.image; }, function (u) { it.image = u; }); });
      });
    });
    up(function () { return store.app.icon; }, function (u) { store.app.icon = u; });
    store.products.forEach(function (p) {
      (p.images || []).forEach(function (_, i) {
        up(function () { return p.images[i]; }, function (u) { p.images[i] = u; });
      });
    });
    return Promise.all(jobs);
  }

  // Draws and uploads the home-screen icons whenever the logo/colour changes.
  function ensureAppIcons() {
    if (!store.app.enabled) return Promise.resolve();
    var sig = [store.brand.type, store.brand.text, store.logo, store.app.bg || store.theme.primary, store.app.icon, (store.theme.fonts || {}).heading].join('|');
    if (store.app.iconsSig === sig && store.app.icons) return Promise.resolve();
    var sizes = [['192', 192], ['512', 512], ['maskable', 512, true], ['180', 180]];
    return Promise.all(sizes.map(function (s) { return renderIcon(s[1], s[2], 'dataurl'); })).then(function (urls) {
      return Promise.all(urls.map(function (u) { return Cloud.upload(u); }));
    }).then(function (up) {
      store.app.icons = {};
      sizes.forEach(function (s, i) { store.app.icons[s[0]] = up[i]; });
      store.app.iconsSig = sig;
    }).catch(function (e) { console.warn('App icons not updated:', e); });
  }

  // Pull live orders and sold-down stock from the platform.
  function refreshFromCloud() {
    if (!cloud.on || !store || !store.slug || !Cloud.user()) return Promise.resolve();
    return Promise.all([Cloud.orders(), Cloud.loadMine()]).then(function (res) {
      var live = res[0].map(function (o) { o.cloud = true; return o; });
      store.orders = live.concat((store.orders || []).filter(function (o) { return o.test; }))
        .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
      var server = res[1].store;
      if (server) {
        var byId = {};
        (server.products || []).forEach(function (p) { byId[p.id] = p; });
        store.products.forEach(function (p) {
          var sp = byId[p.id];
          if (sp && (Number(sp.stockSetAt) || 0) >= (Number(p.stockSetAt) || 0)) { p.stock = sp.stock; p.stockSetAt = sp.stockSetAt; }
        });
        store.url = res[1].url;
      }
      save({ local: true });
      refreshNavCounts();
    }).catch(function (e) { console.warn('Could not refresh from the platform:', e); });
  }

  var uid = SahaayPresets.uid;
  function money(n) { return SF.money(n, store && store.currency); }
  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }
  function isImg(s) { return /^(data:|https?:|\/)/.test(String(s || '')); }
  function slug(s) { return String(s || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'store'; }

  var toastTimer;
  function toast(msg, ic) {
    var t = document.getElementById('toast');
    t.innerHTML = icon(ic || 'check', 16) + '<span>' + esc(msg) + '</span>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; }
  }

  // Resize + recompress photos so a whole catalogue fits in localStorage (~5 MB).
  function compressImage(file, max, quality) {
    max = max || 1000; quality = quality || 0.8;
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('Not an image')); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
      img.src = url;
    });
  }

  function hasImageLogo(s) { return s.brand && s.brand.type === 'image' && isImg(s.logo); }
  function monogram(s) { return SF.initials((s.brand && s.brand.text) || s.name); }
  function headingFont(s) { var f = SS.FONTS[((s.theme || {}).fonts || {}).heading]; return f ? f[1] : 'inherit'; }

  function logoBox(s, cls, size) {
    s = s || store;
    var bg = s.theme.primary;
    var style = 'background:' + esc(hasImageLogo(s) ? 'transparent' : bg) + ';color:' + SF.onColor(bg) + ';font-family:' + esc(headingFont(s)) + (size ? ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.38) + 'px' : '');
    return '<span class="' + (cls || 'store-logo') + ' mono" style="' + style + '">' + (hasImageLogo(s) ? '<img src="' + esc(s.logo) + '" alt="">' : esc(monogram(s))) + '</span>';
  }

  function appIcon(size, radius) {
    var a = store.app || {};
    var bg = a.bg || store.theme.primary;
    var inner = a.icon ? '<img src="' + esc(a.icon) + '" alt="">'
      : hasImageLogo(store) ? '<img src="' + esc(store.logo) + '" alt="" style="width:64%;height:64%;object-fit:contain">'
        : '<span style="font-size:' + Math.round(size * 0.4) + 'px;line-height:1;font-family:' + esc(headingFont(store)) + ';color:' + SF.onColor(bg) + '">' + esc(monogram(store)) + '</span>';
    return '<div class="app-icon" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + (radius || Math.round(size * 0.23)) + 'px;background:' + esc(bg) + '">' + inner + '</div>';
  }

  function statusPill(s) {
    var st = STATUSES.filter(function (x) { return x[0] === s; })[0] || STATUSES[0];
    return '<span class="pill pill-' + st[2] + '">' + st[1] + '</span>';
  }

  // ---------- device frames (scaled iframes) ----------
  var DEVICES = { desktop: [1280, 820], tablet: [820, 1180], phone: [390, 800] };
  var PHONE_STATUS = '<div class="phone-status"><span>9:41</span><span class="ps-icons"><svg viewBox="0 0 18 12" width="16" height="11"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 27 12" width="24" height="11"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="1.8"/><rect x="24.5" y="4" width="2" height="4" rx="1" opacity=".4"/></svg></span></div>';

  function deviceFrame(kind, src, opts) {
    opts = opts || {};
    var d = DEVICES[kind];
    var view = '<div class="dev-view' + (opts.interactive ? ' interactive' : '') + '" data-w="' + d[0] + '" data-h="' + (opts.h || d[1]) + '" data-src="' + esc(src) + '"' + (opts.live ? ' data-live="1"' : '') + '></div>';
    if (kind === 'phone') return '<div class="mock-phone"><div class="phone-notch"></div>' + PHONE_STATUS + view + '</div>';
    if (kind === 'tablet') return '<div class="frame-tablet">' + view + '</div>';
    return '<div class="frame-desktop"><div class="mock-bar"><i></i><i></i><i></i><span>' + esc(slug(store && store.name)) + '.store</span></div>' + view + '</div>';
  }

  var resizeObs = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) { fitView(e.target); });
  }) : null;
  var lazyObs = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { loadView(e.target); lazyObs.unobserve(e.target); }
    });
  }, { rootMargin: '400px' }) : null;

  function fitView(el) {
    var w = Number(el.getAttribute('data-w')), h = Number(el.getAttribute('data-h'));
    var s = el.clientWidth / w;
    if (!s) return;
    el.style.height = Math.round(h * s) + 'px';
    var f = el.querySelector('iframe');
    if (f) f.style.transform = 'scale(' + s + ')';
  }
  function loadView(el) {
    if (el.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = el.getAttribute('data-src');
    f.width = el.getAttribute('data-w');
    f.height = el.getAttribute('data-h');
    f.title = 'Store preview';
    if (!el.classList.contains('interactive')) f.tabIndex = -1;
    if (el.getAttribute('data-live')) {
      f.className = 'live-preview';
      f.addEventListener('load', function () { pushPreview(f); });
    }
    el.appendChild(f);
    fitView(el);
  }
  function mountViews(scope, lazy) {
    scope.querySelectorAll('.dev-view').forEach(function (el) {
      fitView(el);
      if (resizeObs) resizeObs.observe(el);
      if (lazy && lazyObs) lazyObs.observe(el); else loadView(el);
    });
  }

  var previewData = null;   // the store object live previews should show
  function pushPreview(frame) {
    var data = previewData || store;
    if (!data) return;
    var frames = frame ? [frame] : app.querySelectorAll('iframe.live-preview');
    Array.prototype.forEach.call(frames, function (f) {
      if (f.contentWindow) f.contentWindow.postMessage({ type: 'sahaay-store', store: data }, location.origin);
    });
  }
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === 'sahaay-preview-ready') {
      var f = Array.prototype.filter.call(app.querySelectorAll('iframe.live-preview'), function (x) { return x.contentWindow === e.source; })[0];
      if (f) pushPreview(f);
    }
    if (e.data.type === 'sahaay-order') {
      store = load();
      toast('Test order received — see it in Orders');
      refreshNavCounts();
    }
  });

  // ---------- router ----------
  function route() {
    var h = location.hash || '';
    if (h.indexOf('#/') !== 0 || h === '#/') return { name: 'landing' };
    var parts = h.slice(2).split('/');
    return { name: parts[0], sub: parts[1] || '', a: parts[2] || '', b: parts[3] || '' };
  }

  var landingMounted = false;
  function render() {
    var r = route();
    if (r.name === 'landing') {
      app.hidden = true;
      landing.hidden = false;
      document.querySelectorAll('[data-start]').forEach(function (a) {
        if (!a.dataset.orig) a.dataset.orig = a.textContent;
        a.href = store ? '#/admin' : '#/setup';
        a.textContent = store ? (a.hasAttribute('data-short') ? 'Dashboard' : 'Open your dashboard') : a.dataset.orig;
      });
      document.title = 'Sahaay Stores — Online store and mobile app for small businesses';
      if (!landingMounted) { landingMounted = true; mountViews(landing, true); }
      return;
    }
    landing.hidden = true;
    app.hidden = false;
    if (r.name === 'setup') { renderWizard(); return; }
    if (r.name === 'login') { renderLogin(); return; }
    if (r.name === 'live') { if (store) renderLaunched(); else location.replace('#/setup'); return; }
    if (!store) { location.replace('#/setup'); return; }
    renderAdmin(r);
  }

  // ---------- sign in (returning owners on a new device) ----------
  function renderLogin() {
    document.title = 'Sign in · Sahaay Stores';
    app.innerHTML = '<div class="auth-page"><div class="auth-card"><a class="brand" href="#/"><span class="brand-mark">' + icon('store', 16) + '</span>Sahaay <span class="brand-soft">Stores</span></a>' +
      '<h1>Welcome back</h1><p>Sign in with the Google account you used to save your store.</p>' +
      (cloud.on
        ? '<button class="btn btn-secondary btn-lg btn-block" data-action="login-google">' + GOOGLE_G + 'Continue with Google</button>'
        : '<div class="callout">' + icon('info', 16) + '<span>Signing in needs the hosted platform. In this version your store is saved in this browser.</span></div>') +
      '<p class="auth-foot">New here? <a class="btn-link" href="#/setup">Create a store</a></p></div></div>';
  }
  var GOOGLE_G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6C6.6 42.6 14.6 48 24 48z"/></svg>';

  function afterSignIn() {
    return Cloud.loadMine().then(function (r) {
      if (r.store) {
        var local = migrate(r.store);
        local.slug = r.slug; local.url = r.url;
        local.flags = { launched: true, published: true, designed: true, appVisited: true };
        local.orders = [];
        store = local;
        save({ local: true });
        return refreshFromCloud().then(function () { location.hash = '#/admin'; toast('Welcome back'); });
      }
      location.hash = '#/setup';
      toast('No store on that account yet. Let\'s create one.', 'info');
    });
  }

  window.addEventListener('hashchange', function () {
    if (location.hash.indexOf('#/admin/products/') !== 0) draftFor = null;
    var wasLanding = !landing.hidden;
    render();
    if (route().name !== 'landing' || !wasLanding) window.scrollTo(0, 0);
  });
  window.addEventListener('scroll', function () {
    var n = document.querySelector('.lp-nav');
    if (n) n.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // ============================================================
  // Setup wizard — four questions, then the store publishes itself
  // ============================================================
  function freshWizard() {
    return { step: 0, busy: false, d: { name: '', category: '', description: '', ownerName: '', ownerBio: '', ownerPhoto: '', logoImg: '', mark: 'none', primary: '', style: '', whatsapp: '', currency: 'INR', app: true } };
  }
  var wz = freshWizard();
  var WZ_STEPS = ['Your business', 'About you', 'Your brand', 'Launch'];

  function applyPreset(cat) {
    var p = PRESETS[cat];
    wz.d.category = cat;
    wz.d.primary = p.color;
    wz.d.style = p.style;
  }

  function wizardInput(extra) {
    var d = wz.d;
    return Object.assign({
      name: d.name || 'Your Store', category: d.category || 'other', description: d.description,
      ownerName: d.ownerName, ownerBio: d.ownerBio, ownerPhoto: d.ownerPhoto,
      logoImage: d.logoImg, mark: d.mark, primary: d.primary, style: d.style,
      whatsapp: d.whatsapp, currency: d.currency, app: d.app,
      // Hosted stores start empty (no made-up products for real customers);
      // the download-only mode keeps samples so there's something to see.
      samples: !cloud.on
    }, extra || {});
  }
  function wizardStore() { return SahaayPresets.buildStore(wizardInput({ id: 'draft' })); }

  var wzRaf = 0;
  function updateWizardPreview() {
    cancelAnimationFrame(wzRaf);
    wzRaf = requestAnimationFrame(function () { previewData = wizardStore(); pushPreview(); });
  }

  function segButtons(action, key, options, current) {
    return '<div class="seg">' + options.map(function (o) {
      return '<button type="button" class="' + (current === o[0] ? 'on' : '') + '" data-action="' + action + '" data-k="' + key + '" data-v="' + o[0] + '"' + (o[2] ? ' style="font-family:\'' + o[2] + '\'"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  function colorSwatches(action, current, bind) {
    return '<div class="swatches">' + COLORS.map(function (c) {
      return '<button type="button" class="swatch' + (String(current).toLowerCase() === c.toLowerCase() ? ' on' : '') + '" style="background:' + c + '" data-action="' + action + '" data-k="primary" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
    }).join('') + '<input type="color" ' + bind + ' value="' + esc(current || '#1F1D1B') + '" aria-label="Custom colour"></div>';
  }

  function wizardCanNext() {
    var d = wz.d;
    if (wz.step === 0) return !!(d.name.trim() && d.category && d.description.trim().length >= 10);
    return true;
  }

  function renderWizard() {
    document.title = 'Create your store · Sahaay Stores';
    var d = wz.d, s = wz.step, body = '';

    if (s === 0) {
      body = '<h1>Tell us about your business.</h1><p class="wz-sub">Three quick answers. We\'ll design your store, write your homepage and put it online for you.</p>' +
        (store ? '<div class="callout">' + icon('alert', 16) + '<span>You already have a store, <b>' + esc(store.name) + '</b>. Finishing setup will replace it. <a class="btn-link" href="#/admin">Go to its dashboard</a></span></div>' : '') +
        '<div class="field"><label for="wz-name">Business name</label><input id="wz-name" data-wz="name" placeholder="e.g. Crumb & Co." value="' + esc(d.name) + '" maxlength="60" autocomplete="organization"></div>' +
        '<div class="field"><span class="field-label">What kind of business is it?</span><div class="cat-grid">' +
        Object.keys(PRESETS).map(function (k) {
          return '<button type="button" class="cat-opt' + (d.category === k ? ' on' : '') + '" data-action="wz-cat" data-cat="' + k + '"><span>' + icon(PRESETS[k].icon || 'store', 22) + '</span>' + PRESETS[k].label + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label for="wz-desc">Describe your business</label><textarea id="wz-desc" data-wz="description" rows="4" maxlength="800" placeholder="e.g. We bake eggless cakes and cookies to order in Pune, using butter and real chocolate. Perfect for birthdays and gifting.">' + esc(d.description) + '</textarea>' +
        '<span class="help">What you sell, who it\'s for and what makes it special. We\'ll write your homepage from this.</span></div>';
    } else if (s === 1) {
      body = '<h1>Now, a little about you.</h1><p class="wz-sub">People love buying from people. This becomes a “Meet the owner” section on your store. You can skip it.</p>' +
        '<div class="owner-row"><label class="owner-photo" title="Add a photo">' + (d.ownerPhoto ? '<img src="' + esc(d.ownerPhoto) + '" alt="">' : icon('image', 22) + '<span>Photo</span>') +
        '<input type="file" accept="image/*" data-upload="wz-owner-photo" hidden></label>' +
        '<div class="field" style="flex:1;margin:0"><label for="wz-owner">Your name</label><input id="wz-owner" data-wz="ownerName" placeholder="e.g. Priya Sharma" value="' + esc(d.ownerName) + '" maxlength="60" autocomplete="name"></div></div>' +
        '<div class="field"><label for="wz-bio">Your story <span class="optional">(optional)</span></label><textarea id="wz-bio" data-wz="ownerBio" rows="5" maxlength="800" placeholder="e.g. I started baking for friends in college. Today I bake every order myself, in small batches, in my home kitchen.">' + esc(d.ownerBio) + '</textarea>' +
        '<span class="help">A few honest lines is perfect. We\'ll polish the wording, never the facts.</span></div>';
    } else if (s === 2) {
      body = '<h1>Your brand.</h1><p class="wz-sub">Have a logo or brand colours? Add them here. If not, we\'ve already picked a look for ' + esc(PRESETS[d.category].label.toLowerCase()) + '. Just continue.</p>' +
        '<div class="field"><span class="field-label">Logo</span><div class="logo-pick">' +
        '<label class="logo-upload">' + (d.logoImg ? '<img src="' + esc(d.logoImg) + '" alt="">' : icon('image', 20) + '<span>Upload</span>') + '<input type="file" accept="image/*" data-upload="wz-logo" hidden></label>' +
        (d.logoImg ? '<div class="wordmark-opts"><button class="btn-link danger" data-action="wz-rm-logo">Remove logo and use a text logo</button></div>'
          : '<div class="wordmark-opts">' + [['none', 'Name only'], ['circle', 'Circle monogram'], ['square', 'Square monogram']].map(function (o) {
            var S = SS.STYLES[d.style] || SS.STYLES.modern;
            var hf = SS.FONTS[S.fonts.heading][1];
            return '<button type="button" class="wordmark-opt' + (d.mark === o[0] ? ' on' : '') + '" data-action="wz-set" data-k="mark" data-v="' + o[0] + '">' +
              (o[0] !== 'none' ? '<span class="wm-mark wm-' + o[0] + '" style="background:' + esc(d.primary) + ';color:' + SF.onColor(d.primary) + ';font-family:' + esc(hf) + '">' + esc(SF.initials(d.name)) + '</span>' : '') +
              '<span class="wm-text" style="font-family:' + esc(hf) + ';font-weight:' + S.headingWeight + ';text-transform:' + S.headingCase + '">' + esc(d.name || 'Your Store') + '</span><small>' + o[1] + '</small></button>';
          }).join('') + '</div>') + '</div>' +
        (d.logoImg ? '' : '<span class="help">No logo yet? A clean text logo in your brand font looks professional. Upload one any time.</span>') + '</div>' +
        '<div class="field"><span class="field-label">Style</span><div class="style-cards">' + Object.keys(SS.STYLES).map(function (k) {
          var S = SS.STYLES[k];
          return '<button type="button" class="style-card' + (d.style === k ? ' on' : '') + '" data-action="wz-style" data-v="' + k + '" style="--bg:' + S.colors.bg + ';--tx:' + S.colors.text + ';--sf:' + S.colors.surface + ';--p:' + S.primary + ';--hf:' + SS.FONTS[S.fonts.heading][1].replace(/"/g, '') + ';--r:' + Math.min(S.radius, 10) + 'px"><span class="sc-preview"><i>Aa</i><b></b></span><span class="sc-name">' + S.label + '</span><small>' + S.desc + '</small></button>';
        }).join('') + '</div></div>' +
        '<div class="field"><span class="field-label">Brand colour</span>' + colorSwatches('wz-set', d.primary, 'data-wz="primary"') + '</div>';
    } else {
      var addr = cloud.on ? location.host + '/s/' + slug(d.name) : '';
      body = '<h1>Ready to go live.</h1><p class="wz-sub">' + (cloud.on ? 'We\'ll write your homepage, publish your store and set up your app. It takes a few seconds.' : 'We\'ll write your homepage and set up your store and app.') + '</p>' +
        '<div class="card launch-summary">' + logoBox(wizardStore(), 'store-logo', 48) +
        '<div style="min-width:0;flex:1"><b>' + esc(d.name) + '</b><span>' + esc(PRESETS[d.category].label) + (d.ownerName ? ' · by ' + esc(d.ownerName) : '') + '</span>' +
        (addr ? '<span class="launch-url">' + icon('external', 13) + esc(addr) + '</span>' : '') + '</div>' +
        '<span class="swatch" style="background:' + esc(d.primary) + '"></span></div>' +
        '<div class="field"><label for="wz-wa">WhatsApp number for order alerts <span class="optional">(optional)</span></label><input id="wz-wa" data-wz="whatsapp" type="tel" inputmode="tel" placeholder="91 98765 43210" value="' + esc(d.whatsapp) + '"><span class="help">Orders always appear in your dashboard. Add a number to also get them on WhatsApp.</span></div>' +
        '<div class="switch-row"><div><b>Mobile app</b><small>Customers can install your store on their phone, with your icon.</small></div><label class="switch"><input type="checkbox" data-wz="app"' + (d.app ? ' checked' : '') + '><span></span></label></div>';
    }

    var hadPreview = app.querySelector('.wz-preview iframe');
    var html = '<div class="wz"><div class="wz-form"><div class="wz-top"><a class="brand" href="#/"><span class="brand-mark">' + icon('store', 16) + '</span>Sahaay <span class="brand-soft">Stores</span></a>' +
      '<div class="wz-steps">' + WZ_STEPS.map(function (_, i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('') + '<span style="margin-left:6px">' + (s + 1) + ' / ' + WZ_STEPS.length + '</span></div></div>' +
      '<div class="wz-body">' + body + '</div>' +
      '<div class="wz-nav">' + (s > 0 ? '<button class="btn btn-secondary btn-lg" data-action="wz-back">Back</button>' : '<a class="btn btn-quiet btn-lg" href="#/">Cancel</a>') +
      '<div style="display:flex;gap:8px">' + (s === 1 || s === 2 ? '<button class="btn btn-quiet btn-lg" data-action="wz-next">Skip</button>' : '') +
      (s < WZ_STEPS.length - 1
        ? '<button class="btn btn-primary btn-lg" data-action="wz-next"' + (wizardCanNext() ? '' : ' disabled') + '>Continue</button>'
        : '<button class="btn btn-brand btn-lg" data-action="wz-launch">' + (cloud.on ? 'Launch my store' : 'Create my store') + '</button>') +
      '</div></div></div>' +
      '<aside class="wz-preview"><div class="wz-preview-label"><i></i>Live preview</div><div id="wz-phone"></div></aside></div>';

    if (hadPreview && app.querySelector('.wz-form')) {
      // Keep the phone iframe alive between steps; only swap the form.
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      app.querySelector('.wz-form').replaceWith(tmp.querySelector('.wz-form'));
    } else {
      app.innerHTML = html;
      document.getElementById('wz-phone').innerHTML = deviceFrame('phone', 'preview.html?draft=1', { live: true, interactive: true });
      mountViews(app);
    }
    updateWizardPreview();
  }

  var LAUNCH_STEPS = ['Writing your homepage', 'Designing your store', 'Publishing it online', 'Setting up your app'];

  function renderLaunching(active, error) {
    var html = '<div class="launching"><div class="launching-card">' + logoBox(wizardStore(), 'store-logo', 56) +
      '<h1>' + (error ? 'Something went wrong' : 'Building ' + esc(wz.d.name) + '…') + '</h1>' +
      '<ul class="launch-steps">' + LAUNCH_STEPS.map(function (t, i) {
        var st = i < active ? 'done' : i === active ? (error ? 'fail' : 'now') : '';
        return '<li class="' + st + '"><span class="ls-dot">' + (st === 'done' ? icon('check', 12) : st === 'fail' ? icon('x', 12) : '') + '</span>' + t + '</li>';
      }).join('') + '</ul>' +
      (error ? '<p class="launch-error">' + esc(error) + '</p><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-secondary" data-action="wz-back-to-form">Back</button><button class="btn btn-primary" data-action="wz-launch">Try again</button></div>' : '') +
      '</div></div>';
    app.innerHTML = html;
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function atLeast(p, ms) { return Promise.all([p, wait(ms)]).then(function (r) { return r[0]; }); }

  function launch() {
    if (wz.busy) return;
    wz.busy = true;
    var d = wz.d, step = 0;
    var go = function (i) { step = i; renderLaunching(i); };
    go(0);
    var ready = cloud.on ? Cloud.ensureUser() : Promise.resolve();
    ready.then(function () {
      var copy = cloud.on && cloud.ai
        ? Cloud.generate({ category: PRESETS[d.category].label, name: d.name, description: d.description, ownerName: d.ownerName, ownerBio: d.ownerBio }).catch(function () { return null; })
        : Promise.resolve(null);
      return atLeast(copy, 900);
    }).then(function (copy) {
      go(1);
      var next = migrate(SahaayPresets.buildStore(wizardInput({ copy: copy })));
      next.flags.launched = true;
      if (d.logoImg) next.flags.logoData = d.logoImg;
      next.flags.designed = !!(d.logoImg);
      if (store && store.slug && cloud.on) { next.slug = store.slug; }
      store = next;
      save({ local: true });
      return atLeast(cloud.on ? uploadPendingImages() : Promise.resolve(), 700);
    }).then(function () {
      go(2);
      save({ local: true });
      return atLeast(cloud.on ? Cloud.saveStore(publicCopy(store)).then(function (r) {
        store.slug = r.slug; store.url = r.url;
        store.flags.published = true; store.flags.publishedAt = new Date().toISOString();
      }) : Promise.resolve(), 800);
    }).then(function () {
      go(3);
      var appWork = cloud.on && store.app.enabled
        ? ensureAppIcons().then(function () { return Cloud.saveStore(publicCopy(store)); })
        : Promise.resolve();
      return atLeast(appWork, 700);
    }).then(function () {
      store.flags.appVisited = !!store.app.enabled;
      save({ local: true });
      wz = freshWizard();
      previewData = null;
      location.hash = '#/live';
    }).catch(function (e) {
      wz.busy = false;
      renderLaunching(step, (e && e.message) || 'Please check your connection and try again.');
    });
  }

  // ---------- "your store is live" ----------
  function storeLink() {
    return cloud.on && store.url ? store.url : new URL('preview.html', location.href).href;
  }

  function renderLaunched() {
    document.title = store.name + ' is live · Sahaay Stores';
    var url = storeLink();
    var live = cloud.on && store.url;
    var shown = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    var share = encodeURIComponent((live ? 'We\'re now online! Shop ' + store.name + ' here: ' : 'Take a look at ' + store.name + ': ') + url);
    var user = cloud.on && Cloud.user();
    app.innerHTML = '<div class="launched"><div class="launched-copy">' +
      '<div class="launched-badge">' + icon('check', 18) + '</div>' +
      '<h1>' + (live ? esc(store.name) + ' is live.' : esc(store.name) + ' is ready.') + '</h1>' +
      '<p class="wz-sub">' + (live ? 'Your store is online now. Share the link with your customers. There\'s nothing to host or install.' : 'Your store is set up. Online hosting is switched on when Sahaay Stores runs on its platform. Until then you can preview it and download it from Publish.') + '</p>' +
      '<div class="url-box"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(shown) + '</a><button class="btn btn-secondary btn-sm" data-action="copy-url" data-url="' + esc(url) + '">' + icon('copy', 15) + 'Copy</button></div>' +
      '<div class="launched-actions"><a class="btn btn-primary btn-lg" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('external', 16) + 'Open my store</a>' +
      '<a class="btn btn-secondary btn-lg" href="https://wa.me/?text=' + share + '" target="_blank" rel="noopener">' + icon('chat', 16) + 'Share on WhatsApp</a></div>' +
      '<h3 class="launched-next">Next steps</h3><ol class="next-steps">' +
      '<li><a href="#/admin/products/new"><b>Add your first products</b><span>A photo, a name and a price. They appear on your store instantly.</span>' + icon('chevron', 16) + '</a></li>' +
      (user && user.anonymous ? '<li><button data-action="save-access"><b>Save access to your store</b><span>Connect Google so you can manage your store from any device.</span>' + icon('chevron', 16) + '</button></li>' : '') +
      '<li><a href="#/admin"><b>Go to your dashboard</b><span>Orders, design, your mobile app and settings.</span>' + icon('chevron', 16) + '</a></li></ol></div>' +
      '<div class="launched-preview">' + deviceFrame('phone', live ? url : 'preview.html?embed=1', { interactive: true, live: !live }) + '</div></div>';
    mountViews(app);
  }

  // ============================================================
  // Admin shell
  // ============================================================
  var NAV = [
    [null, [['', 'Home', 'home'], ['orders', 'Orders', 'orders'], ['products', 'Products', 'products']]],
    ['Sales channels', [['design', 'Online store', 'design'], ['app', 'Mobile app', 'phone']]],
    [null, [['settings', 'Settings', 'settings'], ['publish', 'Publish', 'publish']]]
  ];
  var TITLES = { '': 'Home', orders: 'Orders', products: 'Products', design: 'Online store', app: 'Mobile app', settings: 'Settings', publish: 'Publish' };

  function newOrdersCount() {
    return (store.orders || []).filter(function (o) { return o.status === 'new'; }).length;
  }

  function navHtml(sub, mobile) {
    var nc = newOrdersCount();
    var groups = mobile ? [[null, [['', 'Home', 'home'], ['orders', 'Orders', 'orders'], ['products', 'Products', 'products'], ['design', 'Store', 'design'], ['app', 'App', 'phone'], ['publish', 'Publish', 'publish']]]] : NAV;
    return groups.map(function (g) {
      return (g[0] && !mobile ? '<div class="nav-group">' + g[0] + '</div>' : '') + g[1].map(function (n) {
        var on = n[0] === sub;
        var label = n[0] === 'publish' && cloud.on ? 'Share' : n[1];
        return '<a href="#/admin' + (n[0] ? '/' + n[0] : '') + '" class="' + (on ? 'on' : '') + '">' + icon(n[0] === 'publish' && cloud.on ? 'external' : n[2], mobile ? 20 : 17) + '<span>' + label + '</span>' +
          (n[0] === 'orders' && nc ? '<span class="count">' + nc + '</span>' : '') +
          (n[0] === 'app' && !store.app.enabled && !mobile ? '<span class="tag-new">NEW</span>' : '') + '</a>';
      }).join('');
    }).join('');
  }

  function refreshNavCounts() {
    if (!store) return;
    var nc = newOrdersCount();
    app.querySelectorAll('a[href="#/admin/orders"]').forEach(function (a) {
      var c = a.querySelector('.count');
      if (nc && !c) { c = document.createElement('span'); c.className = 'count'; a.appendChild(c); }
      if (c) { if (nc) c.textContent = nc; else c.remove(); }
    });
  }

  function renderAdmin(r) {
    var sub = r.sub;
    var content;
    if (sub === 'products' && r.a) content = pageProductForm(r);
    else if (sub === 'products') content = pageProducts();
    else if (sub === 'orders') content = pageOrders();
    else if (sub === 'design') content = pageDesign();
    else if (sub === 'app') content = pageApp();
    else if (sub === 'settings') content = pageSettings();
    else if (sub === 'publish') content = pagePublish();
    else { sub = ''; content = pageHome(); }

    var crumb = TITLES[sub] || 'Home';
    if (sub === 'products' && r.a) crumb = '<a href="#/admin/products">Products</a>' + icon('chevron', 14) + '<b>' + (r.a === 'new' ? 'Add product' : 'Edit product') + '</b>';
    else crumb = '<b>' + crumb + '</b>';

    document.title = (TITLES[sub] || 'Home') + ' · ' + store.name + ' · Sahaay Stores';
    app.innerHTML = '<div class="shell">' +
      '<aside class="side"><a class="brand" href="#/"><span class="brand-mark">' + icon('store', 16) + '</span>Sahaay <span class="brand-soft">Stores</span></a>' +
      '<div class="store-chip">' + logoBox() + '<div style="min-width:0;flex:1"><b>' + esc(store.name) + '</b><small><i class="' + (store.flags.published ? 'live' : '') + '"></i>' + (cloud.on && store.slug ? 'Live · /s/' + esc(store.slug) : store.flags.published ? 'Published' : 'Not published yet') + '</small></div></div>' +
      '<nav class="nav">' + navHtml(sub) + '</nav>' +
      '<div class="side-foot"><a class="btn btn-secondary btn-sm btn-block" href="' + esc(storeLink()) + '" target="_blank" rel="noopener">' + icon('external', 15) + 'View your store</a></div></aside>' +
      '<div class="main-col"><div class="topbar"><div class="crumbs">' + crumb + '</div>' + syncPill() +
      '<a class="btn btn-quiet btn-sm" href="' + esc(storeLink()) + '" target="_blank" rel="noopener">' + icon('external', 15) + 'View store</a>' +
      (sub !== 'publish' ? '<a class="btn btn-primary btn-sm" href="#/admin/publish">' + icon(cloud.on ? 'external' : 'publish', 15) + (cloud.on ? 'Share' : 'Publish') + '</a>' : '') + '</div>' +
      '<div class="mobile-top">' + logoBox() + '<b>' + esc(store.name) + '</b>' + syncPill() + '<a class="btn btn-secondary btn-sm" href="' + esc(storeLink()) + '" target="_blank" rel="noopener">View store</a></div>' +
      (sub === 'design' ? content : '<main class="main">' + content + '</main>') + '</div>' +
      '<nav class="bottom-nav">' + navHtml(sub, true) + '</nav></div>';

    previewData = null;
    mountViews(app);
    maybeRefresh(sub);
  }

  // Live orders & stock: refreshed whenever Home, Orders or Products opens,
  // then every 30 seconds while it stays open.
  var lastRefresh = 0, pollTimer = 0;
  function liveSnapshot() {
    return JSON.stringify([store.orders, store.products.map(function (p) { return p.stock; })]);
  }
  function maybeRefresh(sub) {
    clearTimeout(pollTimer);
    var r0 = route();
    if (!cloud.on || !store.slug || ['', 'orders', 'products'].indexOf(sub) < 0 || (sub === 'products' && r0.a)) return;
    var run = function () {
      lastRefresh = Date.now();
      var before = liveSnapshot();
      refreshFromCloud().then(function () {
        var r = route();
        var still = r.name === 'admin' && (r.sub || '') === sub && !r.a;
        if (still && liveSnapshot() !== before && !app.querySelector('select:focus, input:focus')) renderAdmin(r);
        if (still) pollTimer = setTimeout(run, 30000);
      });
    };
    pollTimer = setTimeout(run, Date.now() - lastRefresh > 2000 ? 0 : 30000);
  }

  function liveCard() {
    if (!cloud.on || !store.url) return '';
    var shown = store.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    var user = Cloud.user();
    return '<div class="live-card"><div class="live-dot"></div><div class="live-text"><small>Your store is live at</small>' +
      '<a href="' + esc(store.url) + '" target="_blank" rel="noopener">' + esc(shown) + '</a></div>' +
      '<button class="btn btn-secondary btn-sm" data-action="copy-url" data-url="' + esc(store.url) + '">' + icon('copy', 15) + 'Copy link</button>' +
      '<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent('Shop ' + store.name + ' online: ' + store.url) + '">' + icon('chat', 15) + 'Share</a></div>' +
      (user && user.anonymous ? '<div class="callout callout-blue">' + icon('info', 16) + '<span style="flex:1"><b>Save access to your store.</b> Right now it\'s linked to this browser only. Connect Google to manage it from any device.</span>' +
        '<button class="btn btn-secondary btn-sm" data-action="save-access">' + GOOGLE_G + 'Continue with Google</button></div>' : '');
  }

  // ---------- home ----------
  function checklist() {
    var s = store;
    var prods = s.products || [];
    return [
      ['Create your store', true, ''],
      ['Add ' + (cloud.on ? 'your first 3 products' : '3 of your own products'), prods.filter(function (p) { return !p.sample; }).length >= 3, '#/admin/products/new'],
      ['Add a real product photo', prods.some(function (p) { return p.images && p.images.length; }), '#/admin/products'],
      ['Set up WhatsApp or email for orders', !!(s.contact.whatsapp || s.contact.email), '#/admin/settings'],
      ['Add a payment method', !!(s.payments.upi || s.payments.cod), '#/admin/settings'],
      ['Customise your store design', !!s.flags.designed, '#/admin/design'],
      ['Set up your mobile app', !!(s.app.enabled && s.flags.appVisited), '#/admin/app'],
      ['Place a test order', (s.orders || []).some(function (o) { return o.test; }), 'preview.html'],
      cloud.on ? ['Share your store link with customers', !!s.flags.shared, '#/admin/publish'] : ['Publish your store', !!s.flags.published, '#/admin/publish']
    ];
  }

  function orderRevenue(list) {
    return list.filter(function (o) { return o.status !== 'cancelled'; }).reduce(function (s, o) { return s + (Number(o.total) || 0); }, 0);
  }

  function greeting() {
    var h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  function pageHome() {
    var orders = store.orders || [];
    var cl = checklist();
    var done = cl.filter(function (c) { return c[1]; }).length;
    var samples = (store.products || []).filter(function (p) { return p.sample; }).length;
    var valid = orders.filter(function (o) { return o.status !== 'cancelled'; }).length;
    var aov = valid ? orderRevenue(orders) / valid : 0;

    return '<div class="page-head"><div><h1>' + greeting() + '</h1><p>Here\'s what\'s happening with ' + esc(store.name) + '.</p></div>' +
      '<div class="page-actions"><a class="btn btn-secondary" href="#/admin/products/new">' + icon('plus', 16) + 'Add product</a></div></div>' + liveCard() +
      (cloud.on && !store.products.length ? '<div class="callout callout-green">' + icon('products', 16) + '<span style="flex:1"><b>Add your first products.</b> Your store is online, and products you add appear on it instantly.</span><a class="btn btn-primary btn-sm" href="#/admin/products/new">' + icon('plus', 15) + 'Add product</a></div>' : '') +
      '<div class="stats">' +
      '<div class="stat"><small>Total sales</small><b>' + money(orderRevenue(orders)) + '</b></div>' +
      '<div class="stat"><small>Orders</small><b>' + orders.length + '</b></div>' +
      '<div class="stat"><small>Average order</small><b>' + money(Math.round(aov)) + '</b></div>' +
      '<div class="stat"><small>Awaiting action</small><b>' + newOrdersCount() + '</b></div></div>' +
      (samples ? '<div class="callout callout-blue">' + icon('info', 16) + '<span style="flex:1">Your store has ' + samples + ' sample product' + (samples > 1 ? 's' : '') + '. Replace them with your own before you publish.</span><button class="btn-link" data-action="rm-samples">Delete samples</button></div>' : '') +
      '<div class="two-col"><div>' +
      '<div class="card"><div class="card-head"><h2>Launch checklist</h2><span style="font-size:12.5px;color:var(--text3)">' + done + ' of ' + cl.length + ' complete</span></div>' +
      '<div class="progress-row"><div class="progress"><i style="width:' + Math.round(done / cl.length * 100) + '%"></i></div></div>' +
      '<ul class="checklist">' + cl.map(function (c) {
        return '<li class="' + (c[1] ? 'done' : '') + '"><span class="tick">' + (c[1] ? icon('check', 12) : '') + '</span><span class="cl-text">' + esc(c[0]) + '</span>' +
          (!c[1] && c[2] ? '<a class="btn btn-secondary btn-sm" href="' + c[2] + '"' + (c[2] === 'preview.html' ? ' target="_blank"' : '') + '>Start</a>' : '') + '</li>';
      }).join('') + '</ul></div>' +
      '<div class="card card-flush"><div class="card-head"><h2>Recent orders</h2><a class="btn-link" href="#/admin/orders">View all</a></div>' +
      (orders.length ? '<div style="margin-top:8px">' + orders.slice(0, 5).map(orderRowHtml).join('') + '</div>'
        : '<div class="empty" style="padding:36px 20px"><p style="margin-bottom:14px">No orders yet. Open your store and place a test order to see how it works.</p><a class="btn btn-secondary btn-sm" href="preview.html" target="_blank">' + icon('external', 15) + 'Open store</a></div>') +
      '</div></div>' +
      '<div><div class="card"><div class="card-head"><h2>Online store</h2><a class="btn-link" href="#/admin/design">Customize</a></div>' +
      '<div style="max-width:230px;margin:0 auto">' + deviceFrame('phone', 'preview.html?embed=1', { live: true }) + '</div></div>' +
      '<div class="card"><div class="card-head"><h2>Mobile app</h2>' + (store.app.enabled ? '<span class="pill pill-green">On</span>' : '<span class="pill pill-gray">Off</span>') + '</div>' +
      '<div style="display:flex;gap:14px;align-items:center">' + appIcon(52) + '<div style="flex:1;min-width:0"><b style="display:block">' + esc(store.app.name || store.name) + '</b><span style="font-size:13px;color:var(--text2)">' + (store.app.enabled ? 'Installable on Android & iPhone' : 'Let customers install your store') + '</span></div></div>' +
      '<a class="btn btn-secondary btn-sm btn-block" style="margin-top:14px" href="#/admin/app">' + (store.app.enabled ? 'Manage app' : 'Set up app') + '</a></div></div></div>';
  }

  // ---------- products ----------
  var productFilter = '', productTab = 'all';

  function productStatus(p) {
    if (p.active === false) return 'hidden';
    if (p.stock !== null && p.stock !== '' && p.stock !== undefined && Number(p.stock) === 0) return 'soldout';
    return 'active';
  }

  function thumbHtml(p) { return '<span class="thumb">' + SF.visual(p, 'thumb-img') + '</span>'; }

  function pageProducts() {
    var list = store.products || [];
    var head = '<div class="page-head"><div><h1>Products</h1><p>' + list.length + ' product' + (list.length === 1 ? '' : 's') + ' in your catalogue</p></div>' +
      '<div class="page-actions"><a class="btn btn-primary" href="#/admin/products/new">' + icon('plus', 16) + 'Add product</a></div></div>';
    if (!list.length) {
      return head + '<div class="card"><div class="empty"><div class="empty-icon">' + icon('products', 24) + '</div><h3>Add your first product</h3>' +
        '<p>A photo, a name and a price is all it takes. Customers will see it on your store straight away.</p><a class="btn btn-primary" href="#/admin/products/new">' + icon('plus', 16) + 'Add product</a></div></div>';
    }
    var counts = { all: list.length, active: 0, hidden: 0, soldout: 0 };
    list.forEach(function (p) { counts[productStatus(p)]++; });
    var q = productFilter.toLowerCase();
    var shown = list.filter(function (p) {
      if (productTab !== 'all' && productStatus(p) !== productTab) return false;
      return !q || (p.title + ' ' + (p.category || '')).toLowerCase().indexOf(q) >= 0;
    });
    var tabs = [['all', 'All'], ['active', 'Active'], ['soldout', 'Sold out'], ['hidden', 'Hidden']];
    return head + '<div class="card card-flush"><div class="tabs">' + tabs.map(function (t) {
      return '<button class="' + (productTab === t[0] ? 'on' : '') + '" data-action="product-tab" data-v="' + t[0] + '">' + t[1] + '<span>' + counts[t[0]] + '</span></button>';
    }).join('') + '</div>' +
      '<div class="toolbar"><div class="search-input">' + icon('search', 16) + '<input type="search" placeholder="Search products" data-input="product-filter" value="' + esc(productFilter) + '"></div></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th>Status</th><th class="hide-sm">Inventory</th><th class="hide-sm">Category</th><th class="num">Price</th></tr></thead><tbody>' +
      shown.map(function (p) {
        var st = productStatus(p);
        var inv = p.stock == null || p.stock === '' ? '<span style="color:var(--text3)">Not tracked</span>' : Number(p.stock) === 0 ? '<span style="color:var(--red)">0 in stock</span>' : Number(p.stock) <= 5 ? '<span style="color:var(--amber)">' + Number(p.stock) + ' in stock</span>' : Number(p.stock) + ' in stock';
        return '<tr class="clickable" data-action="go" data-href="#/admin/products/edit/' + esc(p.id) + '"><td><div class="prod-cell">' + thumbHtml(p) +
          '<div><b>' + esc(p.title) + '</b>' + (p.sample ? '<small>Sample product</small>' : '') + '</div></div></td>' +
          '<td>' + (st === 'hidden' ? '<span class="pill pill-gray">Hidden</span>' : st === 'soldout' ? '<span class="pill pill-red">Sold out</span>' : '<span class="pill pill-green">Active</span>') + '</td>' +
          '<td class="hide-sm">' + inv + '</td><td class="hide-sm" style="color:var(--text2)">' + esc(p.category || '—') + '</td>' +
          '<td class="num">' + money(p.price) + (Number(p.compareAt) > Number(p.price) ? '<div style="font-size:12px;color:var(--text3);text-decoration:line-through">' + money(p.compareAt) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (!shown.length ? '<div class="empty" style="padding:36px">No products match.</div>' : '') + '</div>';
  }

  var draftImages = null;
  var draftFor = null;

  function pageProductForm(r) {
    var editing = r.a === 'edit' ? r.b : null;
    var p = editing ? (store.products || []).filter(function (x) { return x.id === editing; })[0] : null;
    if (editing && !p) return '<div class="card"><div class="empty"><h3>Product not found</h3><a class="btn btn-secondary" href="#/admin/products">Back to products</a></div></div>';
    p = p || { title: '', description: '', price: '', compareAt: '', stock: '', category: '', images: [], active: true };
    var key = editing || 'new';
    if (draftFor !== key) { draftImages = (p.images || []).slice(); draftFor = key; }
    var cats = [];
    (store.products || []).forEach(function (x) { if (x.category && cats.indexOf(x.category) < 0) cats.push(x.category); });

    return '<div class="page-head"><div><h1>' + (editing ? esc(p.title) : 'Add product') + '</h1></div>' +
      (editing ? '<div class="page-actions"><button class="btn btn-secondary btn-sm" data-action="dup-product" data-id="' + esc(editing) + '">' + icon('copy', 15) + 'Duplicate</button>' +
        '<button class="btn btn-quiet btn-sm" style="color:var(--red)" data-action="del-product" data-id="' + esc(editing) + '">' + icon('trash', 15) + 'Delete</button></div>' : '') + '</div>' +
      '<form data-form="product" data-id="' + esc(editing || '') + '" novalidate><div class="two-col"><div>' +
      '<div class="card"><div class="field"><label for="pf-title">Title</label><input id="pf-title" name="title" required maxlength="120" value="' + esc(p.title) + '" placeholder="e.g. Chocolate truffle cake, 1 kg"></div>' +
      '<div class="field" style="margin-bottom:0"><label for="pf-desc">Description</label><textarea id="pf-desc" name="description" rows="6" placeholder="Size, ingredients, materials, care — anything a customer would ask.">' + esc(p.description || '') + '</textarea></div></div>' +
      '<div class="card"><div class="card-head"><h2>Media</h2><span style="font-size:12.5px;color:var(--text3)">Up to 4 · first is the cover</span></div><div class="img-grid" id="pf-imgs">' + imgTiles() + '</div>' +
      '<span class="help">Tip: shoot in daylight against a plain wall. Portrait photos (4:5) look best.</span></div>' +
      '<div class="card"><h2>Pricing</h2><div class="field-row">' +
      '<div class="field"><label for="pf-price">Price</label><div class="input-prefix"><span>' + esc(store.currency) + '</span><input id="pf-price" name="price" type="number" min="0" step="0.01" inputmode="decimal" required value="' + esc(p.price) + '" placeholder="0"></div></div>' +
      '<div class="field"><label for="pf-cmp">Compare-at price</label><div class="input-prefix"><span>' + esc(store.currency) + '</span><input id="pf-cmp" name="compareAt" type="number" min="0" step="0.01" inputmode="decimal" value="' + esc(p.compareAt == null ? '' : p.compareAt) + '" placeholder="Optional"></div></div>' +
      '</div><span class="help" style="margin-top:-8px">Set a higher compare-at price to show a sale badge and the discount.</span></div></div><div>' +
      '<div class="card"><h2>Status</h2><select name="active"><option value="on"' + (p.active !== false ? ' selected' : '') + '>Active</option><option value="off"' + (p.active === false ? ' selected' : '') + '>Hidden</option></select>' +
      '<span class="help">Hidden products stay saved but don\'t appear in your store.</span></div>' +
      '<div class="card"><h2>Organization</h2><div class="field" style="margin-bottom:0"><label for="pf-cat">Category</label><input id="pf-cat" name="category" list="pf-cats" value="' + esc(p.category || '') + '" placeholder="e.g. Cakes"><datalist id="pf-cats">' +
      cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div></div>' +
      '<div class="card"><h2>Inventory</h2><div class="field" style="margin-bottom:0"><label for="pf-stock">Quantity</label><input id="pf-stock" name="stock" type="number" min="0" step="1" inputmode="numeric" value="' + esc(p.stock == null ? '' : p.stock) + '" placeholder="Leave empty to not track"><span class="help">Shows “Only N left” at 5 or fewer, and “Sold out” at 0.</span></div></div>' +
      '</div></div><div class="save-bar"><span>' + (editing ? 'Edit product' : 'New product') + '</span><a class="btn btn-secondary btn-sm" href="#/admin/products">Discard</a><button class="btn btn-light btn-sm" type="submit">Save</button></div></form>';
  }

  function imgTiles() {
    return draftImages.map(function (src, i) {
      return '<div class="img-tile"><img src="' + esc(src) + '" alt="">' + (i === 0 ? '<span class="cover">Cover</span>' : '') +
        '<button type="button" data-action="rm-img" data-i="' + i + '" aria-label="Remove photo">' + icon('x', 14) + '</button></div>';
    }).join('') + (draftImages.length < 4 ? '<label class="img-add">' + icon('image', 22) + '<span>Add photo</span><input type="file" accept="image/*" multiple data-upload="product"></label>' : '');
  }

  function saveProduct(form) {
    var fd = new FormData(form);
    var title = String(fd.get('title') || '').trim();
    var price = fd.get('price');
    if (!title) { toast('Please add a product title', 'alert'); form.title.focus(); return; }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) { toast('Please add a valid price', 'alert'); form.price.focus(); return; }
    var id = form.getAttribute('data-id');
    var cmp = fd.get('compareAt'), stock = fd.get('stock');
    var data = {
      title: title,
      description: String(fd.get('description') || '').trim(),
      price: Number(price),
      compareAt: cmp === '' ? null : Number(cmp),
      stock: stock === '' ? null : Math.max(0, Math.floor(Number(stock))),
      category: String(fd.get('category') || '').trim(),
      active: fd.get('active') !== 'off',
      images: draftImages.slice()
    };
    if (id) {
      store.products = store.products.map(function (p) {
        if (p.id !== id) return p;
        var n = Object.assign({}, p, data);
        // Tell the platform the owner set this stock level (vs. sales selling it down).
        if (String(p.stock) !== String(data.stock)) n.stockSetAt = Date.now();
        delete n.sample;
        if (data.images.length) delete n.emoji;
        return n;
      });
    } else {
      data.id = uid('p');
      data.stockSetAt = Date.now();
      store.products = (store.products || []).concat([data]);
    }
    if (save()) {
      draftFor = null;
      toast(id ? 'Product saved' : 'Product added');
      location.hash = '#/admin/products';
    }
  }

  // ---------- orders ----------
  var orderTab = 'all', openOrder = null;

  function orderRowHtml(o) {
    var items = o.items.map(function (i) { return i.title + (i.qty > 1 ? ' ×' + i.qty : ''); }).join(', ');
    return '<div class="order-row" data-action="toggle-order" data-id="' + esc(o.id) + '"><div><b>' + esc(o.customer.name) + '</b><small>' + esc(o.id) + ' · ' + fmtDate(o.createdAt) + (o.test ? ' · test' : '') + '</small></div>' +
      '<div class="hide-sm" style="color:var(--text2);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(items) + '</div>' +
      '<div>' + statusPill(o.status) + '</div><div class="amt">' + money(o.total) + '</div></div>';
  }

  function orderDetail(o) {
    var phone = waDigits(o.customer.phone);
    if (phone.length === 10 && store.currency === 'INR') phone = '91' + phone;
    var msg = encodeURIComponent('Hi ' + o.customer.name + ', thank you for your order ' + o.id + ' from ' + store.name + ' (' + money(o.total) + ').');
    return '<div class="order-detail"><div class="order-items">' + o.items.map(function (i) {
      return '<div><span>' + esc(i.title) + ' × ' + i.qty + '</span><span>' + money(i.price * i.qty) + '</span></div>';
    }).join('') +
      '<div style="font-weight:400;color:var(--text2)"><span>Delivery</span><span>' + (o.shipping ? money(o.shipping) : 'Free') + '</span></div>' +
      '<div><span>Total</span><span>' + money(o.total) + '</span></div></div>' +
      '<div class="order-meta"><div><b>Customer</b>' + esc(o.customer.name) + '<br>' + esc(o.customer.phone) + '</div>' +
      '<div><b>Deliver to</b>' + esc(o.customer.address).replace(/\n/g, '<br>') + '</div>' +
      '<div><b>Payment</b>' + esc(({ upi: 'UPI', cod: 'Cash on delivery', confirm: 'To be confirmed' })[o.payment] || o.payment) + (o.customer.note ? '<br><span style="color:var(--text2)">Note: ' + esc(o.customer.note) + '</span>' : '') + '</div></div>' +
      '<div class="order-actions"><select data-input="order-status" data-id="' + esc(o.id) + '" style="width:auto;min-width:150px">' + STATUSES.map(function (s) {
        return '<option value="' + s[0] + '"' + (o.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
      }).join('') + '</select>' +
      (phone ? '<a class="btn btn-secondary btn-sm" target="_blank" rel="noopener" href="https://wa.me/' + phone + '?text=' + msg + '">' + icon('chat', 15) + 'WhatsApp</a>' : '') +
      '<a class="btn btn-secondary btn-sm" href="tel:' + esc(o.customer.phone) + '">' + icon('call', 15) + 'Call</a>' +
      '<button class="btn btn-quiet btn-sm" style="margin-left:auto;color:var(--red)" data-action="del-order" data-id="' + esc(o.id) + '">' + icon('trash', 15) + 'Delete</button></div></div>';
  }

  function pageOrders() {
    var all = store.orders || [];
    var head = '<div class="page-head"><div><h1>Orders</h1><p>' + all.length + ' order' + (all.length === 1 ? '' : 's') + ' · ' + money(orderRevenue(all)) + ' in sales</p></div></div>' +
      (cloud.on
        ? '<div class="callout callout-blue">' + icon('info', 16) + '<span>Orders from your live store appear here automatically. Test orders from the <a class="btn-link" href="preview.html" target="_blank">preview</a> are marked “test”.</span></div>'
        : '<div class="callout callout-blue">' + icon('info', 16) + '<span>Orders from your <b>published</b> store arrive on WhatsApp' + (store.contact.email ? ' or email' : '') +
          '. Test orders you place in the <a class="btn-link" href="preview.html" target="_blank">preview</a> show up here so you can practise.</span></div>');
    if (!all.length) {
      return head + '<div class="card"><div class="empty"><div class="empty-icon">' + icon('orders', 24) + '</div><h3>No orders yet</h3><p>Open your store, add something to the cart and check out to see a test order here.</p>' +
        '<a class="btn btn-primary" href="preview.html" target="_blank">' + icon('external', 15) + 'Open my store</a></div></div>';
    }
    var counts = { all: all.length };
    STATUSES.forEach(function (s) { counts[s[0]] = all.filter(function (o) { return o.status === s[0]; }).length; });
    var list = all.filter(function (o) { return orderTab === 'all' || o.status === orderTab; });
    return head + '<div class="card card-flush"><div class="tabs"><button class="' + (orderTab === 'all' ? 'on' : '') + '" data-action="order-tab" data-v="all">All<span>' + counts.all + '</span></button>' +
      STATUSES.map(function (s) {
        return '<button class="' + (orderTab === s[0] ? 'on' : '') + '" data-action="order-tab" data-v="' + s[0] + '">' + s[1] + '<span>' + counts[s[0]] + '</span></button>';
      }).join('') + '</div>' +
      (list.length ? list.map(function (o) { return orderRowHtml(o) + (openOrder === o.id ? orderDetail(o) : ''); }).join('') : '<div class="empty" style="padding:36px">No orders with this status.</div>') + '</div>';
  }

  // ---------- design (online store) — the visual editor ----------
  // Everything about the storefront is data (see sections.js). The panel on
  // the left edits that data through a generic, schema-driven form; the
  // preview on the right re-renders live and lets owners click to select.
  var device = 'desktop';
  var saveTimer;
  var ed = { tab: 'sections', page: 'home', sel: null, adding: false, openItem: null, history: [], future: [], snapTimer: 0, lastSnap: '' };

  function scheduleSave() {
    clearTimeout(saveTimer);
    var st = app.querySelector('.stage-status span');
    if (st) st.textContent = 'Saving…';
    saveTimer = setTimeout(function () {
      store.flags.designed = true;
      save();
      if (st) st.textContent = 'All changes saved';
    }, 350);
    pushPreview();
    snapshot();
  }

  // Undo/redo: snapshots of the store's design (never orders).
  function designState() {
    return JSON.stringify({ theme: store.theme, header: store.header, footer: store.footer, brand: store.brand, logo: store.logo, pages: store.pages, announcement: store.announcement });
  }
  function snapshot() {
    clearTimeout(ed.snapTimer);
    ed.snapTimer = setTimeout(function () {
      var cur = designState();
      if (cur === ed.lastSnap) return;
      if (ed.lastSnap) { ed.history.push(ed.lastSnap); if (ed.history.length > 40) ed.history.shift(); }
      ed.lastSnap = cur;
      ed.future = [];
      updateUndoButtons();
    }, 500);
  }
  function restore(json) {
    var d = JSON.parse(json);
    Object.keys(d).forEach(function (k) { store[k] = d[k]; });
    ed.lastSnap = json;
    if (!pageById(ed.page)) ed.page = 'home';
    if (ed.sel && ed.sel !== 'header' && ed.sel !== 'footer' && !findSection(ed.sel)) ed.sel = null;
    save();
    pushPreview();
    renderPanel();
    updateUndoButtons();
  }
  function undo() { if (!ed.history.length) return; ed.future.push(designState()); restore(ed.history.pop()); }
  function redo() { if (!ed.future.length) return; ed.history.push(designState()); restore(ed.future.pop()); }
  function updateUndoButtons() {
    var u = app.querySelector('[data-action="ed-undo"]'), r = app.querySelector('[data-action="ed-redo"]');
    if (u) u.disabled = !ed.history.length;
    if (r) r.disabled = !ed.future.length;
  }

  function pageById(id) { return (store.pages || []).filter(function (p) { return p.id === id; })[0]; }
  function pageIndex(id) { return (store.pages || []).map(function (p) { return p.id; }).indexOf(id); }
  function findSection(id) {
    var out = null;
    (store.pages || []).forEach(function (p, pi) {
      p.sections.forEach(function (s, si) { if (s.id === id) out = { page: p, pi: pi, sec: s, si: si }; });
    });
    return out;
  }

  function sendPreview(msg) {
    Array.prototype.forEach.call(app.querySelectorAll('iframe.live-preview'), function (f) {
      if (f.contentWindow) f.contentWindow.postMessage(msg, location.origin);
    });
  }
  function selectSection(id, fromPreview) {
    ed.sel = id; ed.adding = false; ed.openItem = null; ed.tab = 'sections';
    var f = id && findSection(id);
    if (f) ed.page = f.page.id;
    renderPanel();
    if (!fromPreview) sendPreview({ type: 'sahaay-highlight', id: id });
  }

  // ----- generic field rendering -----
  function fieldVisible(f, obj) { return !f.show || f.show(obj || {}); }

  function fieldHtml(f, obj, path) {
    var v = obj ? obj[f.k] : undefined;
    var p = path ? path + '.' + f.k : f.k;
    var help = f.help ? '<span class="help">' + esc(f.help) + '</span>' : '';
    var label = f.label ? '<label class="field-label">' + esc(f.label) + '</label>' : '';
    switch (f.t) {
      case 'text':
        return '<div class="field">' + label + '<input data-edit="' + p + '" value="' + esc(v == null ? '' : v) + '" placeholder="' + esc(f.ph || '') + '">' + help + '</div>';
      case 'textarea':
        return '<div class="field">' + label + '<textarea data-edit="' + p + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '">' + esc(v || '') + '</textarea>' + help + '</div>';
      case 'range':
        return '<div class="field"><div class="range-head">' + label + '<span data-range-out="' + p + '">' + esc(v) + (f.unit || '') + '</span></div>' +
          '<input type="range" data-edit="' + p + '" data-kind="number" min="' + f.min + '" max="' + f.max + '" step="' + (f.step || 1) + '" value="' + esc(v) + '">' + help + '</div>';
      case 'toggle':
        return '<div class="switch-row"><div><b>' + esc(f.label) + '</b>' + (f.help ? '<small>' + esc(f.help) + '</small>' : '') + '</div><label class="switch"><input type="checkbox" data-edit="' + p + '" data-kind="bool" data-rerender="1"' + (v ? ' checked' : '') + '><span></span></label></div>';
      case 'seg':
        return '<div class="field">' + label + '<div class="seg">' + f.opts.map(function (o) {
          return '<button type="button" class="' + (String(v) === String(o[0]) ? 'on' : '') + '" data-action="ed-set" data-path="' + p + '" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>' + help + '</div>';
      case 'scheme':
        return '<div class="field">' + label + '<div class="scheme-row">' + SS.SCHEMES.map(function (o) {
          return '<button type="button" class="scheme-opt scheme-' + o[0] + (String(v || 'default') === o[0] ? ' on' : '') + '" data-action="ed-set" data-path="' + p + '" data-v="' + o[0] + '" style="--p:' + esc(store.theme.primary) + ';--bg:' + esc(store.theme.colors.bg) + ';--sf:' + esc(store.theme.colors.surface) + '"><i></i>' + o[1] + '</button>';
        }).join('') + '</div></div>';
      case 'color':
        return '<div class="color-field"><span>' + esc(f.label) + '</span><div><input type="color" data-edit="' + p + '" value="' + esc(v || '#000000') + '"><input class="hex" data-edit="' + p + '" data-kind="hex" value="' + esc(v || '') + '" maxlength="7"></div></div>';
      case 'select':
        return '<div class="field">' + label + '<select data-edit="' + p + '" data-rerender="1">' + f.opts.map(function (o) {
          return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>' + help + '</div>';
      case 'font':
        return '<div class="field">' + label + '<select data-edit="' + p + '" class="font-select">' + Object.keys(SS.FONTS).map(function (k) {
          return '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + SS.FONTS[k][0] + ' · ' + SS.FONTS[k][3] + '</option>';
        }).join('') + '</select></div>';
      case 'category': {
        var cats = [];
        store.products.forEach(function (x) { if (x.category && cats.indexOf(x.category) < 0) cats.push(x.category); });
        return fieldHtml({ k: f.k, t: 'select', label: f.label, opts: [['', 'Choose a category']].concat(cats.map(function (c) { return [c, c]; })) }, obj, path);
      }
      case 'icon':
        return fieldHtml({ k: f.k, t: 'select', label: f.label, opts: SS.ICONS }, obj, path);
      case 'link': {
        var opts = SS.linkOptions(store);
        var isUrl = String(v || '').indexOf('url:') === 0;
        return '<div class="field">' + label + '<select data-edit="' + p + '" data-rerender="1">' + opts.map(function (o) {
          var sel = isUrl ? o[0] === 'url:' : String(v) === o[0];
          return '<option value="' + esc(o[0]) + '"' + (sel ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>' +
          (isUrl ? '<input style="margin-top:6px" data-edit="' + p + '" data-kind="url" value="' + esc(String(v).slice(4)) + '" placeholder="https://…">' : '') + '</div>';
      }
      case 'image':
        return '<div class="field">' + label + '<div class="img-field' + (f.round ? ' round' : '') + '">' +
          (v ? '<img src="' + esc(v) + '" alt="">' : '<span class="img-empty">' + icon('image', 20) + '</span>') +
          '<div class="img-field-actions"><label class="btn btn-secondary btn-sm">' + (v ? 'Replace' : 'Upload') + '<input type="file" accept="image/*" data-upload="ed-image" data-path="' + p + '" hidden></label>' +
          (v ? '<button class="btn-link danger" data-action="ed-set" data-path="' + p + '" data-v="">Remove</button>' : '') + '</div></div>' + help + '</div>';
      case 'list': {
        var items = Array.isArray(v) ? v : [];
        return '<div class="field"><div class="range-head">' + label + '<span>' + items.length + (f.max ? ' / ' + f.max : '') + '</span></div>' +
          (f.help ? '<span class="help" style="margin:-2px 0 8px">' + esc(f.help) + '</span>' : '') +
          '<div class="list-items">' + items.map(function (it, i) {
            var ip = p + '.' + i;
            var open = ed.openItem === ip;
            return '<div class="list-item' + (open ? ' open' : '') + '"><div class="list-item-head" data-action="ed-item-toggle" data-path="' + ip + '">' +
              '<span>' + esc(f.title ? f.title(it, i) : 'Item ' + (i + 1)) + '</span>' +
              '<button class="icon-btn" data-action="ed-list-move" data-path="' + p + '" data-i="' + i + '" data-d="-1" title="Move up"' + (i === 0 ? ' disabled' : '') + '>' + icon('up', 14) + '</button>' +
              '<button class="icon-btn" data-action="ed-list-move" data-path="' + p + '" data-i="' + i + '" data-d="1" title="Move down"' + (i === items.length - 1 ? ' disabled' : '') + '>' + icon('down', 14) + '</button>' +
              '<button class="icon-btn" data-action="ed-list-rm" data-path="' + p + '" data-i="' + i + '" title="Remove">' + icon('trash', 14) + '</button></div>' +
              (open ? '<div class="list-item-body">' + f.item.map(function (sf) { return fieldHtml(sf, it, ip); }).join('') + '</div>' : '') + '</div>';
          }).join('') + '</div>' +
          (!f.max || items.length < f.max ? '<button class="btn btn-secondary btn-sm btn-block" data-action="ed-list-add" data-path="' + p + '" data-field="' + esc(f.k) + '">' + icon('plus', 14) + esc(f.add || 'Add item') + '</button>' : '') + '</div>';
      }
    }
    return '';
  }

  function fieldsHtml(fields, obj, path) {
    return fields.filter(function (f) { return fieldVisible(f, obj); }).map(function (f) { return fieldHtml(f, obj, path); }).join('');
  }

  function getPath(path) {
    var parts = path.split('.'), o = store;
    for (var i = 0; i < parts.length; i++) { if (o == null) return undefined; o = o[parts[i]]; }
    return o;
  }

  // ----- panel views -----
  function sectionIcon(type) {
    var map = { hero: 'image', features: 'badge', products: 'grid', imageText: 'columns', richText: 'text', owner: 'user', testimonials: 'quote', gallery: 'gallery', faq: 'help', video: 'play', cta: 'megaphone', contact: 'pin' };
    return icon(map[type] || 'layers', 16);
  }

  function viewSectionList() {
    var page = pageById(ed.page) || store.pages[0];
    var pi = pageIndex(page.id);
    var pageSel = store.pages.length > 1 ? '<div class="field" style="margin-bottom:12px"><select data-action-change="ed-page">' + store.pages.map(function (p) {
      return '<option value="' + esc(p.id) + '"' + (p.id === page.id ? ' selected' : '') + '>' + esc(p.title) + '</option>';
    }).join('') + '</select></div>' : '';
    var rows = page.sections.map(function (s, i) {
      return '<div class="ed-row' + (s.hidden ? ' is-hidden' : '') + '" data-action="ed-select" data-id="' + esc(s.id) + '">' + sectionIcon(s.type) +
        '<span class="ed-row-label">' + esc(SS.sectionName(s)) + '</span>' +
        '<span class="ed-row-actions">' +
        '<button class="icon-btn" data-action="ed-move" data-pi="' + pi + '" data-i="' + i + '" data-d="-1" title="Move up"' + (i === 0 ? ' disabled' : '') + '>' + icon('up', 14) + '</button>' +
        '<button class="icon-btn" data-action="ed-move" data-pi="' + pi + '" data-i="' + i + '" data-d="1" title="Move down"' + (i === page.sections.length - 1 ? ' disabled' : '') + '>' + icon('down', 14) + '</button>' +
        '<button class="icon-btn" data-action="ed-hide" data-pi="' + pi + '" data-i="' + i + '" title="' + (s.hidden ? 'Show' : 'Hide') + '">' + icon(s.hidden ? 'eyeoff' : 'eye', 14) + '</button>' +
        '</span></div>';
    }).join('');
    var add = ed.adding
      ? '<div class="ed-add"><div class="ed-add-head"><b>Add a section</b><button class="icon-btn" data-action="ed-add-cancel">' + icon('x', 16) + '</button></div>' +
        Object.keys(SS.TYPES).map(function (k) {
          var T = SS.TYPES[k];
          return '<button class="ed-type" data-action="ed-add" data-type="' + k + '">' + sectionIcon(k) + '<span><b>' + esc(T.label) + '</b><small>' + esc(T.desc) + '</small></span></button>';
        }).join('') + '</div>'
      : '<button class="btn btn-secondary btn-block" data-action="ed-add-open">' + icon('plus', 15) + 'Add section</button>';
    return pageSel +
      '<div class="ed-group-label">Header</div><div class="ed-row" data-action="ed-select" data-id="header">' + icon('header', 16) + '<span class="ed-row-label">Header, logo & menu</span>' + icon('chevron', 14) + '</div>' +
      '<div class="ed-group-label">' + esc(page.title) + ' sections</div><div class="ed-rows">' + rows + '</div>' + add +
      '<div class="ed-group-label">Footer</div><div class="ed-row" data-action="ed-select" data-id="footer">' + icon('footer', 16) + '<span class="ed-row-label">Footer</span>' + icon('chevron', 14) + '</div>';
  }

  function viewSection(id) {
    var f = findSection(id);
    if (!f) { ed.sel = null; return viewSectionList(); }
    var T = SS.TYPES[f.sec.type];
    var path = 'pages.' + f.pi + '.sections.' + f.si + '.settings';
    return '<div class="ed-back"><button class="icon-btn" data-action="ed-back">' + icon('back', 18) + '</button><div><b>' + esc(T.label) + '</b><small>' + esc(f.page.title) + ' page</small></div></div>' +
      fieldsHtml(T.fields, f.sec.settings, path) +
      '<div class="ed-sec-actions"><button class="btn btn-secondary btn-sm" data-action="ed-hide" data-pi="' + f.pi + '" data-i="' + f.si + '">' + icon(f.sec.hidden ? 'eye' : 'eyeoff', 14) + (f.sec.hidden ? 'Show section' : 'Hide section') + '</button>' +
      '<button class="btn btn-secondary btn-sm" data-action="ed-dup" data-pi="' + f.pi + '" data-i="' + f.si + '">' + icon('copy', 14) + 'Duplicate</button>' +
      '<button class="btn btn-quiet btn-sm" style="color:var(--red)" data-action="ed-del" data-pi="' + f.pi + '" data-i="' + f.si + '">' + icon('trash', 14) + 'Delete</button></div>';
  }

  var HEADER_FIELDS = [
    { k: 'type', t: 'seg', label: 'Logo', opts: [['wordmark', 'Text logo'], ['image', 'Image']] },
    { k: 'text', t: 'text', label: 'Logo text', show: function (b) { return b.type !== 'image'; } },
    { k: 'mark', t: 'seg', label: 'Monogram', opts: [['none', 'None'], ['circle', 'Circle'], ['square', 'Square']], show: function (b) { return b.type !== 'image'; } },
    { k: 'size', t: 'seg', label: 'Logo size', opts: [['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']] }
  ];
  var MENU_FIELDS = [
    { k: 'layout', t: 'seg', label: 'Layout', opts: [['left', 'Logo left'], ['center', 'Logo centred']] },
    { k: 'sticky', t: 'toggle', label: 'Stick to the top when scrolling' },
    { k: 'showSearch', t: 'toggle', label: 'Show search button' },
    { k: 'autoCategories', t: 'toggle', label: 'Add product categories to the menu' },
    { k: 'menu', t: 'list', label: 'Menu links', add: 'Add link', max: 8, title: function (it) { return it.label || 'Link'; },
      item: [{ k: 'label', t: 'text', label: 'Label' }, { k: 'link', t: 'link', label: 'Goes to' }], blank: { label: 'New link', link: 'products' } }
  ];

  function viewHeader() {
    var b = store.brand;
    return '<div class="ed-back"><button class="icon-btn" data-action="ed-back">' + icon('back', 18) + '</button><div><b>Header</b><small>Logo, menu and announcement</small></div></div>' +
      '<div class="ed-card"><h3>Logo</h3>' + fieldsHtml(HEADER_FIELDS, b, 'brand') +
      (b.type === 'image' ? fieldHtml({ k: 'logo', t: 'image', label: 'Logo image', help: 'A PNG with a transparent background looks best.' }, store, '') : '') + '</div>' +
      '<div class="ed-card"><h3>Announcement bar</h3>' + fieldHtml({ k: 'announcement', t: 'text', label: '', ph: 'e.g. Free delivery on orders over ₹999', help: 'Leave empty to hide.' }, store, '') + '</div>' +
      '<div class="ed-card"><h3>Navigation</h3>' + fieldsHtml(MENU_FIELDS, store.header, 'header') + '</div>';
  }

  function viewFooter() {
    return '<div class="ed-back"><button class="icon-btn" data-action="ed-back">' + icon('back', 18) + '</button><div><b>Footer</b><small>Bottom of every page</small></div></div>' +
      '<div class="ed-card">' + fieldsHtml([
        { k: 'text', t: 'textarea', label: 'Short description', rows: 3 },
        { k: 'showPowered', t: 'toggle', label: 'Show “Powered by Sahaay Stores”' }
      ], store.footer, 'footer') + '</div>' +
      '<div class="ed-card"><h3>Social links</h3>' + fieldsHtml([
        { k: 'instagram', t: 'text', label: 'Instagram', ph: '@yourshop' },
        { k: 'facebook', t: 'text', label: 'Facebook', ph: 'Page name or link' },
        { k: 'youtube', t: 'text', label: 'YouTube', ph: '@channel or link' }
      ], store.footer.social, 'footer.social') + '</div>' +
      '<p class="help">Your address, phone and WhatsApp come from <a class="btn-link" href="#/admin/settings">Settings</a>. Pages you create are listed in the footer automatically.</p>';
  }

  function viewStyle() {
    var t = store.theme;
    return '<div class="ed-card"><h3>Style presets</h3><p class="help" style="margin:-4px 0 12px">Applies a complete look. You can fine-tune everything below.</p><div class="style-cards">' +
      Object.keys(SS.STYLES).map(function (k) {
        var S = SS.STYLES[k];
        return '<button class="style-card' + (t.style === k ? ' on' : '') + '" data-action="ed-style" data-v="' + k + '" style="--bg:' + S.colors.bg + ';--tx:' + S.colors.text + ';--sf:' + S.colors.surface + ';--p:' + S.primary + ';--hf:' + SS.FONTS[S.fonts.heading][1].replace(/"/g, '') + ';--r:' + Math.min(S.radius, 10) + 'px">' +
          '<span class="sc-preview"><i>Aa</i><b></b></span><span class="sc-name">' + S.label + '</span><small>' + S.desc + '</small></button>';
      }).join('') + '</div></div>' +
      '<div class="ed-card"><h3>Colours</h3>' +
      fieldHtml({ k: 'primary', t: 'color', label: 'Brand / buttons' }, t, 'theme') +
      fieldsHtml([
        { k: 'bg', t: 'color', label: 'Background' }, { k: 'surface', t: 'color', label: 'Tinted background' },
        { k: 'text', t: 'color', label: 'Text' }, { k: 'muted', t: 'color', label: 'Secondary text' }, { k: 'border', t: 'color', label: 'Lines & borders' }
      ], t.colors, 'theme.colors') + '<div class="swatches" style="margin-top:10px">' + COLORS.map(function (c) {
        return '<button type="button" class="swatch' + (String(t.primary).toLowerCase() === c.toLowerCase() ? ' on' : '') + '" style="background:' + c + '" data-action="ed-set" data-path="theme.primary" data-v="' + c + '" aria-label="Brand colour ' + c + '"></button>';
      }).join('') + '</div></div>' +
      '<div class="ed-card"><h3>Typography</h3>' +
      fieldsHtml([
        { k: 'heading', t: 'font', label: 'Headings' }, { k: 'body', t: 'font', label: 'Body text' }
      ], t.fonts, 'theme.fonts') +
      fieldsHtml([
        { k: 'headingWeight', t: 'seg', label: 'Heading weight', opts: [['400', 'Light'], ['500', 'Regular'], ['600', 'Medium'], ['700', 'Bold']] },
        { k: 'headingCase', t: 'seg', label: 'Heading style', opts: [['none', 'Normal'], ['uppercase', 'UPPERCASE']] },
        { k: 'buttonCase', t: 'seg', label: 'Button text', opts: [['none', 'Normal'], ['uppercase', 'UPPERCASE']] }
      ], t, 'theme') + '</div>' +
      '<div class="ed-card"><h3>Shape & spacing</h3>' + fieldsHtml([
        { k: 'radius', t: 'range', label: 'Corner roundness', min: 0, max: 28, unit: 'px' },
        { k: 'buttonShape', t: 'seg', label: 'Buttons', opts: [['square', 'Square'], ['rounded', 'Rounded'], ['pill', 'Pill']] },
        { k: 'density', t: 'seg', label: 'Spacing between sections', opts: [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['spacious', 'Spacious']] }
      ], t, 'theme') + '</div>' +
      '<div class="ed-card"><h3>Product cards</h3>' + fieldsHtml([
        { k: 'ratio', t: 'seg', label: 'Photo shape', opts: [['1/1', 'Square'], ['4/5', 'Portrait'], ['3/4', 'Tall'], ['4/3', 'Wide']] },
        { k: 'align', t: 'seg', label: 'Text alignment', opts: [['left', 'Left'], ['center', 'Center']] },
        { k: 'quickAdd', t: 'toggle', label: 'Quick “Add” button on cards' },
        { k: 'showCategory', t: 'toggle', label: 'Show category above the name' }
      ], t.card, 'theme.card') + '</div>' +
      '<div class="ed-card"><h3>On phones</h3>' + fieldsHtml([
        { k: 'bottomNav', t: 'toggle', label: 'Bottom navigation bar', help: 'App-style tabs for Home, Shop, Search, Cart and Chat' },
        { k: 'stickyBuy', t: 'toggle', label: 'Sticky “Add to cart” bar', help: 'Keeps the buy button in reach on product pages' },
        { k: 'columns', t: 'seg', label: 'Products per row', opts: [['1', 'One (large)'], ['2', 'Two (grid)']] }
      ], t.mobile, 'theme.mobile') + '</div>';
  }

  function viewPages() {
    return '<div class="ed-card"><h3>Your pages</h3><div class="ed-rows">' + store.pages.map(function (p, i) {
      return '<div class="ed-row" data-action="ed-open-page" data-id="' + esc(p.id) + '">' + icon('pages', 16) + '<span class="ed-row-label">' + esc(p.title) + (i === 0 ? ' <small>· home</small>' : '') + '</span>' +
        '<span class="ed-row-actions">' + (i ? '<button class="icon-btn" data-action="ed-page-del" data-id="' + esc(p.id) + '" title="Delete page">' + icon('trash', 14) + '</button>' : '') + icon('chevron', 14) + '</span></div>' +
        (i ? '<div class="ed-page-meta"><input data-edit="pages.' + i + '.title" value="' + esc(p.title) + '" aria-label="Page title"><span class="help">/p/' + esc(p.slug) + '</span></div>' : '');
    }).join('') + '</div></div>' +
      '<div class="ed-card"><h3>Add a page</h3><div class="page-templates">' + [
        ['about', 'About us', 'Your story and the people behind it'], ['contact', 'Contact', 'Ways to reach you, plus FAQs'],
        ['shipping', 'Shipping & returns', 'Delivery times, charges and returns'], ['privacy', 'Privacy policy', 'How you handle customer details'],
        ['terms', 'Terms of service', 'The rules for buying from you'], ['blank', 'Blank page', 'Start from scratch']
      ].map(function (t) {
        return '<button class="ed-type" data-action="ed-page-add" data-v="' + t[0] + '">' + icon('pages', 16) + '<span><b>' + t[1] + '</b><small>' + t[2] + '</small></span></button>';
      }).join('') + '</div><p class="help">Pages appear in your footer. Add them to the menu from Header → Navigation.</p></div>';
  }

  function viewAdvanced() {
    return '<div class="ed-card"><h3>Custom CSS</h3><p class="help" style="margin:-4px 0 10px">For complete control. Styles apply to your whole store. Classes start with <span class="kbd">.sf-</span>, e.g. <span class="kbd">.sf-hero-title</span>.</p>' +
      '<textarea class="code" data-edit="theme.customCss" rows="14" spellcheck="false" placeholder=".sf-hero-title { letter-spacing: -0.04em; }">' + esc(store.theme.customCss || '') + '</textarea></div>' +
      '<div class="ed-card"><h3>Start over</h3><p class="help" style="margin:-4px 0 10px">Re-apply your current style preset to colours, fonts and shapes. Your sections and content stay.</p>' +
      '<button class="btn btn-secondary btn-sm" data-action="ed-style" data-v="' + esc(store.theme.style || 'modern') + '">Reset styles</button></div>';
  }

  function panelHtml() {
    var body;
    if (ed.tab === 'sections') {
      body = ed.sel === 'header' ? viewHeader() : ed.sel === 'footer' ? viewFooter() : ed.sel ? viewSection(ed.sel) : viewSectionList();
    } else if (ed.tab === 'style') body = viewStyle();
    else if (ed.tab === 'pages') body = viewPages();
    else body = viewAdvanced();
    return '<div class="ed-tabs">' + [['sections', 'Sections'], ['style', 'Style'], ['pages', 'Pages'], ['advanced', 'Advanced']].map(function (t) {
      return '<button class="' + (ed.tab === t[0] ? 'on' : '') + '" data-action="ed-tab" data-v="' + t[0] + '">' + t[1] + '</button>';
    }).join('') + '</div><div class="ed-body">' + body + '</div>';
  }

  function renderPanel() {
    var el = app.querySelector('.design-panel');
    if (!el) return;
    var scroll = el.scrollTop;
    el.innerHTML = panelHtml();
    el.scrollTop = scroll;
  }

  function pageDesign() {
    if (!pageById(ed.page)) ed.page = 'home';
    if (!ed.lastSnap) ed.lastSnap = designState();
    var frame = device === 'desktop' ? deviceFrame('desktop', 'preview.html?embed=1&edit=1', { live: true, interactive: true, h: 900 })
      : deviceFrame(device, 'preview.html?embed=1&edit=1', { live: true, interactive: true });
    return '<div class="design"><div class="design-panel">' + panelHtml() + '</div>' +
      '<div class="design-stage"><div class="stage-bar"><div class="seg">' +
      [['desktop', 'Desktop'], ['tablet', 'Tablet'], ['phone', 'Phone']].map(function (d) {
        return '<button class="' + (device === d[0] ? 'on' : '') + '" data-action="device" data-v="' + d[0] + '">' + icon(d[0], 15) + '<span class="hide-sm">' + d[1] + '</span></button>';
      }).join('') + '</div>' +
      '<button class="icon-btn" data-action="ed-undo" title="Undo"' + (ed.history.length ? '' : ' disabled') + '>' + icon('undo', 16) + '</button>' +
      '<button class="icon-btn" data-action="ed-redo" title="Redo"' + (ed.future.length ? '' : ' disabled') + '>' + icon('redo', 16) + '</button>' +
      '<div class="stage-status"><i></i><span>All changes saved</span></div></div>' +
      '<p class="stage-hint">' + icon('info', 14) + 'Click anything in the preview to edit it.</p>' +
      '<div class="stage"><div style="width:100%;display:flex;justify-content:center">' + frame + '</div></div></div></div>';
  }

  // Receives section clicks from the preview.
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'sahaay-select') return;
    if (route().sub !== 'design') return;
    selectSection(e.data.id, true);
  });

  function edAction(a, t, event) {
    var pi = Number(t.getAttribute('data-pi')), i = Number(t.getAttribute('data-i'));
    switch (a) {
      case 'ed-tab': ed.tab = t.getAttribute('data-v'); ed.adding = false; renderPanel(); return true;
      case 'ed-select': selectSection(t.getAttribute('data-id')); return true;
      case 'ed-back': ed.sel = null; ed.openItem = null; renderPanel(); sendPreview({ type: 'sahaay-highlight', id: null }); return true;
      case 'ed-add-open': ed.adding = true; renderPanel(); return true;
      case 'ed-add-cancel': ed.adding = false; renderPanel(); return true;
      case 'ed-add': {
        var page = pageById(ed.page);
        var s = SS.newSection(t.getAttribute('data-type'));
        page.sections.push(s);
        scheduleSave();
        selectSection(s.id);
        setTimeout(function () { sendPreview({ type: 'sahaay-highlight', id: s.id }); }, 250);
        return true;
      }
      case 'ed-move': {
        var list = store.pages[pi].sections, j = i + Number(t.getAttribute('data-d'));
        if (j < 0 || j >= list.length) return true;
        list.splice(j, 0, list.splice(i, 1)[0]);
        scheduleSave(); renderPanel(); return true;
      }
      case 'ed-hide': store.pages[pi].sections[i].hidden = !store.pages[pi].sections[i].hidden; scheduleSave(); renderPanel(); return true;
      case 'ed-dup': {
        var copy = JSON.parse(JSON.stringify(store.pages[pi].sections[i]));
        copy.id = SS.uid();
        store.pages[pi].sections.splice(i + 1, 0, copy);
        scheduleSave(); selectSection(copy.id); return true;
      }
      case 'ed-del':
        if (!confirm('Delete this section?')) return true;
        store.pages[pi].sections.splice(i, 1);
        ed.sel = null; scheduleSave(); renderPanel(); return true;
      case 'ed-set': {
        var path = t.getAttribute('data-path'), v = t.getAttribute('data-v');
        var curV = getPath(path);
        if (typeof curV === 'number' || /headingWeight$/.test(path)) v = Number(v);
        if (/mobile\.columns$/.test(path)) v = Number(v);
        setPath(path, v);
        scheduleSave(); renderPanel(); return true;
      }
      case 'ed-style':
        if (!confirm('Apply the ' + SS.STYLES[t.getAttribute('data-v')].label + ' style? Colours, fonts and shapes will change. Your content stays.')) return true;
        SS.applyStyle(store.theme, t.getAttribute('data-v'));
        store.theme.buttonCase = store.theme.headingCase === 'uppercase' ? 'uppercase' : 'none';
        scheduleSave(); renderPanel(); return true;
      case 'ed-item-toggle': {
        if (t !== event.target && event.target.closest('button')) return true;
        var ip = t.getAttribute('data-path');
        ed.openItem = ed.openItem === ip ? null : ip; renderPanel(); return true;
      }
      case 'ed-list-add': {
        var lp = t.getAttribute('data-path');
        var arr = getPath(lp);
        if (!Array.isArray(arr)) { setPath(lp, []); arr = getPath(lp); }
        var def = listFieldDef(lp);
        arr.push(JSON.parse(JSON.stringify(def && def.blank ? def.blank : {})));
        ed.openItem = lp + '.' + (arr.length - 1);
        scheduleSave(); renderPanel(); return true;
      }
      case 'ed-list-rm': {
        var rp = getPath(t.getAttribute('data-path'));
        rp.splice(i, 1); ed.openItem = null; scheduleSave(); renderPanel(); return true;
      }
      case 'ed-list-move': {
        var mp = getPath(t.getAttribute('data-path')), k = i + Number(t.getAttribute('data-d'));
        if (k < 0 || k >= mp.length) return true;
        mp.splice(k, 0, mp.splice(i, 1)[0]); ed.openItem = null; scheduleSave(); renderPanel(); return true;
      }
      case 'ed-open-page': {
        if (event.target.closest('[data-action="ed-page-del"]')) return true;
        ed.page = t.getAttribute('data-id'); ed.tab = 'sections'; ed.sel = null; renderPanel();
        sendPreview({ type: 'sahaay-page', id: ed.page }); return true;
      }
      case 'ed-page-add': {
        var tpl = SS.PAGE_TEMPLATES[t.getAttribute('data-v')];
        var title = tpl.title, base = slug(title), sl = base, n = 2;
        while (store.pages.some(function (p) { return p.slug === sl; })) sl = base + '-' + n++;
        var pg = { id: 'pg' + SS.uid(), title: title, slug: sl, sections: tpl.sections(store) };
        store.pages.push(pg);
        ed.page = pg.id; ed.tab = 'sections'; ed.sel = null;
        scheduleSave(); renderPanel();
        setTimeout(function () { sendPreview({ type: 'sahaay-page', id: pg.id }); }, 300);
        toast('Page added. Add it to your menu from Header → Navigation.');
        return true;
      }
      case 'ed-page-del': {
        var id = t.getAttribute('data-id');
        if (!confirm('Delete this page?')) return true;
        store.pages = store.pages.filter(function (p) { return p.id !== id; });
        store.header.menu = store.header.menu.filter(function (m) { return m.link !== 'page:' + id; });
        if (ed.page === id) ed.page = 'home';
        scheduleSave(); renderPanel(); return true;
      }
      case 'ed-undo': undo(); return true;
      case 'ed-redo': redo(); return true;
    }
    return false;
  }

  // Finds the list field definition for a path like pages.0.sections.2.settings.items
  function listFieldDef(path) {
    var key = path.split('.').pop();
    if (path === 'header.menu') return MENU_FIELDS.filter(function (f) { return f.k === 'menu'; })[0];
    var m = path.match(/^pages\.(\d+)\.sections\.(\d+)\.settings\./);
    if (m) {
      var sec = store.pages[+m[1]].sections[+m[2]];
      return SS.TYPES[sec.type].fields.filter(function (f) { return f.k === key; })[0];
    }
    return null;
  }

  // Input/change from the editor panel.
  function edInput(t, isChange) {
    var path = t.getAttribute('data-edit');
    if (!path) return false;
    var kind = t.getAttribute('data-kind');
    var v = t.type === 'checkbox' ? t.checked : t.value;
    if (kind === 'number') v = Number(v);
    if (kind === 'url') v = 'url:' + String(v).trim();
    if (kind === 'hex') { if (!/^#[0-9a-f]{6}$/i.test(v)) return true; }
    if (t.tagName === 'SELECT' && t.value === 'url:' && String(getPath(path) || '').indexOf('url:') === 0) return true;
    setPath(path, v);
    if (/\.title$/.test(path) && /^pages\.\d+\.title$/.test(path)) {
      var pgs = store.pages[+path.split('.')[1]];
      if (pgs && pgs.id !== 'home') { /* keep the address stable once created */ }
    }
    var out = app.querySelector('[data-range-out="' + path + '"]');
    if (out) out.textContent = v + (out.textContent.replace(/^[\d.]+/, '').trim() || '');
    if (t.type === 'color') { var hex = t.parentNode.querySelector('.hex'); if (hex) hex.value = v; }
    if (kind === 'hex') { var col = t.parentNode.querySelector('input[type=color]'); if (col) col.value = v; }
    scheduleSave();
    if (isChange && (t.hasAttribute('data-rerender') || t.tagName === 'SELECT')) renderPanel();
    return true;
  }

  function switchRow(bind, label, help, checked) {
    return '<div class="switch-row"><div><b>' + label + '</b><small>' + help + '</small></div><label class="switch"><input type="checkbox" data-bind-bool="' + bind + '"' + (checked ? ' checked' : '') + '><span></span></label></div>';
  }

  function setPath(path, val) {
    var parts = path.split('.'), o = store;
    for (var i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null) o[parts[i]] = {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = val;
  }

  // ---------- mobile app ----------
  var appView = 'home';

  function iconInner(fill) {
    if (store.app.icon) return '<img src="' + esc(store.app.icon) + '" alt="" style="width:100%;height:100%;border-radius:inherit;object-fit:cover">';
    if (hasImageLogo(store)) return '<img src="' + esc(store.logo) + '" alt="" style="width:' + (fill ? '100%' : '62%') + ';height:' + (fill ? '100%' : '62%') + ';object-fit:contain">';
    return '<span style="font-family:' + esc(headingFont(store)) + ';font-size:' + (fill ? '38px' : '16px') + ';color:' + SF.onColor(store.app.bg || store.theme.primary) + '">' + esc(monogram(store)) + '</span>';
  }

  function homeScreenMock() {
    var others = [['#E9E4DC', ''], ['#DDE7F2', ''], ['#E4EFE3', ''], ['#F3E3E6', ''], ['#EFE9DD', ''], ['#E2E0F0', '']];
    return '<div class="mock-phone"><div class="phone-notch"></div><div class="homescreen"><div class="hs"><div class="hs-time">9:41</div><div class="hs-grid">' +
      others.map(function (o) { return '<span style="background:' + o[0] + '">' + o[1] + '</span>'; }).join('') +
      '<span class="hs-app" style="background:' + esc(store.app.bg || store.theme.primary) + ';animation:none">' + iconInner() +
      '<em>' + esc(store.app.shortName || store.name) + '</em></span><span style="background:#E6EEE9"></span></div>' +
      '<div class="hs-dock"><span style="background:#DCEBDD"></span><span style="background:#DDE6F3"></span><span style="background:#F1E4DA"></span><span style="background:#ECE6F3"></span></div></div></div></div>';
  }

  function splashMock() {
    var bg = store.app.bg || store.theme.primary;
    return '<div class="mock-phone"><div class="phone-notch"></div><div class="splash" style="background:' + esc(bg) + ';color:' + SF.onColor(bg) + '">' +
      '<div class="splash-icon" style="background:' + esc(bg) + ';box-shadow:none">' + iconInner(true) + '</div>' +
      '<b>' + esc(store.app.name || store.name) + '</b></div></div>';
  }

  function appPreviewHtml() {
    if (appView === 'home') return homeScreenMock();
    if (appView === 'splash') return splashMock();
    return deviceFrame('phone', 'preview.html?embed=1&app=1', { live: true, interactive: true });
  }

  function pageApp() {
    store.flags.appVisited = true; save();
    var a = store.app;
    var dim = a.enabled ? '' : ' style="opacity:.55;pointer-events:none"';
    return '<div class="page-head"><div><h1>Mobile app</h1><p>Turn your store into an app customers can install on Android and iPhone.</p></div></div>' +
      '<div class="app-grid"><div>' +
      '<div class="card"><div class="switch-row" style="padding:0;border:0"><div><b style="font-size:15px;font-weight:600">Installable app</b><small>Adds an app icon, full-screen mode and offline support to your published store.</small></div>' +
      '<label class="switch"><input type="checkbox" data-bind-bool="app.enabled"' + (a.enabled ? ' checked' : '') + ' data-rerender="1"><span></span></label></div></div>' +

      '<div class="card"' + dim + '><h2>App details</h2>' +
      '<div class="field-row"><div class="field"><label>App name</label><input data-bind="app.name" data-app-preview value="' + esc(a.name || store.name) + '" maxlength="45"><span class="help">Shown on the install prompt and launch screen.</span></div>' +
      '<div class="field"><label>Short name</label><input data-bind="app.shortName" data-app-preview value="' + esc(a.shortName || '') + '" maxlength="12"><span class="help">Under the icon on the home screen. Up to 12 characters.</span></div></div>' +
      '<div class="field"><span class="field-label">App icon</span><div class="icon-preview">' +
      '<figure>' + appIcon(72) + '72 px</figure><figure>' + appIcon(52) + '52 px</figure><figure>' + appIcon(36, 9) + '36 px</figure>' +
      '<div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;align-items:center"><label class="btn btn-secondary btn-sm">' + icon('image', 15) + 'Upload icon<input type="file" accept="image/*" data-upload="app-icon" hidden></label>' +
      (a.icon ? '<button class="btn-link danger" data-action="rm-app-icon">Use logo instead</button>' : '') + '</div></div>' +
      '<span class="help">Built from your logo and colour, or upload a square image at least 512 × 512.</span></div>' +
      '<div class="field" style="margin-bottom:0"><span class="field-label">Icon & launch screen colour</span>' + colorSwatches('set-app-bg', a.bg || store.theme.primary, 'data-bind="app.bg" data-app-preview') + '</div></div>' +

      '<div class="card"' + dim + '><h2>Install banner</h2>' +
      switchRow('app.banner', '“Get the app” banner', 'Invites visitors on phones to install your app. Once dismissed, it stays hidden.', a.banner !== false) + '</div>' +

      '<div class="card"><h2>How customers install it</h2><div class="store-badges">' +
      '<div class="store-badge"><h3>' + icon('android', 18) + 'Android</h3><p>Chrome shows your <b>Install</b> banner. One tap adds your icon to the home screen.</p></div>' +
      '<div class="store-badge"><h3>' + icon('apple', 18) + 'iPhone & iPad</h3><p>In Safari, tap <b>Share → Add to Home Screen</b>. Your banner shows these steps.</p></div></div></div>' +

      '<div class="card"><h2>Google Play & the App Store <span class="pill pill-gray pill-plain" style="margin-left:6px">Optional</span></h2>' +
      '<p class="card-sub" style="margin-top:4px">Your store is a Progressive Web App, so the free <a class="btn-link" href="https://www.pwabuilder.com" target="_blank" rel="noopener">PWABuilder</a> tool from Microsoft can package it for the app stores.</p>' +
      '<div class="store-badges"><div class="store-badge"><h3>' + icon('android', 18) + 'Google Play</h3><ol>' +
      '<li>Publish your store online first.</li><li>Open pwabuilder.com and enter your store\'s URL.</li><li>Choose <b>Package for stores → Android</b> and download.</li><li>Upload it in the Google Play Console (one-time developer fee).</li></ol></div>' +
      '<div class="store-badge"><h3>' + icon('apple', 18) + 'App Store</h3><ol>' +
      '<li>In PWABuilder, choose <b>iOS</b> and download the project.</li><li>Open it in Xcode on a Mac.</li><li>Submit it with an Apple Developer account (annual fee).</li><li>Apple reviews every app; allow a few days.</li></ol></div></div></div>' +
      '</div>' +

      '<div class="app-preview"><div class="seg">' + [['home', 'Home screen'], ['splash', 'Launch'], ['app', 'App']].map(function (v) {
        return '<button class="' + (appView === v[0] ? 'on' : '') + '" data-action="app-view" data-v="' + v[0] + '">' + v[1] + '</button>';
      }).join('') + '</div><div class="app-phone-wrap" id="app-phone">' + appPreviewHtml() + '</div></div></div>';
  }

  function refreshAppPreview() {
    app.querySelectorAll('.icon-preview figure').forEach(function (f, i) {
      var sizes = [[72], [52], [36, 9]];
      f.innerHTML = appIcon(sizes[i][0], sizes[i][1]) + sizes[i][0] + ' px';
    });
    var box = document.getElementById('app-phone');
    if (!box) return;
    if (appView === 'app') { pushPreview(); return; }
    box.innerHTML = appPreviewHtml();
  }

  // ---------- settings ----------
  function pageSettings() {
    var c = store.contact, p = store.payments, sh = store.shipping;
    return '<div class="page-head"><div><h1>Settings</h1><p>Store details, how customers reach you, payments and delivery.</p></div></div>' +
      '<form data-form="settings" novalidate style="max-width:760px">' +
      '<div class="card"><h2>Store details</h2>' +
      '<div class="field"><label for="st-name">Store name</label><input id="st-name" name="name" required maxlength="60" value="' + esc(store.name) + '"></div>' +
      '<div class="field"><label for="st-tag">Tagline</label><input id="st-tag" name="tagline" maxlength="120" value="' + esc(store.tagline) + '"><span class="help">Used in search results and link previews.</span></div>' +
      '<div class="field" style="margin-bottom:0"><label for="st-cur">Currency</label><select id="st-cur" name="currency">' + CURRENCIES.map(function (x) {
        return '<option' + (store.currency === x ? ' selected' : '') + '>' + x + '</option>';
      }).join('') + '</select></div></div>' +

      '<div class="card"><h2>Orders & contact</h2><p class="card-sub">Where orders are sent and how customers reach you.</p>' +
      '<div class="field"><label for="st-wa">WhatsApp number</label><input id="st-wa" name="whatsapp" type="tel" value="' + esc(c.whatsapp) + '" placeholder="919876543210"><span class="help">With country code. Orders are sent here.</span></div>' +
      '<div class="field-row"><div class="field"><label for="st-email">Email</label><input id="st-email" name="email" type="email" value="' + esc(c.email) + '"></div>' +
      '<div class="field"><label for="st-phone">Phone</label><input id="st-phone" name="phone" type="tel" value="' + esc(c.phone) + '"></div></div>' +
      '<div class="field"><label for="st-ig">Instagram</label><div class="input-prefix"><span>@</span><input id="st-ig" name="instagram" value="' + esc(String(c.instagram || '').replace(/^@/, '')) + '"></div></div>' +
      '<div class="field" style="margin-bottom:0"><label for="st-addr">Address <span class="optional">(shown in your footer)</span></label><textarea id="st-addr" name="address" rows="2">' + esc(c.address) + '</textarea></div></div>' +

      '<div class="card"><h2>Payments</h2>' +
      '<div class="field"><label for="st-upi">UPI ID</label><input id="st-upi" name="upi" value="' + esc(p.upi) + '" placeholder="yourname@okaxis" autocapitalize="off"><span class="help">Customers pay the exact amount with any UPI app. Leave empty to turn off.</span></div>' +
      '<div class="switch-row" style="border:0;padding-bottom:0"><div><b>Cash on delivery</b><small>Customers pay when the order arrives</small></div><label class="switch"><input type="checkbox" name="cod"' + (p.cod ? ' checked' : '') + '><span></span></label></div></div>' +

      '<div class="card"><h2>Delivery</h2><div class="field-row">' +
      '<div class="field" style="margin-bottom:0"><label for="st-flat">Delivery fee</label><div class="input-prefix"><span>' + esc(store.currency) + '</span><input id="st-flat" name="flat" type="number" min="0" step="0.01" value="' + esc(sh.flat || 0) + '"></div><span class="help">0 for free delivery.</span></div>' +
      '<div class="field" style="margin-bottom:0"><label for="st-free">Free delivery over</label><div class="input-prefix"><span>' + esc(store.currency) + '</span><input id="st-free" name="freeAbove" type="number" min="0" step="0.01" value="' + esc(sh.freeAbove || '') + '" placeholder="Optional"></div></div></div></div>' +

      '<div class="save-bar"><span>Store settings</span><button class="btn btn-light btn-sm" type="submit">Save</button></div></form>' +
      (cloud.on ? '<div class="card" style="max-width:760px;margin-top:28px"><h2>Store address & account</h2>' +
        '<div class="url-box" style="margin-bottom:14px"><a href="' + esc(store.url || '') + '" target="_blank" rel="noopener">' + esc(String(store.url || 'Publishing…').replace(/^https?:\/\//, '')) + '</a></div>' +
        (function () {
          var u = Cloud.user();
          if (!u) return '';
          return u.anonymous
            ? '<p class="card-sub" style="margin:0 0 12px">Your store is linked to this browser only.</p><button class="btn btn-secondary btn-sm" data-action="save-access">' + GOOGLE_G + 'Save access with Google</button>'
            : '<p class="card-sub" style="margin:0 0 12px">Signed in as <b>' + esc(u.email) + '</b>.</p><button class="btn btn-secondary btn-sm" data-action="sign-out">Sign out on this device</button>';
        })() + '</div>' : '') +

      '<div class="card" style="max-width:760px;margin-top:28px;box-shadow:0 0 0 1px color-mix(in srgb,var(--red) 35%,transparent)"><h2>Delete store</h2><p class="card-sub" style="margin-top:0">Permanently remove this store, its products and orders from this browser. Download a backup from Publish first if you might want it back.</p>' +
      '<button class="btn btn-danger btn-sm" data-action="delete-store">' + icon('trash', 15) + 'Delete store</button></div>';
  }

  function saveSettings(form) {
    var fd = new FormData(form);
    var name = String(fd.get('name') || '').trim();
    if (!name) { toast('Store name can\'t be empty', 'alert'); return; }
    if (store.app.name === store.name) store.app.name = name;
    store.name = name;
    store.tagline = String(fd.get('tagline') || '').trim();
    store.currency = String(fd.get('currency'));
    store.contact = {
      whatsapp: waDigits(fd.get('whatsapp')),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      instagram: String(fd.get('instagram') || '').trim().replace(/^@/, ''),
      address: String(fd.get('address') || '').trim()
    };
    store.payments = { upi: String(fd.get('upi') || '').trim(), cod: fd.get('cod') === 'on' };
    store.shipping = { flat: Math.max(0, Number(fd.get('flat')) || 0), freeAbove: Math.max(0, Number(fd.get('freeAbove')) || 0) };
    if (save()) { toast('Settings saved'); render(); }
  }

  // ---------- publish ----------
  // Hosted platform: nothing to publish — the store is already online.
  function pagePublishCloud() {
    var url = store.url || '';
    var shown = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    var msg = encodeURIComponent('Shop ' + store.name + ' online: ' + url);
    return '<div class="page-head"><div><h1>Share your store</h1><p>Your store is online. Every change you make is published automatically.</p></div></div>' +
      '<div class="two-col"><div>' +
      '<div class="card"><h2>Your store link</h2>' +
      '<div class="url-box"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(shown || 'Publishing…') + '</a><button class="btn btn-secondary btn-sm" data-action="copy-url" data-url="' + esc(url) + '">' + icon('copy', 15) + 'Copy</button></div>' +
      '<div class="share-grid">' +
      '<a class="share-opt" data-action="shared" href="https://wa.me/?text=' + msg + '" target="_blank" rel="noopener">' + icon('chat', 20) + '<b>WhatsApp</b><span>Send to customers or post on your Status</span></a>' +
      '<a class="share-opt" data-action="shared" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('external', 20) + '<b>Instagram bio</b><span>Copy the link into your profile</span></a>' +
      '<a class="share-opt" data-action="shared" href="https://business.google.com/" target="_blank" rel="noopener">' + icon('store', 20) + '<b>Google Business</b><span>Add it as your website</span></a></div></div>' +
      '<div class="card"><h2>Your mobile app</h2><p class="card-sub" style="margin-top:0">' + (store.app.enabled
        ? 'Customers who open your link on a phone are invited to install your app. There\'s nothing for you to upload.'
        : 'Turn on your app so customers can install your store on their phone.') + '</p>' +
      '<a class="btn btn-secondary btn-sm" href="#/admin/app">' + (store.app.enabled ? 'App settings' : 'Turn on the app') + '</a></div></div>' +
      '<div><div class="card"><h2>How it works</h2><ol class="publish-steps">' +
      '<li><b>Always online.</b> Your store is hosted for you. No servers, files or renewals.</li>' +
      '<li><b>Changes go live automatically</b> a moment after you make them.</li>' +
      '<li><b>Orders arrive in your dashboard</b>' + (store.contact.whatsapp ? ', and customers can also send them to your WhatsApp' : '') + '. Stock goes down with every sale.</li>' +
      '<li><b>Payments go straight to you</b> by UPI or cash on delivery.</li></ol></div>' +
      '<div class="card"><h2>Advanced</h2><p class="card-sub" style="margin-top:0">Want a copy to keep or host yourself?</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary btn-sm" data-action="download-zip">' + icon('download', 15) + 'Download site</button>' +
      '<button class="btn btn-secondary btn-sm" data-action="backup">' + icon('download', 15) + 'Download backup</button></div></div></div></div>';
  }

  function pagePublish() {
    if (cloud.on) return pagePublishCloud();
    var checks = [
      [!!(store.contact.whatsapp || store.contact.email), 'Customers can send you orders', 'Add a WhatsApp number or email in <a class="btn-link" href="#/admin/settings">Settings</a>.'],
      [(store.products || []).some(function (p) { return p.active !== false; }), 'Store has visible products', 'Add at least one active product.'],
      [!(store.products || []).some(function (p) { return p.sample; }), 'No sample products left', '<button class="btn-link" data-action="rm-samples">Delete sample products</button>'],
      [!!(store.payments.upi || store.payments.cod), 'A payment method is set up', 'Add a UPI ID or turn on cash on delivery.']
    ];
    var ok = checks.every(function (c) { return c[0]; });

    return '<div class="page-head"><div><h1>Publish</h1><p>Put your store and app online — free.</p></div></div>' +
      '<div class="two-col"><div>' +
      '<div class="card"><h2>1. Download your store</h2><p class="card-sub" style="margin-top:0">Everything — design, products and photos — packaged and ready to upload.' + (store.app.enabled ? ' Includes your installable app.' : '') + '</p>' +
      '<div class="dl-card"><span class="dl-ic">' + icon('zip', 22) + '</span><div><b>' + esc(slug(store.name)) + '.zip</b><small>Website' + (store.app.enabled ? ' + mobile app (manifest, service worker, icons)' : '') + ' · recommended</small></div>' +
      '<button class="btn btn-primary" data-action="download-zip">' + icon('download', 16) + 'Download</button></div>' +
      '<div class="dl-card"><span class="dl-ic">' + icon('file', 22) + '</span><div><b>index.html</b><small>Single-file website only' + (store.app.enabled ? ' (no app install)' : '') + '</small></div>' +
      '<button class="btn btn-secondary" data-action="download-html">' + icon('download', 16) + 'Download</button></div>' +
      (store.flags.publishedAt ? '<span class="help">Last downloaded ' + fmtDate(store.flags.publishedAt) + '</span>' : '') + '</div>' +

      '<div class="card"><h2>2. Put it online</h2><p class="card-sub" style="margin-top:0">The easiest way is Netlify Drop — free, no coding, about a minute.</p><ol class="publish-steps">' +
      '<li><b>Unzip</b> the file you downloaded. You\'ll get a folder called <span class="kbd">' + esc(slug(store.name)) + '</span>.</li>' +
      '<li>Open <a class="btn-link" href="https://app.netlify.com/drop" target="_blank" rel="noopener">app.netlify.com/drop</a> and <b>drag the folder</b> onto the page.</li>' +
      '<li>You\'ll get a link like <span class="kbd">' + esc(slug(store.name)) + '-123.netlify.app</span>. Create a free account to keep it and pick a nicer name.</li>' +
      '<li><b>Share it</b> on WhatsApp, Instagram and Google Business — and print it as a QR code for your counter.</li></ol>' +
      '<details><summary style="cursor:pointer;font-weight:600;font-size:13.5px">Other options: GitHub Pages or your own domain</summary><div style="font-size:13.5px;color:var(--text2);margin-top:10px;line-height:1.6">' +
      '<p style="margin-bottom:8px"><b>GitHub Pages:</b> create a public repository, upload the folder\'s contents, then go to Settings → Pages and choose your main branch.</p>' +
      '<p><b>Your own domain:</b> buy a domain from any registrar and connect it in Netlify under Domain management. Any host that serves plain files works. The app needs <b>https</b>, which Netlify and GitHub Pages provide.</p></div></details></div>' +

      '<div class="card"><h2>Updating your store</h2><p style="font-size:13.5px;color:var(--text2);line-height:1.6">Your published store is a snapshot. After changing products, prices or stock, download again and drag the new folder onto your site\'s <b>Deploys</b> page in Netlify. Installed apps pick up the update the next time they open.</p></div></div>' +

      '<div><div class="card"><div class="card-head"><h2>Ready to launch?</h2>' + (ok ? '<span class="pill pill-green">Ready</span>' : '<span class="pill pill-amber">Almost</span>') + '</div>' +
      '<ul class="checklist">' + checks.map(function (c) {
        return '<li class="' + (c[0] ? 'done' : '') + '" style="align-items:flex-start"><span class="tick">' + (c[0] ? icon('check', 12) : '') + '</span><span class="cl-text">' + c[1] + (c[0] ? '' : '<br><small style="color:var(--text3)">' + c[2] + '</small>') + '</span></li>';
      }).join('') + '</ul></div>' +
      '<div class="card"><h2>How orders work</h2><ol class="publish-steps">' +
      '<li>Customers add products to their cart and check out with their name, phone and address.</li>' +
      '<li>' + (store.contact.whatsapp ? 'They tap <b>Send order on WhatsApp</b> and the order lands in your chat.' : 'Add a WhatsApp number so orders land in your chat.') + '</li>' +
      '<li>' + (store.payments.upi ? 'They can pay the exact total to <b>' + esc(store.payments.upi) + '</b> from any UPI app.' : 'Add a UPI ID in Settings to take online payments.') + '</li>' +
      '<li>You confirm, pack and deliver. No commission, no fees.</li></ol></div>' +
      '<div class="card"><h2>Backup</h2><p class="card-sub" style="margin-top:0">Your store is saved in this browser only. Keep a backup, or use it to move to another device.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary btn-sm" data-action="backup">' + icon('download', 15) + 'Download backup</button>' +
      '<label class="btn btn-secondary btn-sm">' + icon('publish', 15) + 'Restore<input type="file" accept="application/json,.json" data-upload="restore" hidden></label></div></div></div></div>';
  }

  function download(filename, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  function fetchText(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.text(); });
  }

  function buildSite(pwa) {
    return Promise.all([fetchText('storefront.css'), fetchText('storefront.js'), fetchText('sections.js')]).then(function (res) {
      var pub = JSON.parse(JSON.stringify(store));
      delete pub.orders;   // customer data never goes into the public site
      delete pub.flags;
      if (!pwa) pub.app = Object.assign({}, pub.app, { enabled: false });
      // Escape so the JSON can't close the <script> tag or break on line separators.
      var data = JSON.stringify(pub).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      var title = store.name + (store.tagline ? ' — ' + store.tagline : '');
      var desc = store.tagline || (store.description || '').slice(0, 160) || ('Shop online at ' + store.name);
      var favicon = hasImageLogo(store)
        ? store.logo
        : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + store.theme.primary + '"/><text x="32" y="42" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="' + SF.onColor(store.theme.primary) + '">' + esc(monogram(store)) + '</text></svg>');
      var head = pwa
        ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n' +
          '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="' + esc(store.app.shortName || store.name) + '">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
        : '<link rel="icon" href="' + esc(favicon) + '">\n';
      var sw = pwa ? '<script>\nif ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js"); }); }\n</script>\n' : '';
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n' +
        '<title>' + esc(title) + '</title>\n' +
        '<meta name="description" content="' + esc(desc) + '">\n' +
        '<meta name="theme-color" content="#ffffff">\n' +
        '<meta property="og:title" content="' + esc(store.name) + '">\n' +
        '<meta property="og:description" content="' + esc(desc) + '">\n' +
        '<meta property="og:type" content="website">\n' + head +
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
        '<link href="' + esc(SS.fontHref(store.theme)) + '" rel="stylesheet" data-sf-fonts>\n' +
        '<style>\nhtml,body{margin:0;background:#fff;}\n' + res[0] + '\n</style>\n</head>\n<body>\n' +
        '<div id="sf-root"><noscript>' + esc(store.name) + ' needs JavaScript turned on to show products.</noscript></div>\n' +
        '<!-- Built with Sahaay Stores -->\n<script>\n' + res[2] + '\n</script>\n<script>\n' + res[1] + '\n</script>\n' +
        '<script>\nvar STORE = ' + data + ';\nSahaayStorefront.mount(document.getElementById("sf-root"), STORE, { mode: "live" });\n</script>\n' + sw +
        '</body>\n</html>\n';
    });
  }

  // ----- PWA assets -----
  function manifestJson() {
    var a = store.app, bg = a.bg || store.theme.primary;
    return JSON.stringify({
      name: a.name || store.name,
      short_name: a.shortName || store.name.slice(0, 12),
      description: store.tagline || ('Shop at ' + store.name),
      start_url: './',
      scope: './',
      display: 'standalone',
      orientation: 'portrait',
      background_color: bg,
      theme_color: '#ffffff',
      categories: ['shopping'],
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    }, null, 2);
  }

  function serviceWorker() {
    return '/* ' + store.name.replace(/\*\//g, '') + ' — offline support. Generated by Sahaay Stores. */\n' +
      'var CACHE = "store-' + Date.now().toString(36) + '";\n' +
      'var CORE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];\n' +
      'self.addEventListener("install", function (e) {\n  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));\n});\n' +
      'self.addEventListener("activate", function (e) {\n  e.waitUntil(caches.keys().then(function (keys) {\n    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));\n  }).then(function () { return self.clients.claim(); }));\n});\n' +
      'self.addEventListener("fetch", function (e) {\n  var req = e.request;\n  if (req.method !== "GET") return;\n  var url = new URL(req.url);\n' +
      '  // Google Fonts: cache-first so the store looks right offline.\n' +
      '  if (/fonts\\.(googleapis|gstatic)\\.com$/.test(url.hostname)) {\n    e.respondWith(caches.match(req).then(function (hit) {\n      return hit || fetch(req).then(function (res) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res; });\n    }));\n    return;\n  }\n' +
      '  if (url.origin !== location.origin) return;\n' +
      '  // Store files: network-first so updates show up, cache as offline fallback.\n' +
      '  e.respondWith(fetch(req).then(function (res) {\n    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res;\n  }).catch(function () {\n    return caches.match(req).then(function (hit) { return hit || caches.match("./index.html"); });\n  }));\n});\n';
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      if (/^https?:/.test(src)) img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Draws the app icon: uploaded icon (cover), or logo/emoji on the brand colour.
  // format: 'bytes' (Uint8Array, for the ZIP) or 'dataurl' (for upload).
  function renderIcon(size, maskable, format) {
    var a = store.app, bg = a.bg || store.theme.primary;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var x = c.getContext('2d');
    x.fillStyle = bg;
    x.fillRect(0, 0, size, size);
    // Prefer this browser's original copy of the image: a remote copy can
    // only be drawn if its host allows cross-origin reads.
    var src = a.icon ? (store.flags.appIconData || a.icon) : hasImageLogo(store) ? (store.flags.logoData || store.logo) : null;
    var fontKey = ((store.theme || {}).fonts || {}).heading;
    var fam = SS.FONTS[fontKey] ? SS.FONTS[fontKey][0] : 'Inter';
    var fontSpec = (store.theme.headingWeight || 600) + ' ' + Math.round(size * (maskable ? 0.3 : 0.38)) + 'px "' + fam + '", Georgia, serif';
    var done = src ? loadImage(src).then(function (img) {
      var pad = a.icon ? (maskable ? size * 0.1 : 0) : size * (maskable ? 0.24 : 0.16);
      var box = size - pad * 2;
      var s = Math.max(box / img.width, box / img.height);
      var w = img.width * s, h = img.height * s;
      x.save();
      x.beginPath();
      x.rect(pad, pad, box, box);
      x.clip();
      x.drawImage(img, pad + (box - w) / 2, pad + (box - h) / 2, w, h);
      x.restore();
    }) : (document.fonts && document.fonts.load ? document.fonts.load(fontSpec).catch(function () {}) : Promise.resolve()).then(function () {
      x.font = fontSpec;
      x.fillStyle = SF.onColor(bg);
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(monogram(store), size / 2, size / 2 + size * 0.02);
    });
    return done.then(function () {
      if (format === 'dataurl') return c.toDataURL('image/png');
      return new Promise(function (resolve) {
        c.toBlob(function (b) { b.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); }); }, 'image/png');
      });
    });
  }

  // Minimal ZIP writer (stored, no compression) — enough for a handful of files.
  var CRC_TABLE = (function () {
    var t = [], c;
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(files) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0, d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      var crc = crc32(data), size = data.length;
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      var cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true); cd.setUint16(12, time, true); cd.setUint16(14, date, true); cd.setUint32(16, crc, true);
      cd.setUint32(20, size, true); cd.setUint32(24, size, true); cd.setUint16(28, name.length, true);
      cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + size;
    });
    var cdSize = central.reduce(function (s, a) { return s + a.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }

  function buildZip() {
    var dir = slug(store.name) + '/';
    var pwa = !!store.app.enabled;
    return buildSite(pwa).then(function (html) {
      var files = [{ name: dir + 'index.html', data: html }];
      if (!pwa) return files;
      return Promise.all([renderIcon(192), renderIcon(512), renderIcon(512, true), renderIcon(180)]).then(function (ic) {
        return files.concat([
          { name: dir + 'manifest.webmanifest', data: manifestJson() },
          { name: dir + 'sw.js', data: serviceWorker() },
          { name: dir + 'icons/icon-192.png', data: ic[0] },
          { name: dir + 'icons/icon-512.png', data: ic[1] },
          { name: dir + 'icons/maskable-512.png', data: ic[2] },
          { name: dir + 'icons/apple-touch-icon.png', data: ic[3] }
        ]);
      });
    }).then(makeZip);
  }

  function markPublished() {
    store.flags.published = true;
    store.flags.publishedAt = new Date().toISOString();
    save();
  }

  // ============================================================
  // Events
  // ============================================================
  function markOn(t) {
    t.parentNode.querySelectorAll('.on').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
  }

  app.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var a = t.getAttribute('data-action');
    var id = t.getAttribute('data-id');
    if (a.indexOf('ed-') === 0 && edAction(a, t, e)) return;

    switch (a) {
      // wizard
      case 'wz-style': {
        var ST = SS.STYLES[t.getAttribute('data-v')];
        wz.d.style = t.getAttribute('data-v');
        if (ST) wz.d.primary = ST.primary;
        renderWizard(); break;
      }
      case 'wz-cat': applyPreset(t.getAttribute('data-cat')); renderWizard(); break;
      case 'wz-set': wz.d[t.getAttribute('data-k')] = t.getAttribute('data-v'); renderWizard(); break;
      case 'wz-next':
        if (!wizardCanNext()) return;
        wz.step++; renderWizard(); window.scrollTo(0, 0); break;
      case 'wz-back': wz.step--; renderWizard(); break;
      case 'wz-back-to-form': app.innerHTML = ''; renderWizard(); break;
      case 'wz-rm-logo': wz.d.logoImg = ''; renderWizard(); break;
      case 'wz-launch': launch(); break;

      // hosted platform
      case 'shared': if (store) { store.flags.shared = true; save({ local: true }); } break;
      case 'copy-url': {
        var u = t.getAttribute('data-url');
        if (store) { store.flags.shared = true; save({ local: true }); }
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Link copied'); }, function () { prompt('Copy your store link:', u); });
        break;
      }
      case 'save-access':
        Cloud.saveAccessWithGoogle().then(function () {
          toast('Saved. Sign in with Google on any device.');
          render();
        }, function (e) { if (e && e.code !== 'auth/popup-closed-by-user') toast(e.message || 'Couldn\'t connect Google', 'alert'); });
        break;
      case 'login-google':
        Cloud.signInWithGoogle().then(afterSignIn, function (e) { if (e && e.code !== 'auth/popup-closed-by-user') toast(e.message || 'Sign-in failed', 'alert'); });
        break;
      case 'sync-now': runSync(); break;
      case 'sign-out':
        if (!confirm('Sign out on this device? Your store stays online.')) return;
        Cloud.signOut().then(function () {
          localStorage.removeItem(KEY); store = null; location.hash = '#/';
        });
        break;

      // admin
      case 'go': location.hash = t.getAttribute('data-href'); break;
      case 'rm-samples':
        store.products = store.products.filter(function (p) { return !p.sample; });
        save(); toast('Sample products deleted'); render(); break;
      case 'product-tab': productTab = t.getAttribute('data-v'); render(); break;
      case 'order-tab': orderTab = t.getAttribute('data-v'); openOrder = null; render(); break;
      case 'toggle-order':
        if (route().sub !== 'orders') { openOrder = id; orderTab = 'all'; location.hash = '#/admin/orders'; return; }
        openOrder = openOrder === id ? null : id; render(); break;
      case 'rm-img': draftImages.splice(Number(t.getAttribute('data-i')), 1); document.getElementById('pf-imgs').innerHTML = imgTiles(); break;
      case 'del-product':
        if (!confirm('Delete this product? This can\'t be undone.')) return;
        store.products = store.products.filter(function (p) { return p.id !== id; });
        save(); draftFor = null; toast('Product deleted'); location.hash = '#/admin/products'; break;
      case 'dup-product': {
        var src = store.products.filter(function (p) { return p.id === id; })[0];
        if (!src) return;
        var copy = JSON.parse(JSON.stringify(src));
        copy.id = uid('p'); copy.title = src.title + ' (copy)'; delete copy.sample;
        store.products.push(copy);
        if (save()) { draftFor = null; toast('Product duplicated'); location.hash = '#/admin/products/edit/' + copy.id; }
        break;
      }
      case 'del-order': {
        if (!confirm('Delete this order?')) return;
        var gone = store.orders.filter(function (o) { return o.id === id; })[0];
        store.orders = store.orders.filter(function (o) { return o.id !== id; });
        save({ local: true }); render();
        if (gone && gone.cloud) Cloud.deleteOrder(id).catch(function (e) { toast(e.message, 'alert'); });
        break;
      }

      // design
      case 'device': device = t.getAttribute('data-v'); render(); break;

      // mobile app
      case 'app-view': {
        appView = t.getAttribute('data-v'); markOn(t);
        var box = document.getElementById('app-phone');
        box.innerHTML = appPreviewHtml();
        mountViews(box);
        break;
      }
      case 'set-app-bg': {
        store.app.bg = t.getAttribute('data-v'); markOn(t); save();
        var ac = t.parentNode.querySelector('input[type=color]'); if (ac) ac.value = store.app.bg;
        refreshAppPreview(); break;
      }
      case 'rm-app-icon': store.app.icon = ''; save(); render(); break;

      case 'delete-store':
        if (!confirm('Delete "' + store.name + '" and all its products and orders from this browser?')) return;
        if (prompt('Type DELETE to confirm') !== 'DELETE') return;
        localStorage.removeItem(KEY);
        store = null;
        location.hash = '#/';
        break;
      case 'download-zip':
      case 'download-html': {
        t.disabled = true;
        var zip = a === 'download-zip';
        (zip ? buildZip() : buildSite(false).then(function (html) { return new Blob([html], { type: 'text/html' }); })).then(function (blob) {
          download(zip ? slug(store.name) + '.zip' : 'index.html', blob);
          markPublished();
          toast(zip ? 'Downloaded ' + slug(store.name) + '.zip' : 'Downloaded index.html', 'download');
          render();
        }).catch(function () {
          t.disabled = false;
          toast('Couldn\'t build the site. Open the builder from a web address, not a local file.', 'alert');
        });
        break;
      }
      case 'backup':
        download(slug(store.name) + '-backup.json', new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }));
        break;
    }
  });

  app.addEventListener('input', function (e) {
    var t = e.target;
    var wzKey = t.getAttribute('data-wz');
    if (wzKey) {
      if (t.type === 'checkbox') return;   // handled on change
      wz.d[wzKey] = t.value;
      var btn = app.querySelector('.wz-nav .btn-primary[data-action="wz-next"]');
      if (btn) btn.disabled = !wizardCanNext();
      if (wzKey === 'primary') app.querySelectorAll('.swatch.on').forEach(function (x) { x.classList.remove('on'); });
      updateWizardPreview();
      return;
    }
    if (t.hasAttribute('data-edit') && t.type !== 'checkbox' && t.tagName !== 'SELECT') { edInput(t, false); return; }
    var bind = t.getAttribute('data-bind');
    if (bind && t.tagName !== 'SELECT') {
      setPath(bind, t.value);
      if (t.type === 'color') t.parentNode.querySelectorAll('.swatch.on').forEach(function (x) { x.classList.remove('on'); });
      if (t.hasAttribute('data-app-preview')) { save(); refreshAppPreview(); }
      else scheduleSave();
      return;
    }
    if (t.getAttribute('data-input') === 'product-filter') {
      productFilter = t.value;
      var pos = t.selectionStart;
      render();
      var ni = app.querySelector('[data-input="product-filter"]');
      if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (err) { /* ignore */ } }
    }
  });

  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-wz') && (t.type === 'checkbox' || t.tagName === 'SELECT')) {
      wz.d[t.getAttribute('data-wz')] = t.type === 'checkbox' ? t.checked : t.value;
      updateWizardPreview();
      return;
    }
    if (t.getAttribute('data-action-change') === 'ed-page') {
      ed.page = t.value; ed.sel = null; renderPanel(); sendPreview({ type: 'sahaay-page', id: ed.page }); return;
    }
    if (t.hasAttribute('data-edit') && (t.type === 'checkbox' || t.tagName === 'SELECT')) { edInput(t, true); return; }
    var bb = t.getAttribute('data-bind-bool');
    if (bb) {
      setPath(bb, t.checked);
      if (t.hasAttribute('data-rerender')) { save(); render(); toast(t.checked ? 'Mobile app turned on' : 'Mobile app turned off'); }
      else if (bb.indexOf('app.') === 0) { save(); pushPreview(); }
      else scheduleSave();
      return;
    }
    if (t.getAttribute('data-bind') && t.tagName === 'SELECT') { setPath(t.getAttribute('data-bind'), t.value); scheduleSave(); return; }
    if (t.getAttribute('data-input') === 'order-status') {
      var o = store.orders.filter(function (x) { return x.id === t.getAttribute('data-id'); })[0];
      if (o) {
        o.status = t.value; save({ local: true });
        toast('Marked as ' + t.options[t.selectedIndex].text.toLowerCase()); render();
        if (o.cloud) Cloud.updateOrder(o.id, o.status).catch(function (e) { toast(e.message, 'alert'); });
      }
      return;
    }

    var up = t.getAttribute('data-upload');
    if (!up || !t.files || !t.files.length) return;
    var files = Array.prototype.slice.call(t.files);

    if (up === 'wz-owner-photo' || up === 'wz-logo') {
      compressImage(files[0], up === 'wz-logo' ? 256 : 600, 0.88).then(function (u) {
        if (up === 'wz-logo') wz.d.logoImg = u; else wz.d.ownerPhoto = u;
        renderWizard();
      }).catch(function () { toast('Please choose an image file', 'alert'); });
    } else if (up === 'ed-image') {
      var ipath = t.getAttribute('data-path');
      var isLogo = ipath === 'logo';
      compressImage(files[0], isLogo ? 512 : /hero|image$/.test(ipath) && !/items/.test(ipath) ? 1800 : 1200, isLogo ? 0.92 : 0.82).then(function (d) {
        if (isLogo) store.flags.logoData = d;
        return storeImage(d);
      }).then(function (u) {
        setPath(ipath, u);
        if (isLogo) store.brand.type = 'image';
        scheduleSave(); renderPanel();
      }).catch(function () { toast('Please choose an image file', 'alert'); });
    } else if (up === 'product') {
      files = files.slice(0, 4 - draftImages.length);
      var tiles = document.getElementById('pf-imgs');
      if (tiles && cloud.on) tiles.insertAdjacentHTML('beforeend', '<div class="img-tile img-uploading"><span>Uploading…</span></div>');
      Promise.all(files.map(function (f) { return compressImage(f, 1200, 0.8).then(storeImage).catch(function () { return null; }); })).then(function (urls) {
        urls.forEach(function (u) { if (u) draftImages.push(u); });
        if (urls.some(function (u) { return !u; })) toast('Some files weren\'t images and were skipped', 'alert');
        var box = document.getElementById('pf-imgs');
        if (box) box.innerHTML = imgTiles();
      });
    } else if (up === 'app-icon') {
      compressImage(files[0], 512, 0.92).then(function (d) {
        store.flags.appIconData = d;
        return storeImage(d);
      }).then(function (u) {
        store.app.icon = u; if (save()) render(); else store.app.icon = '';
      }).catch(function () { toast('Please choose an image file', 'alert'); });
    } else if (up === 'restore') {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || !data.name || !Array.isArray(data.products)) throw new Error('bad');
          if (!confirm('Replace your current store with "' + data.name + '" from this backup?')) return;
          store = migrate(data);
          if (save()) { toast('Backup restored'); render(); }
        } catch (err) { toast('That file isn\'t a Sahaay Stores backup', 'alert'); }
      };
      reader.readAsText(files[0]);
    }
    t.value = '';
  });

  app.addEventListener('submit', function (e) {
    var f = e.target.getAttribute('data-form');
    if (!f) return;
    e.preventDefault();
    if (f === 'product') saveProduct(e.target);
    else if (f === 'settings') saveSettings(e.target);
  });

  // Test orders placed in another tab's preview.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    store = load();
    var r = route();
    if (!store) { render(); return; }
    // Don't blow away a half-filled form or the editor.
    if (r.name === 'admin' && ['products', 'settings', 'design', 'app'].indexOf(r.sub) < 0) render();
    else refreshNavCounts();
  });

  render();

  // Detect the hosted platform. Without it (e.g. plain GitHub Pages) the
  // builder keeps working in download-and-self-host mode.
  Cloud.init().then(function (info) {
    cloud.on = info.enabled;
    cloud.ai = info.ai;
    if (!cloud.on) return;
    document.querySelectorAll('[data-signin]').forEach(function (el) { el.hidden = !!store; });
    if (store) {
      store.flags.launched = true;
      (Cloud.user() ? Promise.resolve() : Cloud.ensureUser()).then(function () {
        if (store.slug) refreshFromCloud().then(function () { if (route().name === 'admin') render(); });
        else queueSync(0);   // a store made before hosting was available: publish it now
      });
    }
    var r = route();
    if (r.name === 'setup') renderWizard();
    else if (r.name !== 'landing') render();
  });
})();
