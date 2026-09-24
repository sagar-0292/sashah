/* Sahaay Stores — storefront renderer.
 * Self-contained: used for the live preview inside the builder, the landing
 * page mockups, AND inlined verbatim into every exported store, so it must
 * not depend on anything from app.js.
 *
 *   SahaayStorefront.mount(rootEl, store, {
 *     mode: 'preview' | 'live',
 *     onOrder: fn(order),        // called after checkout
 *     standalone: bool,          // render as an installed app
 *     forceInstall: bool,        // always show the install banner (app preview)
 *     inert: bool                // decorative mockup: no interaction
 *   })
 */
(function (global) {
  'use strict';

  var FONTS = {
    modern: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    elegant: "'Playfair Display', Georgia, serif",
    friendly: "'Nunito', 'Inter', system-ui, sans-serif",
    luxe: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    geometric: "'Manrope', 'Inter', system-ui, sans-serif"
  };

  var ICONS = {
    bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    minus: '<path d="M6 12h12"/>',
    plus: '<path d="M12 6v12M6 12h12"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 12v8h12v-8"/>'
  };
  function icon(name, size) {
    return '<svg class="sf-i" viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) +
      '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(amount, currency) {
    var cur = currency || 'INR';
    try {
      return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : undefined, {
        style: 'currency', currency: cur,
        maximumFractionDigits: Number(amount) % 1 === 0 ? 0 : 2
      }).format(Number(amount) || 0);
    } catch (e) {
      return cur + ' ' + (Number(amount) || 0).toFixed(2);
    }
  }

  function hue(seed) {
    var h = 0, str = String(seed || 'x');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }

  // Products without photos get a soft "studio shot": a muted backdrop, the
  // product's emoji (or initial) as the object, and a floor shadow.
  function visual(p, cls, i) {
    var imgs = p.images || [];
    if (imgs.length) {
      var src = imgs[Math.min(i || 0, imgs.length - 1)];
      return '<img class="' + cls + '" src="' + esc(src) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async">';
    }
    var h = hue(p.title || p.id);
    var label = p.emoji || (p.title || '?').trim().charAt(0).toUpperCase();
    return '<div class="' + cls + ' sf-ph' + (p.emoji ? '' : ' sf-ph-letter') + '" style="--ph-a:hsl(' + h + ' 28% 94%);--ph-b:hsl(' + ((h + 25) % 360) + ' 22% 84%)" role="img" aria-label="' + esc(p.title) + '"><span>' + esc(label) + '</span></div>';
  }

  // Pick black or white text for a brand colour so buttons stay readable.
  function onColor(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return '#fff';
    var n = parseInt(m[1], 16);
    var lum = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var L = 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
    return L > 0.4 ? '#111' : '#fff';
  }

  // Logos are either an emoji or an image (uploaded URL or inline data).
  function isImgUrl(s) { return /^(data:|https?:|\/)/.test(String(s || '')); }

  function inStock(p) { return p.stock == null || p.stock === '' || Number(p.stock) > 0; }
  function maxQty(p) { return (p.stock == null || p.stock === '') ? 99 : Math.max(0, Number(p.stock)); }
  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }

  function orderId() {
    var d = new Date();
    return 'ORD-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  // One install prompt per page, shared by every mounted store.
  var installEvt = null;
  var installListeners = [];
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      installEvt = e;
      installListeners.forEach(function (fn) { fn(); });
    });
  }

  function mount(root, store, opts) {
    opts = opts || {};
    var mode = opts.mode || 'live';
    var cartKey = 'sahaay-cart:' + (store.id || 'store');
    var state = {
      cart: loadCart(),
      query: '',
      category: '',
      modal: null,        // { type: 'product'|'checkout'|'done', id?, order? }
      drawer: false,
      shownDrawer: false,
      shownModal: null,
      qty: 1,
      imgIdx: 0,
      installHidden: readDismissed()
    };
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = !!opts.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

    if (!opts.inert) installListeners.push(function () { render(); });

    function loadCart() {
      if (mode !== 'live') return [];
      try { return JSON.parse(localStorage.getItem(cartKey)) || []; } catch (e) { return []; }
    }
    function saveCart() {
      if (mode !== 'live') return;
      try { localStorage.setItem(cartKey, JSON.stringify(state.cart)); } catch (e) { /* storage unavailable */ }
    }
    function readDismissed() {
      if (opts.forceInstall) return false;
      try { return localStorage.getItem('sahaay-install-dismissed:' + store.id) === '1'; } catch (e) { return false; }
    }

    function products() {
      return (store.products || []).filter(function (p) { return p.active !== false; });
    }
    function findProduct(id) {
      return (store.products || []).filter(function (p) { return p.id === id; })[0];
    }
    function categories() {
      var cats = [];
      products().forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      return cats;
    }
    function cartLines() {
      return state.cart.map(function (l) {
        var p = findProduct(l.id);
        return p ? { p: p, qty: Math.min(l.qty, maxQty(p)) } : null;
      }).filter(function (l) { return l && l.qty > 0; });
    }
    function totals() {
      var sub = cartLines().reduce(function (s, l) { return s + Number(l.p.price) * l.qty; }, 0);
      var sh = store.shipping || {};
      var ship = Number(sh.flat) || 0;
      if (sub === 0 || (Number(sh.freeAbove) > 0 && sub >= Number(sh.freeAbove))) ship = 0;
      return { subtotal: sub, shipping: ship, total: sub + ship };
    }
    function cartCount() {
      return cartLines().reduce(function (s, l) { return s + l.qty; }, 0);
    }
    function addToCart(id, qty) {
      var p = findProduct(id);
      if (!p || !inStock(p)) return;
      var line = state.cart.filter(function (l) { return l.id === id; })[0];
      if (line) line.qty = Math.min(maxQty(p), line.qty + qty);
      else state.cart.push({ id: id, qty: Math.min(maxQty(p), qty) });
      saveCart();
    }
    function cur(n) { return money(n, store.currency); }
    function mob() { return (store.theme && store.theme.mobile) || {}; }

    function logoMark(cls) {
      return isImgUrl(store.logo)
        ? '<img src="' + esc(store.logo) + '" alt="" class="' + cls + ' sf-logo-img">'
        : '<span class="' + cls + ' sf-logo-emoji">' + esc(store.logo || '🛍️') + '</span>';
    }

    function priceHtml(p, cls) {
      var sale = Number(p.compareAt) > Number(p.price);
      return '<div class="sf-price ' + (cls || '') + '"><span' + (sale ? ' class="sf-price-sale"' : '') + '>' + cur(p.price) + '</span>' +
        (sale ? '<s>' + cur(p.compareAt) + '</s><em>−' + Math.round((1 - Number(p.price) / Number(p.compareAt)) * 100) + '%</em>' : '') + '</div>';
    }

    function deliveryLine() {
      var sh = store.shipping || {};
      return Number(sh.freeAbove) > 0 ? 'Free delivery over ' + cur(sh.freeAbove) : !Number(sh.flat) ? 'Free delivery' : 'Delivery ' + cur(sh.flat);
    }
    function paymentLine() {
      var pay = store.payments || {};
      if (!pay.upi && !pay.cod) return '';
      return pay.upi && pay.cod ? 'UPI or cash on delivery' : pay.upi ? 'Secure UPI payments' : 'Cash on delivery';
    }

    // ---------- sections ----------
    function header() {
      var count = cartCount();
      var cats = categories();
      return (store.announcement ? '<div class="sf-announce">' + esc(store.announcement) + '</div>' : '') +
        '<header class="sf-header"><div class="sf-wrap sf-header-in">' +
        '<a class="sf-brand" href="#" data-sf="home">' + logoMark('sf-logo') + '<span class="sf-brand-name">' + esc(store.name || 'My Store') + '</span></a>' +
        '<nav class="sf-nav"><a href="#sf-products" data-sf="cat-nav" data-cat="">Shop all</a>' +
        (cats.length > 1 ? cats.slice(0, 3).map(function (c) { return '<a href="#sf-products" data-sf="cat-nav" data-cat="' + esc(c) + '">' + esc(c) + '</a>'; }).join('') : '') +
        (store.about || (store.owner && store.owner.bio) ? '<a href="#sf-about" data-sf="scroll" data-to="sf-about">About</a>' : '') +
        '<a href="#sf-footer" data-sf="scroll" data-to="sf-footer">Contact</a></nav>' +
        '<div class="sf-header-actions"><button class="sf-icon-btn sf-hide-sm" data-sf="focus-search" aria-label="Search">' + icon('search') + '</button>' +
        '<button class="sf-icon-btn sf-cart-btn" data-sf="open-cart" aria-label="Cart, ' + count + ' items">' + icon('bag') +
        (count ? '<span class="sf-badge">' + count + '</span>' : '') + '</button></div></div></header>';
    }

    function hero() {
      var h = store.hero || {};
      var layout = h.layout || 'split';
      var sub = h.subheading || store.tagline;
      var text = '<div class="sf-hero-text">' +
        (h.eyebrow ? '<div class="sf-eyebrow">' + esc(h.eyebrow) + '</div>' : '') +
        '<h1>' + esc(h.heading || store.name) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') +
        '<div class="sf-hero-cta"><a href="#sf-products" class="sf-btn sf-btn-lg" data-sf="scroll" data-to="sf-products">' + esc(h.cta || 'Shop now') + ' ' + icon('arrow', 18) + '</a></div></div>';

      if (layout === 'split') {
        var media;
        if (h.image) media = '<img class="sf-hero-photo" src="' + esc(h.image) + '" alt="">';
        else {
          var feat = products().slice(0, 3);
          if (!feat.length && isImgUrl(store.logo)) {
            // A brand-new store with no products yet: feature the logo.
            media = '<div class="sf-collage sf-collage-1"><div class="sf-collage-item sf-collage-logo"><img src="' + esc(store.logo) + '" alt="' + esc(store.name) + '"></div></div>';
          } else {
            if (!feat.length) feat = [{ id: store.name, title: store.name, emoji: store.logo || '' }];
            media = '<div class="sf-collage sf-collage-' + feat.length + '">' + feat.map(function (p) {
              return '<div class="sf-collage-item">' + visual(p, 'sf-collage-img') + '</div>';
            }).join('') + '</div>';
          }
        }
        return '<section class="sf-hero sf-hero-split"><div class="sf-wrap sf-hero-grid">' + text + '<div class="sf-hero-media">' + media + '</div></div></section>';
      }
      var bg = h.image ? ' style="background-image:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.55)),url(\'' + esc(h.image) + '\')"' : '';
      return '<section class="sf-hero sf-hero-center' + (h.image ? ' sf-hero-img' : '') + '"' + bg + '><div class="sf-wrap">' + text + '</div></section>';
    }

    function trust() {
      var c = store.contact || {};
      var items = [['truck', deliveryLine(), 'Packed with care']];
      if (paymentLine()) items.push(['shield', paymentLine(), 'No card needed']);
      if (c.whatsapp) items.push(['chat', 'Order on WhatsApp', 'Real people, quick replies']);
      else if (c.email) items.push(['chat', 'Friendly support', esc(c.email)]);
      return '<section class="sf-trust"><div class="sf-wrap sf-trust-in">' + items.map(function (t) {
        return '<div class="sf-trust-item">' + icon(t[0], 22) + '<div><b>' + esc(t[1]) + '</b><span>' + t[2] + '</span></div></div>';
      }).join('') + '</div></section>';
    }

    function card(p) {
      var sale = Number(p.compareAt) > Number(p.price);
      var two = p.images && p.images.length > 1;
      return '<article class="sf-card" data-sf="view" data-id="' + esc(p.id) + '" tabindex="0" aria-label="' + esc(p.title) + '">' +
        '<div class="sf-card-media' + (two ? ' sf-has-alt' : '') + '">' + visual(p, 'sf-card-img') + (two ? visual(p, 'sf-card-img sf-card-alt', 1) : '') +
        (!inStock(p) ? '<span class="sf-tag sf-tag-out">Sold out</span>' : sale ? '<span class="sf-tag">Sale</span>' : '') +
        (inStock(p) ? '<button class="sf-quick" data-sf="quick-add" data-id="' + esc(p.id) + '" aria-label="Add ' + esc(p.title) + ' to cart">' + icon('plus', 18) + '<span>Quick add</span></button>' : '') +
        '</div><div class="sf-card-body">' + (p.category ? '<div class="sf-card-cat">' + esc(p.category) + '</div>' : '') +
        '<h3>' + esc(p.title) + '</h3>' + priceHtml(p) + '</div></article>';
    }

    function productGrid() {
      var all = products();
      var cats = categories();
      var q = state.query.trim().toLowerCase();
      var list = all.filter(function (p) {
        if (state.category && p.category !== state.category) return false;
        if (q && (p.title + ' ' + (p.description || '') + ' ' + (p.category || '')).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });

      var chips = cats.length > 1 ? '<div class="sf-chips">' +
        '<button class="sf-chip' + (!state.category ? ' on' : '') + '" data-sf="cat" data-cat="">All</button>' +
        cats.map(function (c) {
          return '<button class="sf-chip' + (state.category === c ? ' on' : '') + '" data-sf="cat" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
        }).join('') + '</div>' : '';

      var empty = !all.length
        ? '<p class="sf-empty">New products are coming soon.</p>'
        : !list.length ? '<p class="sf-empty">Nothing matches your search.</p>' : '';

      return '<section class="sf-section" id="sf-products"><div class="sf-wrap">' +
        '<div class="sf-section-head"><div><div class="sf-eyebrow">' + all.length + ' product' + (all.length === 1 ? '' : 's') + '</div><h2>' + esc(store.productsHeading || 'Our products') + '</h2></div>' +
        '<label class="sf-search">' + icon('search', 18) + '<input type="search" placeholder="Search" value="' + esc(state.query) + '" data-sf-input="search" aria-label="Search products"></label>' +
        '</div>' + chips + '<div class="sf-grid">' + list.map(card).join('') + '</div>' + empty + '</div></section>';
    }

    function about() {
      var o = store.owner || {};
      var story = store.about ? '<div class="sf-wrap sf-about-in"><div class="sf-eyebrow">Our story</div>' +
        '<p class="sf-about-text">' + esc(store.about).replace(/\n/g, '<br>') + '</p></div>' : '';
      var initials = String(o.name || store.name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
      var owner = o.bio ? '<div class="sf-wrap"><div class="sf-owner">' +
        '<div class="sf-owner-photo">' + (o.photo ? '<img src="' + esc(o.photo) + '" alt="' + esc(o.name || '') + '" loading="lazy">' : '<span>' + esc(initials) + '</span>') + '</div>' +
        '<div class="sf-owner-text"><div class="sf-eyebrow">Meet the ' + (o.role ? esc(o.role) : 'owner') + '</div>' +
        (o.name ? '<h3>' + esc(o.name) + '</h3>' : '') + '<p>' + esc(o.bio).replace(/\n/g, '<br>') + '</p></div></div></div>' : '';
      if (!story && !owner) return '';
      return '<section class="sf-section sf-about" id="sf-about">' + story + owner + '</section>';
    }

    function footer() {
      var c = store.contact || {};
      var links = [];
      if (c.whatsapp) links.push('<a href="https://wa.me/' + waDigits(c.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>');
      if (c.phone) links.push('<a href="tel:' + esc(c.phone) + '">' + esc(c.phone) + '</a>');
      if (c.email) links.push('<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>');
      if (c.instagram) links.push('<a href="https://instagram.com/' + esc(String(c.instagram).replace(/^@/, '')) + '" target="_blank" rel="noopener">Instagram</a>');
      var cats = categories();
      return '<footer class="sf-footer" id="sf-footer"><div class="sf-wrap"><div class="sf-footer-grid">' +
        '<div class="sf-footer-brand"><div class="sf-brand">' + logoMark('sf-logo') + '<span class="sf-brand-name">' + esc(store.name) + '</span></div>' +
        (store.tagline ? '<p>' + esc(store.tagline) + '</p>' : '') + '</div>' +
        '<div class="sf-footer-col"><h4>Shop</h4><a href="#sf-products" data-sf="cat-nav" data-cat="">All products</a>' + cats.slice(0, 5).map(function (x) {
          return '<a href="#sf-products" data-sf="cat-nav" data-cat="' + esc(x) + '">' + esc(x) + '</a>';
        }).join('') + '</div>' +
        '<div class="sf-footer-col"><h4>Contact</h4>' + (links.join('') || '<span>—</span>') + (c.address ? '<address>' + esc(c.address).replace(/\n/g, '<br>') + '</address>' : '') + '</div>' +
        '</div><div class="sf-footer-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(store.name) + '</span>' + (opts.poweredUrl ? '<a href="' + esc(opts.poweredUrl) + '" target="_blank" rel="noopener">Powered by Sahaay Stores</a>' : '<span>Powered by Sahaay Stores</span>') + '</div></div></footer>';
    }

    function bottomNav() {
      if (mob().bottomNav === false && !standalone) return '';
      var c = store.contact || {};
      var count = cartCount();
      return '<nav class="sf-bottom-nav" aria-label="Store">' +
        '<button data-sf="home">' + icon('home') + '<span>Home</span></button>' +
        '<button data-sf="scroll" data-to="sf-products">' + icon('grid') + '<span>Shop</span></button>' +
        '<button data-sf="focus-search">' + icon('search') + '<span>Search</span></button>' +
        '<button data-sf="open-cart" class="sf-bn-cart">' + icon('bag') + (count ? '<i>' + count + '</i>' : '') + '<span>Cart</span></button>' +
        (c.whatsapp ? '<a href="https://wa.me/' + waDigits(c.whatsapp) + '" target="_blank" rel="noopener">' + icon('chat') + '<span>Chat</span></a>' : '') +
        '</nav>';
    }

    function installBanner() {
      var app = store.app || {};
      if (!app.enabled || app.banner === false || standalone || state.installHidden) return '';
      if (!(opts.forceInstall || installEvt || isIOS)) return '';
      var iosHint = isIOS && !installEvt && !opts.forceInstall;
      return '<div class="sf-install" role="dialog" aria-label="Install app">' +
        '<div class="sf-install-icon" style="background:' + esc(app.bg || (store.theme || {}).primary || '#111') + '">' + (app.icon ? '<img src="' + esc(app.icon) + '" alt="">' : logoMark('sf-install-mark')) + '</div>' +
        '<div class="sf-install-text"><b>Get the ' + esc(app.name || store.name) + ' app</b><span>' + (iosHint ? 'Tap ' + icon('share', 14) + ' then “Add to Home Screen”' : 'Shop faster from your home screen') + '</span></div>' +
        (iosHint ? '' : '<button class="sf-btn sf-btn-sm" data-sf="install">Install</button>') +
        '<button class="sf-install-x" data-sf="install-dismiss" aria-label="Dismiss">' + icon('x', 16) + '</button></div>';
    }

    function drawer() {
      var lines = cartLines();
      var t = totals();
      var sh = store.shipping || {};
      // A freshly opened drawer renders closed first so it can slide in (see render()).
      var open = state.drawer && state.shownDrawer;
      var body = lines.length ? lines.map(function (l) {
        return '<div class="sf-line"><div class="sf-line-media">' + visual(l.p, 'sf-line-img') + '</div>' +
          '<div class="sf-line-info"><div class="sf-line-top"><div class="sf-line-title">' + esc(l.p.title) + '</div><div class="sf-line-sum">' + cur(l.p.price * l.qty) + '</div></div>' +
          '<div class="sf-line-price">' + cur(l.p.price) + ' each</div>' +
          '<div class="sf-line-bottom"><div class="sf-stepper"><button data-sf="dec" data-id="' + esc(l.p.id) + '" aria-label="Decrease">' + icon('minus', 16) + '</button>' +
          '<span>' + l.qty + '</span><button data-sf="inc" data-id="' + esc(l.p.id) + '" aria-label="Increase"' + (l.qty >= maxQty(l.p) ? ' disabled' : '') + '>' + icon('plus', 16) + '</button></div>' +
          '<button class="sf-line-rm" data-sf="rm" data-id="' + esc(l.p.id) + '">Remove</button></div></div></div>';
      }).join('') : '<div class="sf-cart-empty">' + icon('bag', 40) + '<p>Your cart is empty</p><button class="sf-btn" data-sf="close-cart">Start shopping</button></div>';

      var progress = '';
      if (Number(sh.freeAbove) > 0 && t.subtotal > 0) {
        var pct = Math.min(100, t.subtotal / Number(sh.freeAbove) * 100);
        progress = '<div class="sf-free"><div>' + (pct >= 100 ? 'You\'ve unlocked <b>free delivery</b>' : 'Add <b>' + cur(Number(sh.freeAbove) - t.subtotal) + '</b> more for free delivery') + '</div>' +
          '<div class="sf-free-bar"><i style="width:' + pct + '%"></i></div></div>';
      }

      return '<div class="sf-overlay' + (open ? ' open' : '') + '" data-sf="close-cart"></div>' +
        '<aside class="sf-drawer' + (open ? ' open' : '') + '" aria-hidden="' + !state.drawer + '" aria-label="Cart">' +
        '<div class="sf-drawer-head"><h2>Your cart' + (lines.length ? ' <span>(' + cartCount() + ')</span>' : '') + '</h2><button class="sf-icon-btn" data-sf="close-cart" aria-label="Close">' + icon('x') + '</button></div>' +
        progress + '<div class="sf-drawer-body">' + body + '</div>' +
        (lines.length ? '<div class="sf-drawer-foot">' + summaryRows(t) +
          '<button class="sf-btn sf-btn-block sf-btn-lg" data-sf="checkout">Checkout · ' + cur(t.total) + '</button></div>' : '') +
        '</aside>';
    }

    function summaryRows(t) {
      return '<div class="sf-sum"><span>Subtotal</span><span>' + cur(t.subtotal) + '</span></div>' +
        '<div class="sf-sum"><span>Delivery</span><span>' + (t.shipping ? cur(t.shipping) : 'Free') + '</span></div>' +
        '<div class="sf-sum sf-sum-total"><span>Total</span><span>' + cur(t.total) + '</span></div>';
    }

    function productModal(p) {
      var imgs = p.images && p.images.length ? p.images : null;
      var idx = Math.min(state.imgIdx, imgs ? imgs.length - 1 : 0);
      var media = visual(p, 'sf-pd-img', idx) +
        (imgs && imgs.length > 1 ? '<div class="sf-thumbs">' + imgs.map(function (src, i) {
          return '<button class="sf-thumb' + (i === idx ? ' on' : '') + '" data-sf="img" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(src) + '" alt=""></button>';
        }).join('') + '</div>' : '');
      var ok = inStock(p);
      var low = ok && p.stock != null && p.stock !== '' && Number(p.stock) <= 5;
      var related = products().filter(function (x) { return x.id !== p.id; })
        .sort(function (a, b) { return (b.category === p.category) - (a.category === p.category); }).slice(0, 4);
      var sticky = mob().stickyBuy !== false;
      return '<div class="sf-pd"><div class="sf-pd-media">' + media + '</div><div class="sf-pd-info">' +
        (p.category ? '<div class="sf-eyebrow">' + esc(p.category) + '</div>' : '') +
        '<h2>' + esc(p.title) + '</h2>' + priceHtml(p, 'sf-price-lg') +
        (low ? '<div class="sf-stock sf-stock-low"><i></i>Only ' + Number(p.stock) + ' left</div>' : ok ? '<div class="sf-stock"><i></i>In stock</div>' : '') +
        (ok
          ? '<div class="sf-pd-actions' + (sticky ? ' sf-sticky-buy' : '') + '"><div class="sf-stepper sf-stepper-lg"><button data-sf="qty-dec" aria-label="Decrease">' + icon('minus', 18) + '</button><span>' + state.qty + '</span><button data-sf="qty-inc" aria-label="Increase">' + icon('plus', 18) + '</button></div>' +
            '<button class="sf-btn sf-btn-lg" data-sf="add" data-id="' + esc(p.id) + '">Add to cart</button></div>' +
            '<button class="sf-btn sf-btn-ghost sf-btn-block sf-btn-lg sf-buy-now" data-sf="buy" data-id="' + esc(p.id) + '">Buy it now</button>'
          : '<button class="sf-btn sf-btn-block sf-btn-lg" disabled>Sold out</button>') +
        (p.description ? '<div class="sf-pd-desc"><h4>Details</h4><p>' + esc(p.description).replace(/\n/g, '<br>') + '</p></div>' : '') +
        '<div class="sf-pd-perks"><div>' + icon('truck', 18) + '<span>' + esc(deliveryLine()) + '</span></div>' +
        (paymentLine() ? '<div>' + icon('shield', 18) + '<span>' + esc(paymentLine()) + '</span></div>' : '') + '</div>' +
        '</div></div>' +
        (related.length ? '<div class="sf-related"><h3>You may also like</h3><div class="sf-grid sf-grid-4">' + related.map(card).join('') + '</div></div>' : '');
    }

    function checkoutModal() {
      var t = totals();
      var pay = store.payments || {};
      var methods = [];
      if (pay.upi) methods.push(['upi', 'UPI', 'GPay, PhonePe, Paytm or any UPI app']);
      if (pay.cod) methods.push(['cod', 'Cash on delivery', 'Pay when your order arrives']);
      if (!methods.length) methods.push(['confirm', 'Confirm with seller', 'We\'ll share payment details with you']);
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem('sahaay-buyer') || '{}'); } catch (e) { /* ignore */ }
      return '<form class="sf-checkout" data-sf-form="checkout"><h2>Checkout</h2>' +
        '<div class="sf-co-grid"><div class="sf-co-form">' +
        '<h4>Contact</h4>' +
        '<label class="sf-field"><span>Full name</span><input name="name" required autocomplete="name" value="' + esc(saved.name || '') + '"></label>' +
        '<label class="sf-field"><span>Phone number</span><input name="phone" required type="tel" autocomplete="tel" value="' + esc(saved.phone || '') + '"></label>' +
        '<h4>Delivery</h4>' +
        '<label class="sf-field"><span>Address</span><textarea name="address" required rows="3" autocomplete="street-address">' + esc(saved.address || '') + '</textarea></label>' +
        '<label class="sf-field"><span>Note for the seller (optional)</span><input name="note"></label>' +
        '<h4>Payment</h4><div class="sf-pay">' + methods.map(function (m, i) {
          return '<label class="sf-radio"><input type="radio" name="payment" value="' + m[0] + '"' + (i === 0 ? ' checked' : '') + '>' +
            '<span><b>' + m[1] + '</b><small>' + m[2] + '</small></span></label>';
        }).join('') + '</div></div>' +
        '<div class="sf-order-box"><h4>Order summary</h4>' + cartLines().map(function (l) {
          return '<div class="sf-os-line"><div class="sf-os-media">' + visual(l.p, 'sf-line-img') + '<i>' + l.qty + '</i></div><span>' + esc(l.p.title) + '</span><b>' + cur(l.p.price * l.qty) + '</b></div>';
        }).join('') + '<div class="sf-os-sums">' + summaryRows(t) + '</div>' +
        '<div class="sf-form-error" role="alert" hidden></div>' +
        '<button class="sf-btn sf-btn-block sf-btn-lg" type="submit">Place order</button>' +
        '<p class="sf-fine">You\'ll confirm your order with ' + esc(store.name) + ' on the next screen.</p></div></div></form>';
    }

    function orderMessage(o) {
      var lines = ['Hi ' + store.name + ', I\'d like to place an order.', '', 'Order: ' + o.id];
      o.items.forEach(function (i) { lines.push('• ' + i.title + ' × ' + i.qty + ' = ' + cur(i.price * i.qty)); });
      lines.push('Delivery: ' + (o.shipping ? cur(o.shipping) : 'Free'));
      lines.push('Total: ' + cur(o.total));
      lines.push('Payment: ' + ({ upi: 'UPI', cod: 'Cash on delivery', confirm: 'To be confirmed' })[o.payment]);
      lines.push('', 'Name: ' + o.customer.name, 'Phone: ' + o.customer.phone, 'Address: ' + o.customer.address);
      if (o.customer.note) lines.push('Note: ' + o.customer.note);
      return lines.join('\n');
    }

    function doneModal(o) {
      var c = store.contact || {};
      var pay = store.payments || {};
      var msg = encodeURIComponent(orderMessage(o));
      var actions = [];
      if (c.whatsapp) {
        actions.push('<a class="sf-btn sf-btn-block sf-btn-lg sf-btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + waDigits(c.whatsapp) + '?text=' + msg + '">' + icon('chat', 20) + ' Send order on WhatsApp</a>');
      }
      if (o.payment === 'upi' && pay.upi) {
        var upi = 'upi://pay?pa=' + encodeURIComponent(pay.upi) + '&pn=' + encodeURIComponent(store.name) +
          '&am=' + o.total.toFixed(2) + '&cu=' + encodeURIComponent(store.currency || 'INR') + '&tn=' + encodeURIComponent(o.id);
        actions.push('<a class="sf-btn sf-btn-block sf-btn-lg sf-btn-ghost" href="' + esc(upi) + '">Pay ' + cur(o.total) + ' with UPI</a>' +
          '<p class="sf-fine">UPI ID <b>' + esc(pay.upi) + '</b> · note <b>' + esc(o.id) + '</b></p>');
      }
      if (c.email) {
        actions.push('<a class="sf-btn sf-btn-block sf-btn-ghost" href="mailto:' + esc(c.email) + '?subject=' + encodeURIComponent('New order ' + o.id) + '&body=' + msg + '">Email the order</a>');
      }
      var lead = mode === 'live' && c.whatsapp
        ? '<b>One last step:</b> send your order to ' + esc(store.name) + ' on WhatsApp so they can confirm it.'
        : esc(store.name) + ' will contact you shortly to confirm your order.';
      return '<div class="sf-done"><div class="sf-done-icon">' + icon('check', 30) + '</div><div class="sf-eyebrow">Order ' + esc(o.id) + '</div><h2>Thank you, ' + esc(o.customer.name.split(' ')[0]) + '</h2>' +
        '<p class="sf-done-lead">' + lead + '</p>' + actions.join('') +
        '<button class="sf-btn-link" data-sf="close-modal">Continue shopping</button></div>';
    }

    function modal() {
      if (!state.modal) return '';
      var inner = '';
      if (state.modal.type === 'product') {
        var p = findProduct(state.modal.id);
        if (!p) return '';
        inner = productModal(p);
      } else if (state.modal.type === 'checkout') inner = checkoutModal();
      else if (state.modal.type === 'done') inner = doneModal(state.modal.order);
      var anim = state.shownModal !== state.modal.type ? ' sf-anim' : '';
      return '<div class="sf-modal-wrap' + anim + '" data-sf="close-modal-bg"><div class="sf-modal sf-modal-' + state.modal.type + '" role="dialog" aria-modal="true">' +
        '<button class="sf-icon-btn sf-modal-x" data-sf="close-modal" aria-label="Close">' + icon('x') + '</button>' + inner + '</div></div>';
    }

    // ---------- render ----------
    function render() {
      var th = store.theme || {};
      var m = mob();
      var prevModal = root.querySelector('.sf-modal');
      var modalScroll = prevModal ? prevModal.scrollTop : 0;
      var active = document.activeElement;
      var focused = active && root.contains(active) && active.getAttribute('data-sf-input');
      var sel = focused ? active.selectionStart : 0;
      var hasBn = standalone || m.bottomNav !== false;
      root.innerHTML = '<div class="sf' + (standalone ? ' sf-app' : '') + (opts.inert ? ' sf-inert' : '') + (hasBn ? ' sf-has-bn' : '') +
        '" data-template="' + esc(th.template || 'classic') + '" data-mcols="' + (Number(m.columns) === 1 ? 1 : 2) + '" style="--sf-primary:' + esc(th.primary || '#1F1D1B') +
        ';--sf-on-primary:' + onColor(th.primary) + ';--sf-font:' + esc(FONTS[th.font] || FONTS.modern) + '">' +
        header() + '<main>' + hero() + trust() + productGrid() + about() + '</main>' + footer() + bottomNav() + installBanner() + drawer() + modal() + '</div>';
      state.shownModal = state.modal ? state.modal.type : null;
      if (state.drawer && !state.shownDrawer) {
        state.shownDrawer = true;
        requestAnimationFrame(function () {
          var d = root.querySelector('.sf-drawer'), o = root.querySelector('.sf-overlay');
          if (d) { void d.offsetWidth; d.classList.add('open'); o.classList.add('open'); }
        });
      } else if (!state.drawer) state.shownDrawer = false;
      var nm = root.querySelector('.sf-modal');
      if (nm) nm.scrollTop = modalScroll;
      if (focused) {
        var el = root.querySelector('[data-sf-input="' + focused + '"]');
        if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(sel, sel); } catch (e) { /* unsupported */ } }
      }
      if (mode === 'live') document.body.classList.toggle('sf-lock', !!state.modal || state.drawer);
    }

    function placeOrder(form) {
      var fd = new FormData(form);
      var t = totals();
      var o = {
        id: orderId(),
        createdAt: new Date().toISOString(),
        items: cartLines().map(function (l) { return { productId: l.p.id, title: l.p.title, price: Number(l.p.price), qty: l.qty }; }),
        customer: {
          name: String(fd.get('name') || '').trim(),
          phone: String(fd.get('phone') || '').trim(),
          address: String(fd.get('address') || '').trim(),
          note: String(fd.get('note') || '').trim()
        },
        subtotal: t.subtotal, shipping: t.shipping, total: t.total,
        payment: String(fd.get('payment') || 'confirm'),
        status: 'new'
      };
      if (!o.items.length) return;
      try {
        localStorage.setItem('sahaay-buyer', JSON.stringify({ name: o.customer.name, phone: o.customer.phone, address: o.customer.address }));
      } catch (e) { /* ignore */ }
      // onOrder may return a promise (hosted stores confirm with the server,
      // which assigns the final order number and checks stock).
      var result = typeof opts.onOrder === 'function' ? opts.onOrder(o) : null;
      var btn = form.querySelector('button[type=submit]');
      var err = form.querySelector('.sf-form-error');
      var finish = function (saved) {
        state.cart = [];
        saveCart();
        state.modal = { type: 'done', order: saved && saved.id ? saved : o };
        render();
      };
      if (result && typeof result.then === 'function') {
        if (btn) { btn.disabled = true; btn.textContent = 'Placing order…'; }
        if (err) err.hidden = true;
        result.then(finish, function (e) {
          if (btn) { btn.disabled = false; btn.textContent = 'Place order'; }
          if (err) { err.textContent = (e && e.message) || 'We couldn\'t place your order. Please try again.'; err.hidden = false; }
        });
      } else finish(o);
    }

    function scrollToId(id) {
      var el = root.querySelector('#' + id);
      if (!el) return;
      var y = el.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    if (opts.inert) {
      render();
      return { update: function (next) { store = next; render(); }, openProduct: function () {} };
    }

    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-sf]');
      if (!t || !root.contains(t)) return;
      var a = t.getAttribute('data-sf');
      var id = t.getAttribute('data-id');
      if (a === 'close-modal-bg' && e.target !== t) return;
      e.preventDefault();
      e.stopPropagation();

      switch (a) {
        case 'home': state.modal = null; state.drawer = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
        case 'scroll': state.modal = null; state.drawer = false; render(); scrollToId(t.getAttribute('data-to')); return;
        case 'cat-nav': state.category = t.getAttribute('data-cat'); state.modal = null; state.drawer = false; render(); scrollToId('sf-products'); return;
        case 'focus-search': {
          state.modal = null; state.drawer = false; render(); scrollToId('sf-products');
          setTimeout(function () {
            var s = root.querySelector('[data-sf-input="search"]');
            if (s) s.focus({ preventScroll: true });
          }, 400);
          return;
        }
        case 'view': state.modal = { type: 'product', id: id }; state.qty = 1; state.imgIdx = 0; break;
        case 'quick-add': addToCart(id, 1); state.modal = null; state.drawer = true; break;
        case 'img': state.imgIdx = Number(t.getAttribute('data-i')); break;
        case 'qty-inc': {
          var mp = findProduct(state.modal && state.modal.id);
          state.qty = Math.min(mp ? maxQty(mp) : 99, state.qty + 1); break;
        }
        case 'qty-dec': state.qty = Math.max(1, state.qty - 1); break;
        case 'add': addToCart(id, state.qty); state.modal = null; state.drawer = true; break;
        case 'buy': addToCart(id, state.qty); state.modal = { type: 'checkout' }; break;
        case 'open-cart': state.modal = null; state.drawer = true; break;
        case 'close-cart': state.drawer = false; break;
        case 'inc': addToCart(id, 1); break;
        case 'dec':
          state.cart.forEach(function (l) { if (l.id === id) l.qty -= 1; });
          state.cart = state.cart.filter(function (l) { return l.qty > 0; });
          saveCart(); break;
        case 'rm': state.cart = state.cart.filter(function (l) { return l.id !== id; }); saveCart(); break;
        case 'checkout': state.drawer = false; state.modal = { type: 'checkout' }; break;
        case 'close-modal': case 'close-modal-bg': state.modal = null; break;
        case 'cat': state.category = t.getAttribute('data-cat'); break;
        case 'install':
          if (installEvt) {
            installEvt.prompt();
            installEvt.userChoice.then(function () { installEvt = null; render(); });
          }
          return;
        case 'install-dismiss':
          state.installHidden = true;
          try { localStorage.setItem('sahaay-install-dismissed:' + store.id, '1'); } catch (err) { /* ignore */ }
          break;
        default: return;
      }
      render();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches && e.target.matches('.sf-card')) e.target.click();
      if (e.key === 'Escape' && (state.modal || state.drawer)) { state.modal = null; state.drawer = false; render(); }
    });

    root.addEventListener('input', function (e) {
      if (e.target.getAttribute('data-sf-input') === 'search') { state.query = e.target.value; render(); }
    });

    root.addEventListener('submit', function (e) {
      if (e.target.getAttribute('data-sf-form') === 'checkout') { e.preventDefault(); placeOrder(e.target); }
    });

    render();

    return {
      update: function (next) { store = next; render(); },
      openProduct: function (id) { state.modal = { type: 'product', id: id }; state.qty = 1; state.imgIdx = 0; render(); }
    };
  }

  global.SahaayStorefront = { mount: mount, money: money, esc: esc, visual: visual, onColor: onColor, FONTS: FONTS };
})(typeof window !== 'undefined' ? window : this);
