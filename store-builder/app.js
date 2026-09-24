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
  var LOGO_EMOJIS = ['🛍️', '🧁', '👗', '🧶', '🌸', '🪴', '🎧', '🛒', '☕', '💍', '📚', '🧸', '🥭', '🕯️', '🍃', '✨'];
  var CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'NPR', 'LKR', 'BDT'];
  var FONT_OPTS = [['modern', 'Modern', 'Inter'], ['geometric', 'Geometric', 'Manrope'], ['elegant', 'Elegant', 'Playfair Display'], ['luxe', 'Luxe', 'Cormorant Garamond'], ['friendly', 'Friendly', 'Nunito']];
  var THEME_OPTS = [['classic', 'Classic', 'Soft & warm', '#E9D9CF', '#F1E9E3'], ['minimal', 'Editorial', 'Clean & refined', '#1F1D1B', '#E8E4DD'], ['bold', 'Bold', 'Strong & modern', '#121212', '#DADCE3']];
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
    s.theme.mobile = s.theme.mobile || { bottomNav: true, stickyBuy: true, columns: 2 };
    s.hero = s.hero || {};
    if (!s.hero.layout) s.hero.layout = 'center';
    s.contact = s.contact || {};
    s.payments = s.payments || {};
    s.shipping = s.shipping || {};
    s.app = s.app || { enabled: false, name: s.name, shortName: (s.name || '').slice(0, 12), bg: s.theme.primary, icon: '', banner: true };
    return s;
  }
  var store = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      toast('Storage is full. Try fewer or smaller photos.', 'alert');
      return false;
    }
  }

  var uid = SahaayPresets.uid;
  function money(n) { return SF.money(n, store && store.currency); }
  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }
  function isImg(s) { return s && String(s).indexOf('data:') === 0; }
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

  function logoBox(s, cls, size) {
    s = s || store;
    var bg = (s.app && s.app.bg) || s.theme.primary;
    var style = 'background:' + esc(isImg(s.logo) ? 'transparent' : 'color-mix(in srgb,' + bg + ' 14%, #fff)') + (size ? ';width:' + size + 'px;height:' + size + 'px' : '');
    return '<span class="' + (cls || 'store-logo') + '" style="' + style + '">' + (isImg(s.logo) ? '<img src="' + esc(s.logo) + '" alt="">' : esc(s.logo || '🛍️')) + '</span>';
  }

  function appIcon(size, radius) {
    var a = store.app || {};
    var bg = a.bg || store.theme.primary;
    var inner = a.icon ? '<img src="' + esc(a.icon) + '" alt="">'
      : isImg(store.logo) ? '<img src="' + esc(store.logo) + '" alt="" style="width:64%;height:64%;border-radius:18%">'
        : '<span style="font-size:' + Math.round(size * 0.55) + 'px;line-height:1">' + esc(store.logo || '🛍️') + '</span>';
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
    if (!store) { location.replace('#/setup'); return; }
    renderAdmin(r);
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
  // Setup wizard (split screen with a live phone preview)
  // ============================================================
  function freshWizard() {
    return { step: 0, d: { name: '', category: '', tagline: '', logo: '', primary: '', template: '', font: '', whatsapp: '', upi: '', cod: true, email: '', currency: 'INR', samples: true, app: true } };
  }
  var wz = freshWizard();
  var WZ_STEPS = ['Basics', 'Look', 'Selling', 'Launch'];

  function applyPreset(cat) {
    var p = PRESETS[cat];
    wz.d.category = cat;
    wz.d.logo = p.emoji;
    wz.d.primary = p.color;
    wz.d.template = p.template;
    wz.d.font = p.font;
  }

  function wizardStore() {
    var d = wz.d;
    return SahaayPresets.buildStore({
      id: 'draft', name: d.name || 'Your Store', category: d.category || 'other', tagline: d.tagline,
      logo: d.logo, primary: d.primary, template: d.template, font: d.font,
      whatsapp: d.whatsapp, upi: d.upi, cod: d.cod, email: d.email, currency: d.currency,
      samples: d.samples, app: d.app
    });
  }
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

  function themeOptions(action, current) {
    return '<div class="opt-grid">' + THEME_OPTS.map(function (o) {
      return '<button type="button" class="opt theme-opt' + (current === o[0] ? ' on' : '') + '" data-action="' + action + '" data-k="template" data-v="' + o[0] + '"><i style="--pv-a:' + o[3] + ';--pv-b:' + o[4] + '"></i>' + o[1] + '<small>' + o[2] + '</small></button>';
    }).join('') + '</div>';
  }

  function colorSwatches(action, current, bind) {
    return '<div class="swatches">' + COLORS.map(function (c) {
      return '<button type="button" class="swatch' + (String(current).toLowerCase() === c.toLowerCase() ? ' on' : '') + '" style="background:' + c + '" data-action="' + action + '" data-k="primary" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
    }).join('') + '<input type="color" ' + bind + ' value="' + esc(current || '#1F1D1B') + '" aria-label="Custom colour"></div>';
  }

  function renderWizard() {
    document.title = 'Create your store · Sahaay Stores';
    var d = wz.d, s = wz.step, body = '';

    if (s === 0) {
      body = '<h1>Let\'s build your shop.</h1><p class="wz-sub">A few quick questions and your store is ready. You can change everything later.</p>' +
        (store ? '<div class="callout">' + icon('alert', 16) + '<span>You already have a store, <b>' + esc(store.name) + '</b>. Finishing setup will replace it. <a class="btn-link" href="#/admin">Go to its dashboard</a></span></div>' : '') +
        '<div class="field"><label for="wz-name">Store name</label><input id="wz-name" data-wz="name" placeholder="e.g. Crumb & Co." value="' + esc(d.name) + '" maxlength="60" autocomplete="organization"></div>' +
        '<div class="field"><span class="field-label">What do you sell?</span><div class="cat-grid">' +
        Object.keys(PRESETS).map(function (k) {
          return '<button type="button" class="cat-opt' + (d.category === k ? ' on' : '') + '" data-action="wz-cat" data-cat="' + k + '"><span>' + PRESETS[k].emoji + '</span>' + PRESETS[k].label + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label for="wz-tag">One-line description <span class="optional">(optional)</span></label><input id="wz-tag" data-wz="tagline" placeholder="e.g. Small-batch bakes, delivered warm across Pune" value="' + esc(d.tagline) + '" maxlength="120"></div>';
    } else if (s === 1) {
      body = '<h1>Make it look like you.</h1><p class="wz-sub">We picked a starting style for ' + esc(PRESETS[d.category].label.toLowerCase()) + '. Watch the preview update as you choose.</p>' +
        '<div class="field"><span class="field-label">Theme</span>' + themeOptions('wz-set', d.template) + '</div>' +
        '<div class="field"><span class="field-label">Brand colour</span>' + colorSwatches('wz-set', d.primary, 'data-wz="primary"') + '</div>' +
        '<div class="field"><span class="field-label">Typography</span>' + segButtons('wz-set', 'font', FONT_OPTS, d.font) + '</div>' +
        '<div class="field"><span class="field-label">Logo</span><div class="emoji-row">' + LOGO_EMOJIS.map(function (e) {
          return '<button type="button" class="' + (d.logo === e ? 'on' : '') + '" data-action="wz-set" data-k="logo" data-v="' + e + '">' + e + '</button>';
        }).join('') + '</div><span class="help">You can upload your own logo image later in Design.</span></div>';
    } else if (s === 2) {
      body = '<h1>How you\'ll get paid.</h1><p class="wz-sub">Customers check out on your store, then the full order arrives in your WhatsApp with their address — ready to confirm.</p>' +
        '<div class="field"><label for="wz-wa">WhatsApp number for orders</label><input id="wz-wa" data-wz="whatsapp" type="tel" inputmode="tel" placeholder="91 98765 43210" value="' + esc(d.whatsapp) + '"><span class="help">Include the country code, e.g. 91 for India.</span></div>' +
        '<div class="field"><label for="wz-upi">UPI ID <span class="optional">(optional)</span></label><input id="wz-upi" data-wz="upi" placeholder="yourname@okaxis" value="' + esc(d.upi) + '" autocapitalize="off" autocomplete="off"><span class="help">Customers pay the exact total straight into your bank. No fees.</span></div>' +
        '<div class="switch-row"><div><b>Cash on delivery</b><small>Let customers pay when the order arrives</small></div><label class="switch"><input type="checkbox" data-wz="cod"' + (d.cod ? ' checked' : '') + '><span></span></label></div>' +
        '<div class="field-row" style="margin-top:18px"><div class="field"><label for="wz-email">Email <span class="optional">(optional)</span></label><input id="wz-email" data-wz="email" type="email" value="' + esc(d.email) + '"></div>' +
        '<div class="field"><label for="wz-cur">Currency</label><select id="wz-cur" data-wz="currency">' + CURRENCIES.map(function (c) {
          return '<option' + (d.currency === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('') + '</select></div></div>';
    } else {
      body = '<h1>Ready to launch.</h1><p class="wz-sub">Two last choices, then you\'ll land in your dashboard to add products.</p>' +
        '<div class="card" style="display:flex;gap:14px;align-items:center;margin-bottom:20px">' + logoBox(wizardStore(), 'store-logo', 44) +
        '<div style="min-width:0;flex:1"><b style="font-size:16px;display:block">' + esc(d.name) + '</b><span style="color:var(--text2);font-size:13px">' + esc(PRESETS[d.category].label) + ' · ' + esc((THEME_OPTS.filter(function (t) { return t[0] === d.template; })[0] || [])[1] || '') + ' theme · ' + esc(d.currency) + '</span></div>' +
        '<span class="swatch" style="background:' + esc(d.primary) + '"></span></div>' +
        '<div class="switch-row"><div><b>Add sample products</b><small>See your store with products right away. Delete them any time.</small></div><label class="switch"><input type="checkbox" data-wz="samples"' + (d.samples ? ' checked' : '') + '><span></span></label></div>' +
        '<div class="switch-row"><div><b>Make it an installable mobile app</b><small>Customers can add your store to their home screen with your icon.</small></div><label class="switch"><input type="checkbox" data-wz="app"' + (d.app ? ' checked' : '') + '><span></span></label></div>' +
        (!waDigits(d.whatsapp) && !d.email ? '<div class="callout" style="margin-top:18px">' + icon('alert', 16) + '<span>Without a WhatsApp number or email, customers can\'t send you orders yet. You can add one later in Settings.</span></div>' : '');
    }

    var canNext = s === 0 ? d.name.trim() && d.category : true;
    var hadPreview = app.querySelector('.wz-preview iframe');
    var html = '<div class="wz"><div class="wz-form"><div class="wz-top"><a class="brand" href="#/"><span class="brand-mark">' + icon('store', 16) + '</span>Sahaay <span class="brand-soft">Stores</span></a>' +
      '<div class="wz-steps">' + WZ_STEPS.map(function (_, i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('') + '<span style="margin-left:6px">' + (s + 1) + ' / ' + WZ_STEPS.length + '</span></div></div>' +
      '<div class="wz-body">' + body + '</div>' +
      '<div class="wz-nav">' + (s > 0 ? '<button class="btn btn-secondary btn-lg" data-action="wz-back">Back</button>' : '<a class="btn btn-quiet btn-lg" href="#/">Cancel</a>') +
      (s < WZ_STEPS.length - 1
        ? '<button class="btn btn-primary btn-lg" data-action="wz-next"' + (canNext ? '' : ' disabled') + '>Continue</button>'
        : '<button class="btn btn-brand btn-lg" data-action="wz-finish">Create my store</button>') +
      '</div></div>' +
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
    var first = app.querySelector('.wz-body input:not([type=checkbox])');
    if (first && s !== 3 && !first.value) first.focus({ preventScroll: true });
  }

  function finishWizard() {
    var d = wz.d;
    store = migrate(SahaayPresets.buildStore({
      name: d.name, category: d.category, tagline: d.tagline, logo: d.logo, primary: d.primary,
      template: d.template, font: d.font, whatsapp: d.whatsapp, upi: d.upi, cod: d.cod,
      email: d.email, currency: d.currency, samples: d.samples, app: d.app
    }));
    save();
    wz = freshWizard();
    previewData = null;
    location.hash = '#/admin';
    toast('Your store is ready');
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
        return '<a href="#/admin' + (n[0] ? '/' + n[0] : '') + '" class="' + (on ? 'on' : '') + '">' + icon(n[2], mobile ? 20 : 17) + '<span>' + n[1] + '</span>' +
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
      '<div class="store-chip">' + logoBox() + '<div style="min-width:0;flex:1"><b>' + esc(store.name) + '</b><small><i class="' + (store.flags.published ? 'live' : '') + '"></i>' + (store.flags.published ? 'Published' : 'Not published yet') + '</small></div></div>' +
      '<nav class="nav">' + navHtml(sub) + '</nav>' +
      '<div class="side-foot"><a class="btn btn-secondary btn-sm btn-block" href="preview.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View your store</a></div></aside>' +
      '<div class="main-col"><div class="topbar"><div class="crumbs">' + crumb + '</div>' +
      '<a class="btn btn-quiet btn-sm" href="preview.html" target="_blank" rel="noopener">' + icon('external', 15) + 'View store</a>' +
      (sub !== 'publish' ? '<a class="btn btn-primary btn-sm" href="#/admin/publish">' + icon('publish', 15) + 'Publish</a>' : '') + '</div>' +
      '<div class="mobile-top">' + logoBox() + '<b>' + esc(store.name) + '</b><a class="btn btn-secondary btn-sm" href="preview.html" target="_blank" rel="noopener">View store</a></div>' +
      (sub === 'design' ? content : '<main class="main">' + content + '</main>') + '</div>' +
      '<nav class="bottom-nav">' + navHtml(sub, true) + '</nav></div>';

    previewData = null;
    mountViews(app);
  }

  // ---------- home ----------
  function checklist() {
    var s = store;
    var prods = s.products || [];
    return [
      ['Create your store', true, ''],
      ['Add 3 of your own products', prods.filter(function (p) { return !p.sample; }).length >= 3, '#/admin/products/new'],
      ['Add a real product photo', prods.some(function (p) { return p.images && p.images.length; }), '#/admin/products'],
      ['Set up WhatsApp or email for orders', !!(s.contact.whatsapp || s.contact.email), '#/admin/settings'],
      ['Add a payment method', !!(s.payments.upi || s.payments.cod), '#/admin/settings'],
      ['Customise your store design', !!s.flags.designed, '#/admin/design'],
      ['Set up your mobile app', !!(s.app.enabled && s.flags.appVisited), '#/admin/app'],
      ['Place a test order', (s.orders || []).some(function (o) { return o.test; }), 'preview.html'],
      ['Publish your store', !!s.flags.published, '#/admin/publish']
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
      '<div class="page-actions"><a class="btn btn-secondary" href="#/admin/products/new">' + icon('plus', 16) + 'Add product</a></div></div>' +
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
        delete n.sample;
        if (data.images.length) delete n.emoji;
        return n;
      });
    } else {
      data.id = uid('p');
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
      '<div class="callout callout-blue">' + icon('info', 16) + '<span>Orders from your <b>published</b> store arrive on WhatsApp' + (store.contact.email ? ' or email' : '') +
      '. Test orders you place in the <a class="btn-link" href="preview.html" target="_blank">preview</a> show up here so you can practise.</span></div>';
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

  // ---------- design (online store) ----------
  var device = 'desktop';
  var saveTimer;
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
  }

  function switchRow(bind, label, help, checked) {
    return '<div class="switch-row"><div><b>' + label + '</b><small>' + help + '</small></div><label class="switch"><input type="checkbox" data-bind-bool="' + bind + '"' + (checked ? ' checked' : '') + '><span></span></label></div>';
  }

  function pageDesign() {
    var t = store.theme, h = store.hero, m = t.mobile;
    var text = function (path, label, val, opts) {
      opts = opts || {};
      var tag = opts.rows
        ? '<textarea data-bind="' + path + '" rows="' + opts.rows + '" placeholder="' + esc(opts.ph || '') + '">' + esc(val || '') + '</textarea>'
        : '<input data-bind="' + path + '" value="' + esc(val || '') + '" placeholder="' + esc(opts.ph || '') + '" maxlength="' + (opts.max || 200) + '">';
      return '<div class="field"><label>' + label + '</label>' + tag + (opts.help ? '<span class="help">' + opts.help + '</span>' : '') + '</div>';
    };

    var frame = device === 'desktop' ? deviceFrame('desktop', 'preview.html?embed=1', { live: true, interactive: true, h: 900 })
      : deviceFrame(device, 'preview.html?embed=1', { live: true, interactive: true });

    return '<div class="design"><div class="design-panel">' +
      '<div class="card"><h2>Theme</h2>' + themeOptions('set-theme', t.template) +
      '<div class="field" style="margin:16px 0 0"><span class="field-label">Brand colour</span>' + colorSwatches('set-theme', t.primary, 'data-bind="theme.primary"') + '</div>' +
      '<div class="field" style="margin:16px 0 0"><span class="field-label">Typography</span><select data-bind="theme.font">' + FONT_OPTS.map(function (f) {
        return '<option value="' + f[0] + '"' + (t.font === f[0] ? ' selected' : '') + '>' + f[1] + ' — ' + f[2] + '</option>';
      }).join('') + '</select></div></div>' +

      '<div class="card"><h2>Logo</h2><div class="emoji-row" style="margin-bottom:12px">' + LOGO_EMOJIS.map(function (e) {
        return '<button type="button" class="' + (store.logo === e ? 'on' : '') + '" data-action="set-logo" data-v="' + e + '">' + e + '</button>';
      }).join('') + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' + (isImg(store.logo) ? logoBox(store, 'store-logo', 38) : '') +
      '<label class="btn btn-secondary btn-sm">' + icon('image', 15) + 'Upload logo<input type="file" accept="image/*" data-upload="logo" hidden></label>' +
      (isImg(store.logo) ? '<button class="btn-link danger" data-action="set-logo" data-v="' + esc((PRESETS[store.category] || PRESETS.other).emoji) + '">Remove</button>' : '') + '</div></div>' +

      '<div class="card"><h2>Banner</h2>' +
      '<div class="field"><span class="field-label">Layout</span>' + segButtons('set-hero', 'layout', [['split', 'Split'], ['center', 'Centered']], h.layout || 'split') + '</div>' +
      text('hero.eyebrow', 'Eyebrow', h.eyebrow, { max: 40, ph: 'e.g. New season' }) +
      text('hero.heading', 'Headline', h.heading, { max: 90 }) +
      text('hero.subheading', 'Subheading', h.subheading, { max: 160 }) +
      text('hero.cta', 'Button label', h.cta, { max: 30 }) +
      '<div class="field" style="margin-bottom:0"><span class="field-label">Image <span class="optional">(optional)</span></span>' +
      (h.image ? '<div class="img-tile" style="aspect-ratio:16/9;margin-bottom:8px"><img src="' + esc(h.image) + '" alt=""><button type="button" style="opacity:1" data-action="rm-hero" aria-label="Remove">' + icon('x', 14) + '</button></div>' : '') +
      '<label class="btn btn-secondary btn-sm">' + icon('image', 15) + (h.image ? 'Replace image' : 'Upload image') + '<input type="file" accept="image/*" data-upload="hero" hidden></label>' +
      '<span class="help">Without an image, the split layout shows a collage of your first products.</span></div></div>' +

      '<div class="card"><h2>Content</h2>' +
      text('announcement', 'Announcement bar', store.announcement, { ph: 'e.g. Free delivery on orders over ₹999', help: 'Leave empty to hide.' }) +
      text('productsHeading', 'Products heading', store.productsHeading, { max: 60 }) +
      text('about', 'About your shop', store.about, { rows: 4, ph: 'Tell customers your story.' }) + '</div>' +

      '<div class="card"><h2>Mobile</h2><p class="card-sub">How your store behaves on phones. Switch the preview to Phone to see it.</p>' +
      switchRow('theme.mobile.bottomNav', 'Bottom navigation bar', 'App-style tabs for Home, Shop, Search, Cart and Chat', m.bottomNav !== false) +
      switchRow('theme.mobile.stickyBuy', 'Sticky “Add to cart” bar', 'Keeps the buy button in reach on product pages', m.stickyBuy !== false) +
      '<div class="field" style="margin:14px 0 0"><span class="field-label">Products per row on phones</span>' + segButtons('set-mobile', 'columns', [['1', 'One (large)'], ['2', 'Two (grid)']], String(m.columns === 1 ? 1 : 2)) + '</div></div>' +
      '</div>' +

      '<div class="design-stage"><div class="stage-bar"><div class="seg">' +
      [['desktop', 'Desktop'], ['tablet', 'Tablet'], ['phone', 'Phone']].map(function (d) {
        return '<button class="' + (device === d[0] ? 'on' : '') + '" data-action="device" data-v="' + d[0] + '">' + icon(d[0], 15) + '<span class="hide-sm">' + d[1] + '</span></button>';
      }).join('') + '</div><div class="stage-status"><i></i><span>All changes saved</span></div></div>' +
      '<div class="stage"><div style="width:100%;display:flex;justify-content:center">' + frame + '</div></div></div></div>';
  }

  function setPath(path, val) {
    var parts = path.split('.'), o = store;
    for (var i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] || {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = val;
  }

  // ---------- mobile app ----------
  var appView = 'home';

  function iconInner(fill) {
    if (store.app.icon) return '<img src="' + esc(store.app.icon) + '" alt="" style="width:100%;height:100%;border-radius:inherit;object-fit:cover">';
    if (isImg(store.logo)) return '<img src="' + esc(store.logo) + '" alt="" style="width:' + (fill ? '100%' : '62%') + ';height:' + (fill ? '100%' : '62%') + ';border-radius:18%;object-fit:cover">';
    return esc(store.logo);
  }

  function homeScreenMock() {
    var others = [['#E9E4DC', '📷'], ['#DDE7F2', '🗓️'], ['#E4EFE3', '🗺️'], ['#F3E3E6', '🎵'], ['#EFE9DD', '☀️'], ['#E2E0F0', '📝']];
    return '<div class="mock-phone"><div class="phone-notch"></div><div class="homescreen"><div class="hs"><div class="hs-time">9:41</div><div class="hs-grid">' +
      others.map(function (o) { return '<span style="background:' + o[0] + '">' + o[1] + '</span>'; }).join('') +
      '<span class="hs-app" style="background:' + esc(store.app.bg || store.theme.primary) + ';animation:none">' + iconInner() +
      '<em>' + esc(store.app.shortName || store.name) + '</em></span><span style="background:#E6EEE9">🧮</span></div>' +
      '<div class="hs-dock"><span style="background:#DCEBDD">📞</span><span style="background:#DDE6F3">💬</span><span style="background:#F1E4DA">🌐</span><span style="background:#ECE6F3">⚙️</span></div></div></div></div>';
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
  function pagePublish() {
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

  var FONT_LINKS = {
    modern: 'family=Inter:wght@400;500;600;700',
    geometric: 'family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800',
    elegant: 'family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700',
    luxe: 'family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700',
    friendly: 'family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700;800'
  };

  function fetchText(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.text(); });
  }

  function buildSite(pwa) {
    return Promise.all([fetchText('storefront.css'), fetchText('storefront.js')]).then(function (res) {
      var pub = JSON.parse(JSON.stringify(store));
      delete pub.orders;   // customer data never goes into the public site
      delete pub.flags;
      if (!pwa) pub.app = Object.assign({}, pub.app, { enabled: false });
      // Escape so the JSON can't close the <script> tag or break on line separators.
      var data = JSON.stringify(pub).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      var title = store.name + (store.tagline ? ' — ' + store.tagline : '');
      var desc = store.tagline || (store.about || '').slice(0, 160) || ('Shop online at ' + store.name);
      var favicon = isImg(store.logo)
        ? store.logo
        : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + (store.logo || '🛍️') + '</text></svg>');
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
        '<link href="https://fonts.googleapis.com/css2?' + (FONT_LINKS[store.theme.font] || FONT_LINKS.modern) + '&display=swap" rel="stylesheet">\n' +
        '<style>\nhtml,body{margin:0;background:#fff;}\n' + res[0] + '\n</style>\n</head>\n<body>\n' +
        '<div id="sf-root"><noscript>' + esc(store.name) + ' needs JavaScript turned on to show products.</noscript></div>\n' +
        '<!-- Built with Sahaay Stores -->\n<script>\n' + res[1] + '\n</script>\n' +
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
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Draws the app icon: uploaded icon (cover), or logo/emoji on the brand colour.
  function renderIcon(size, maskable) {
    var a = store.app, bg = a.bg || store.theme.primary;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var x = c.getContext('2d');
    x.fillStyle = bg;
    x.fillRect(0, 0, size, size);
    var src = a.icon || (isImg(store.logo) ? store.logo : null);
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
    }) : Promise.resolve().then(function () {
      x.font = Math.round(size * (maskable ? 0.44 : 0.56)) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(store.logo || '🛍️', size / 2, size / 2 + size * 0.035);
    });
    return done.then(function () {
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

    switch (a) {
      // wizard
      case 'wz-cat': applyPreset(t.getAttribute('data-cat')); renderWizard(); break;
      case 'wz-set': wz.d[t.getAttribute('data-k')] = t.getAttribute('data-v'); renderWizard(); break;
      case 'wz-next':
        if (wz.step === 0 && (!wz.d.name.trim() || !wz.d.category)) return;
        wz.step++; renderWizard(); window.scrollTo(0, 0); break;
      case 'wz-back': wz.step--; renderWizard(); break;
      case 'wz-finish': finishWizard(); break;

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
      case 'del-order':
        if (!confirm('Delete this order?')) return;
        store.orders = store.orders.filter(function (o) { return o.id !== id; });
        save(); render(); break;

      // design
      case 'set-theme':
        store.theme[t.getAttribute('data-k')] = t.getAttribute('data-v');
        markOn(t);
        if (t.getAttribute('data-k') === 'primary') { var ci = t.parentNode.querySelector('input[type=color]'); if (ci) ci.value = t.getAttribute('data-v'); }
        scheduleSave();
        break;
      case 'set-hero': store.hero[t.getAttribute('data-k')] = t.getAttribute('data-v'); markOn(t); scheduleSave(); break;
      case 'set-mobile': store.theme.mobile.columns = Number(t.getAttribute('data-v')); markOn(t); scheduleSave(); break;
      case 'set-logo': store.logo = t.getAttribute('data-v'); store.flags.designed = true; save(); render(); break;
      case 'rm-hero': store.hero.image = ''; save(); render(); break;
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
      if (wzKey === 'name') {
        var btn = app.querySelector('[data-action="wz-next"]');
        if (btn) btn.disabled = !(wz.d.name.trim() && wz.d.category);
      }
      if (wzKey === 'primary') app.querySelectorAll('.swatch.on').forEach(function (x) { x.classList.remove('on'); });
      updateWizardPreview();
      return;
    }
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
      if (o) { o.status = t.value; save(); toast('Marked as ' + t.options[t.selectedIndex].text.toLowerCase()); render(); }
      return;
    }

    var up = t.getAttribute('data-upload');
    if (!up || !t.files || !t.files.length) return;
    var files = Array.prototype.slice.call(t.files);

    if (up === 'product') {
      files = files.slice(0, 4 - draftImages.length);
      Promise.all(files.map(function (f) { return compressImage(f, 1200, 0.8).catch(function () { return null; }); })).then(function (urls) {
        urls.forEach(function (u) { if (u) draftImages.push(u); });
        if (urls.some(function (u) { return !u; })) toast('Some files weren\'t images and were skipped', 'alert');
        var box = document.getElementById('pf-imgs');
        if (box) box.innerHTML = imgTiles();
      });
    } else if (up === 'logo') {
      compressImage(files[0], 256, 0.9).then(function (u) {
        store.logo = u; store.flags.designed = true; save(); render();
      }).catch(function () { toast('Please choose an image file', 'alert'); });
    } else if (up === 'app-icon') {
      compressImage(files[0], 512, 0.92).then(function (u) {
        store.app.icon = u; if (save()) render(); else store.app.icon = '';
      }).catch(function () { toast('Please choose an image file', 'alert'); });
    } else if (up === 'hero') {
      compressImage(files[0], 1800, 0.8).then(function (u) {
        store.hero.image = u; store.flags.designed = true;
        if (save()) render(); else store.hero.image = '';
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
})();
