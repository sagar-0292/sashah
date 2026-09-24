/* Sahaay Stores — storefront renderer.
 * Renders a store from its data (see sections.js for the model). Used by the
 * builder preview, the live editor, hosted stores and exported sites, so it
 * must not depend on anything from app.js.
 *
 *   SahaayStorefront.mount(rootEl, store, {
 *     mode: 'preview' | 'live',
 *     onOrder: fn(order) → optional Promise<savedOrder>,
 *     standalone: bool,      // render as an installed app
 *     forceInstall: bool,    // always show the install banner (app preview)
 *     editor: bool,          // live editor: clicks select sections
 *     onSelect: fn(id),      // editor: a section/header/footer was clicked
 *     poweredUrl: string,
 *     inert: bool            // decorative mockup: no interaction
 *   })
 */
(function (global) {
  'use strict';

  var SS = global.SahaaySections;

  var ICONS = {
    bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19 13 11"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5-2-6.5-4.5L3 12a1.5 1.5 0 0 1 2.5-1.5L8 14"/>',
    refresh: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    minus: '<path d="M6 12h12"/>',
    plus: '<path d="M12 6v12M6 12h12"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 12v8h12v-8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".8" fill="currentColor"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
    youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/>',
    play: '<path d="M8 5v14l11-7z"/>'
  };
  function icon(name, size) {
    return '<svg class="sf-i" viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }

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

  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return 1;
    var n = parseInt(m[1], 16);
    var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  // Black or white text for a colour, so buttons stay readable.
  function onColor(hex) { return lum(hex) > 0.4 ? '#111' : '#fff'; }

  function isImgUrl(s) { return /^(data:|https?:|\/)/.test(String(s || '')); }

  // Products without photos get a quiet, editorial abstract artwork (one of
  // three compositions, tinted per product) instead of a stock icon.
  function art(seed, cls) {
    var h = hue(seed);
    var v = h % 3;
    // Only a faint per-product hue; the rest comes from the store's own palette (CSS).
    var style = '--ah:hsl(' + h + ' 24% 58%)';
    return '<div class="' + cls + ' sf-art sf-art-' + v + '" style="' + style + '" role="img" aria-label=""><i></i><b></b></div>';
  }

  function visual(p, cls, i) {
    var imgs = p.images || [];
    if (imgs.length) {
      var src = imgs[Math.min(i || 0, imgs.length - 1)];
      return '<img class="' + cls + '" src="' + esc(src) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async">';
    }
    return art(p.title || p.id, cls);
  }

  function inStock(p) { return p.stock == null || p.stock === '' || Number(p.stock) > 0; }
  function maxQty(p) { return (p.stock == null || p.stock === '') ? 99 : Math.max(0, Number(p.stock)); }
  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }
  function initials(name) {
    return String(name || '?').trim().split(/\s+/).filter(function (w) { return /[a-z0-9]/i.test(w); }).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '•';
  }

  function orderId() {
    var d = new Date();
    return 'ORD-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function youtubeId(url) {
    var m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : '';
  }

  // Loads the store's chosen Google Fonts (once per combination).
  function ensureFonts(theme) {
    if (typeof document === 'undefined' || !SS) return;
    var href = SS.fontHref(theme);
    var link = document.querySelector('link[data-sf-fonts]');
    if (link && link.getAttribute('href') === href) return;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-sf-fonts', '');
      document.head.appendChild(link);
    }
    link.href = href;
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
    if (SS) SS.upgrade(store);
    var mode = opts.mode || 'live';
    var cartKey = 'sahaay-cart:' + (store.id || 'store');
    var state = {
      cart: loadCart(),
      filters: {},        // per products-section: { q, cat }
      page: initialPage(),
      modal: null,        // { type: 'product'|'checkout'|'done', id?, order? }
      drawer: false,
      menu: false,
      shownDrawer: false,
      shownModal: null,
      qty: 1,
      imgIdx: 0,
      selected: null,
      installHidden: readDismissed()
    };
    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone = !!opts.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;

    if (!opts.inert) installListeners.push(function () { render(); });

    function initialPage() {
      var m = (location.hash || '').match(/^#\/p\/([\w-]+)/);
      if (!m) return 'home';
      var p = (store.pages || []).filter(function (x) { return x.slug === m[1] || x.id === m[1]; })[0];
      return p ? p.id : 'home';
    }
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

    function products() { return (store.products || []).filter(function (p) { return p.active !== false; }); }
    function findProduct(id) { return (store.products || []).filter(function (p) { return p.id === id; })[0]; }
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
    function cartCount() { return cartLines().reduce(function (s, l) { return s + l.qty; }, 0); }
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
    function pages() { return store.pages || []; }
    function currentPage() { return pages().filter(function (p) { return p.id === state.page; })[0] || pages()[0] || { id: 'home', sections: [] }; }
    function firstProductsSection() {
      var home = pages()[0];
      return home ? home.sections.filter(function (x) { return x.type === 'products' && !x.hidden; })[0] : null;
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

    // ---------- links ----------
    function waLink(text) {
      var n = waDigits((store.contact || {}).whatsapp);
      return n ? 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '') : '';
    }
    function linkAttrs(link) {
      link = String(link || 'home');
      if (link.indexOf('url:') === 0) {
        var u = link.slice(4);
        return /^https?:\/\//.test(u) ? 'href="' + esc(u) + '" target="_blank" rel="noopener"' : 'href="#"';
      }
      if (link === 'whatsapp') {
        var w = waLink('Hi ' + store.name + '!');
        return w ? 'href="' + esc(w) + '" target="_blank" rel="noopener"' : 'href="#" data-sf="go" data-link="home"';
      }
      return 'href="#" data-sf="go" data-link="' + esc(link) + '"';
    }
    function go(link) {
      link = String(link || 'home');
      state.modal = null; state.drawer = false; state.menu = false;
      var scrollTo = null;
      if (link === 'home') { setPage('home'); }
      else if (link === 'products' || link.indexOf('cat:') === 0) {
        var ps = firstProductsSection();
        setPage('home');
        if (ps) {
          state.filters[ps.id] = state.filters[ps.id] || {};
          state.filters[ps.id].cat = link.indexOf('cat:') === 0 ? link.slice(4) : '';
          scrollTo = 'sf-sec-' + ps.id;
        }
      } else if (link.indexOf('page:') === 0) { setPage(link.slice(5)); }
      else if (link.indexOf('section:') === 0) {
        var id = link.slice(8);
        var owner = pages().filter(function (p) { return p.sections.some(function (x) { return x.id === id; }); })[0];
        if (owner) setPage(owner.id);
        scrollTo = 'sf-sec-' + id;
      } else if (link === 'footer') { scrollTo = 'sf-footer'; }
      render();
      if (scrollTo) scrollToId(scrollTo); else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function setPage(id) {
      if (!pages().some(function (p) { return p.id === id; })) id = 'home';
      state.page = id;
      if (mode === 'live') {
        var p = currentPage();
        var h = id === 'home' ? '' : '#/p/' + (p.slug || p.id);
        try { history.replaceState(null, '', location.pathname + location.search + h); } catch (e) { /* ignore */ }
      }
    }

    // ---------- brand ----------
    function brand() {
      var b = store.brand || {};
      var size = b.size || 'md';
      if (b.type === 'image' && isImgUrl(store.logo)) {
        return '<span class="sf-brand-logo sf-logo-' + size + '"><img src="' + esc(store.logo) + '" alt="' + esc(store.name) + '"></span>';
      }
      var mark = b.mark && b.mark !== 'none'
        ? '<span class="sf-mark sf-mark-' + esc(b.mark) + '">' + esc(initials(b.text || store.name)) + '</span>' : '';
      return mark + '<span class="sf-wordmark sf-logo-' + size + '">' + esc(b.text || store.name || 'My Store') + '</span>';
    }

    // ---------- header / footer ----------
    function menuItems() {
      var h = store.header || {};
      var items = (h.menu || []).slice();
      if (h.autoCategories) {
        var at = items.findIndex ? items.findIndex(function (i) { return i.link === 'products'; }) : -1;
        var cats = categories().slice(0, 4).map(function (c) { return { label: c, link: 'cat:' + c }; });
        if (cats.length > 1) items.splice(at >= 0 ? at + 1 : items.length, 0, cats[0], cats[1], cats[2], cats[3]);
      }
      return items.filter(Boolean).filter(function (i) { return i.label; });
    }

    function header() {
      var h = store.header || {};
      var count = cartCount();
      var nav = menuItems().map(function (i) { return '<a ' + linkAttrs(i.link) + '>' + esc(i.label) + '</a>'; }).join('');
      var brandLink = '<a class="sf-brand" href="#" data-sf="go" data-link="home">' + brand() + '</a>';
      var actions = '<div class="sf-header-actions">' +
        (h.showSearch !== false && firstProductsSection() ? '<button class="sf-icon-btn sf-hide-sm" data-sf="focus-search" aria-label="Search">' + icon('search') + '</button>' : '') +
        '<button class="sf-icon-btn sf-cart-btn" data-sf="open-cart" aria-label="Cart, ' + count + ' items">' + icon('bag') +
        (count ? '<span class="sf-badge">' + count + '</span>' : '') + '</button></div>';
      var burger = nav ? '<button class="sf-icon-btn sf-burger" data-sf="open-menu" aria-label="Menu">' + icon('menu') + '</button>' : '';
      var inner = h.layout === 'center'
        ? '<div class="sf-header-side">' + burger + '<nav class="sf-nav">' + nav + '</nav></div>' + brandLink + '<div class="sf-header-side sf-header-right">' + actions + '</div>'
        : burger + brandLink + '<nav class="sf-nav">' + nav + '</nav>' + actions;
      return (store.announcement ? '<div class="sf-announce" data-sf-section="header">' + esc(store.announcement) + '</div>' : '') +
        '<header class="sf-header sf-header-' + (h.layout === 'center' ? 'center' : 'left') + (h.sticky === false ? ' sf-static' : '') + '" data-sf-section="header"><div class="sf-wrap sf-header-in">' + inner + '</div></header>';
    }

    function mobileMenu() {
      if (!state.menu) return '';
      var c = store.contact || {};
      return '<div class="sf-overlay open" data-sf="close-menu"></div><aside class="sf-menu open" aria-label="Menu">' +
        '<div class="sf-drawer-head"><span class="sf-brand">' + brand() + '</span><button class="sf-icon-btn" data-sf="close-menu" aria-label="Close">' + icon('x') + '</button></div>' +
        '<nav class="sf-menu-nav"><a ' + linkAttrs('home') + '>Home</a>' + menuItems().map(function (i) { return '<a ' + linkAttrs(i.link) + '>' + esc(i.label) + '</a>'; }).join('') +
        pages().slice(1).filter(function (p) { return !menuItems().some(function (i) { return i.link === 'page:' + p.id; }); }).map(function (p) { return '<a ' + linkAttrs('page:' + p.id) + '>' + esc(p.title) + '</a>'; }).join('') + '</nav>' +
        (c.whatsapp ? '<a class="sf-btn sf-btn-block" ' + linkAttrs('whatsapp') + '>' + icon('chat', 18) + ' Chat with us</a>' : '') + '</aside>';
    }

    function footer() {
      var c = store.contact || {}, f = store.footer || {}, soc = f.social || {};
      var contact = [];
      if (c.whatsapp) contact.push('<a href="' + esc(waLink()) + '" target="_blank" rel="noopener">WhatsApp</a>');
      if (c.phone) contact.push('<a href="tel:' + esc(c.phone) + '">' + esc(c.phone) + '</a>');
      if (c.email) contact.push('<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>');
      var socials = [];
      var ig = soc.instagram || c.instagram;
      if (ig) socials.push('<a href="https://instagram.com/' + esc(String(ig).replace(/^@/, '')) + '" target="_blank" rel="noopener" aria-label="Instagram">' + icon('instagram', 20) + '</a>');
      if (soc.facebook) socials.push('<a href="' + esc(/^https?:/.test(soc.facebook) ? soc.facebook : 'https://facebook.com/' + soc.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook">' + icon('facebook', 20) + '</a>');
      if (soc.youtube) socials.push('<a href="' + esc(/^https?:/.test(soc.youtube) ? soc.youtube : 'https://youtube.com/@' + String(soc.youtube).replace(/^@/, '')) + '" target="_blank" rel="noopener" aria-label="YouTube">' + icon('youtube', 20) + '</a>');
      var info = pages().slice(1);
      return '<footer class="sf-footer" id="sf-footer" data-sf-section="footer"><div class="sf-wrap"><div class="sf-footer-grid">' +
        '<div class="sf-footer-brand"><div class="sf-brand">' + brand() + '</div>' + (f.text ? '<p>' + nl2br(f.text) + '</p>' : '') +
        (socials.length ? '<div class="sf-socials">' + socials.join('') + '</div>' : '') + '</div>' +
        '<div class="sf-footer-col"><h4>Shop</h4><a ' + linkAttrs('products') + '>All products</a>' + categories().slice(0, 5).map(function (x) {
          return '<a ' + linkAttrs('cat:' + x) + '>' + esc(x) + '</a>';
        }).join('') + '</div>' +
        (info.length ? '<div class="sf-footer-col"><h4>Information</h4>' + info.map(function (p) { return '<a ' + linkAttrs('page:' + p.id) + '>' + esc(p.title) + '</a>'; }).join('') + '</div>' : '') +
        '<div class="sf-footer-col"><h4>Contact</h4>' + (contact.join('') || '<span>—</span>') + (c.address ? '<address>' + nl2br(c.address) + '</address>' : '') + '</div>' +
        '</div><div class="sf-footer-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(store.name) + '</span>' +
        (f.showPowered !== false ? (opts.poweredUrl ? '<a href="' + esc(opts.poweredUrl) + '" target="_blank" rel="noopener">Powered by Sahaay Stores</a>' : '<span>Powered by Sahaay Stores</span>') : '') +
        '</div></div></footer>';
    }

    // ---------- sections ----------
    function buttons(s, secondaryClass) {
      var out = '';
      if (s.button1Label) out += '<a class="sf-btn sf-btn-lg" ' + linkAttrs(s.button1Link) + '>' + esc(s.button1Label) + ' ' + icon('arrow', 18) + '</a>';
      if (s.button2Label) out += '<a class="sf-btn sf-btn-lg ' + (secondaryClass || 'sf-btn-ghost') + '" ' + linkAttrs(s.button2Link) + '>' + esc(s.button2Label) + '</a>';
      return out ? '<div class="sf-btns">' + out + '</div>' : '';
    }
    function eyebrow(t) { return t ? '<div class="sf-eyebrow">' + esc(t) + '</div>' : ''; }
    function placeholder(text) { return opts.editor ? '<div class="sf-placeholder">' + esc(text) + '</div>' : ''; }

    function secHero(s, first) {
      var H = first ? 'h1' : 'h2';
      var text = '<div class="sf-hero-text">' + eyebrow(s.eyebrow) + '<' + H + ' class="sf-hero-title">' + esc(s.heading || store.name) + '</' + H + '>' +
        (s.text ? '<p class="sf-lead">' + nl2br(s.text) + '</p>' : '') + buttons(s) + '</div>';
      if (s.layout === 'split') {
        var media;
        if (s.image) media = '<img class="sf-hero-photo" src="' + esc(s.image) + '" alt="">';
        else {
          var feat = products().slice(0, 3);
          if (!feat.length && isImgUrl(store.logo)) {
            media = '<div class="sf-collage sf-collage-1"><div class="sf-collage-item sf-collage-logo"><img src="' + esc(store.logo) + '" alt="' + esc(store.name) + '"></div></div>';
          } else {
            if (!feat.length) feat = [{ title: store.name }];
            media = '<div class="sf-collage sf-collage-' + feat.length + '">' + feat.map(function (p) { return '<div class="sf-collage-item">' + visual(p, 'sf-collage-img') + '</div>'; }).join('') + '</div>';
          }
        }
        return '<div class="sf-wrap sf-hero-grid">' + text + '<div class="sf-hero-media">' + media + '</div></div>';
      }
      if (s.layout === 'image') {
        var bg = s.image ? 'background-image:linear-gradient(rgba(0,0,0,' + (Number(s.overlay) || 0) / 100 + '),rgba(0,0,0,' + (Number(s.overlay) || 0) / 100 + ')),url(\'' + esc(s.image) + '\')' : '';
        return '<div class="sf-hero-bg' + (s.image ? ' sf-has-img' : '') + '" style="' + bg + '"><div class="sf-wrap">' + text + '</div></div>';
      }
      return '<div class="sf-wrap">' + text + '</div>';
    }

    function secFeatures(s) {
      var items = s.auto ? autoFeatures() : (s.items || []);
      if (!items.length) return placeholder('Add highlights in the editor');
      return '<div class="sf-wrap"><div class="sf-features sf-cols-' + Math.min(items.length, 4) + '">' + items.map(function (t) {
        return '<div class="sf-feature">' + icon(t.icon, 24) + '<div><b>' + esc(t.title) + '</b>' + (t.text ? '<span>' + esc(t.text) + '</span>' : '') + '</div></div>';
      }).join('') + '</div></div>';
    }
    function autoFeatures() {
      var c = store.contact || {};
      var out = [{ icon: 'truck', title: deliveryLine(), text: 'Packed with care' }];
      if (paymentLine()) out.push({ icon: 'shield', title: paymentLine(), text: 'No card needed' });
      if (c.whatsapp) out.push({ icon: 'chat', title: 'Order on WhatsApp', text: 'Real people, quick replies' });
      else if (c.email) out.push({ icon: 'mail', title: 'Friendly support', text: c.email });
      return out;
    }

    function card(p) {
      var t = (store.theme || {}).card || {};
      var sale = Number(p.compareAt) > Number(p.price);
      var two = p.images && p.images.length > 1;
      return '<article class="sf-card" data-sf="view" data-id="' + esc(p.id) + '" tabindex="0" aria-label="' + esc(p.title) + '">' +
        '<div class="sf-card-media' + (two ? ' sf-has-alt' : '') + '">' + visual(p, 'sf-card-img') + (two ? visual(p, 'sf-card-img sf-card-alt', 1) : '') +
        (!inStock(p) ? '<span class="sf-tag sf-tag-out">Sold out</span>' : sale ? '<span class="sf-tag">Sale</span>' : '') +
        (inStock(p) && t.quickAdd !== false ? '<button class="sf-quick" data-sf="quick-add" data-id="' + esc(p.id) + '" aria-label="Add ' + esc(p.title) + ' to cart">' + icon('plus', 18) + '<span>Quick add</span></button>' : '') +
        '</div><div class="sf-card-body">' + (p.category && t.showCategory !== false ? '<div class="sf-card-cat">' + esc(p.category) + '</div>' : '') +
        '<h3>' + esc(p.title) + '</h3>' + priceHtml(p) + '</div></article>';
    }
    function priceHtml(p, cls) {
      var sale = Number(p.compareAt) > Number(p.price);
      return '<div class="sf-price ' + (cls || '') + '"><span' + (sale ? ' class="sf-price-sale"' : '') + '>' + cur(p.price) + '</span>' +
        (sale ? '<s>' + cur(p.compareAt) + '</s><em>−' + Math.round((1 - Number(p.price) / Number(p.compareAt)) * 100) + '%</em>' : '') + '</div>';
    }

    function secProducts(s, id) {
      var f = state.filters[id] = state.filters[id] || { q: '', cat: '' };
      var all = products().filter(function (p) { return s.source !== 'category' || !s.category || p.category === s.category; });
      var cats = [];
      all.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      var q = (f.q || '').trim().toLowerCase();
      var list = all.filter(function (p) {
        if (f.cat && p.category !== f.cat) return false;
        if (q && (p.title + ' ' + (p.description || '') + ' ' + (p.category || '')).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).slice(0, Number(s.limit) || 24);
      var chips = s.showFilters !== false && cats.length > 1 && s.source !== 'category' ? '<div class="sf-chips">' +
        '<button class="sf-chip' + (!f.cat ? ' on' : '') + '" data-sf="cat" data-sec="' + esc(id) + '" data-cat="">All</button>' +
        cats.map(function (c) { return '<button class="sf-chip' + (f.cat === c ? ' on' : '') + '" data-sf="cat" data-sec="' + esc(id) + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '';
      var empty = !all.length
        ? (opts.editor ? '<div class="sf-placeholder">Products you add in the dashboard appear here.</div>' : '<p class="sf-empty">New products are coming soon.</p>')
        : !list.length ? '<p class="sf-empty">Nothing matches your search.</p>' : '';
      return '<div class="sf-wrap"><div class="sf-section-head"><div>' + eyebrow(s.eyebrow) + (s.heading ? '<h2>' + esc(s.heading) + '</h2>' : '') + '</div>' +
        (s.showSearch !== false && all.length ? '<label class="sf-search">' + icon('search', 18) + '<input type="search" placeholder="Search" value="' + esc(f.q) + '" data-sf-input="search" data-sec="' + esc(id) + '" aria-label="Search products"></label>' : '') +
        '</div>' + chips + '<div class="sf-grid" style="--cols:' + (Number(s.columns) || 4) + '">' + list.map(card).join('') + '</div>' + empty + '</div>';
    }

    function secImageText(s) {
      var img = s.image ? '<img src="' + esc(s.image) + '" alt="" loading="lazy">' : art(s.heading || 'image', 'sf-it-art');
      return '<div class="sf-wrap sf-it sf-it-' + (s.imageSide === 'right' ? 'right' : 'left') + '"><div class="sf-it-media">' + img + '</div>' +
        '<div class="sf-it-text">' + eyebrow(s.eyebrow) + (s.heading ? '<h2>' + esc(s.heading) + '</h2>' : '') + (s.text ? '<p>' + nl2br(s.text) + '</p>' : '') + buttons(s) + '</div></div>';
    }

    function secRichText(s) {
      if (!s.heading && !s.text) return placeholder('Add a heading or text in the editor');
      return '<div class="sf-wrap sf-rt sf-rt-' + (s.align === 'left' ? 'left' : 'center') + ' sf-rt-' + (s.size === 'md' ? 'md' : 'lg') + '">' +
        eyebrow(s.eyebrow) + (s.heading ? '<h2>' + esc(s.heading) + '</h2>' : '') + (s.text ? '<p class="sf-rt-text">' + nl2br(s.text) + '</p>' : '') + buttons(s) + '</div>';
    }

    function secOwner(s) {
      if (!s.bio && !s.name) return placeholder('Add your name and story in the editor');
      return '<div class="sf-wrap"><div class="sf-owner"><div class="sf-owner-photo">' +
        (s.photo ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy">' : '<span>' + esc(initials(s.name || store.name)) + '</span>') + '</div>' +
        '<div class="sf-owner-text">' + eyebrow(s.eyebrow) + (s.name ? '<h3>' + esc(s.name) + '</h3>' : '') + (s.bio ? '<p>' + nl2br(s.bio) + '</p>' : '') + '</div></div></div>';
    }

    function secTestimonials(s) {
      var items = (s.items || []).filter(function (i) { return i.quote; });
      if (!items.length) return placeholder('Add reviews from real customers in the editor');
      return '<div class="sf-wrap">' + (s.heading ? '<h2 class="sf-center-h">' + esc(s.heading) + '</h2>' : '') + '<div class="sf-quotes">' + items.map(function (i) {
        return '<figure class="sf-quote"><blockquote>“' + nl2br(i.quote) + '”</blockquote><figcaption><b>' + esc(i.name) + '</b>' + (i.detail ? '<span>' + esc(i.detail) + '</span>' : '') + '</figcaption></figure>';
      }).join('') + '</div></div>';
    }

    function secGallery(s) {
      var items = (s.items || []).filter(function (i) { return i.image; });
      if (!items.length) return placeholder('Add photos in the editor');
      return '<div class="sf-wrap">' + (s.heading ? '<h2 class="sf-center-h">' + esc(s.heading) + '</h2>' : '') + '<div class="sf-gallery" style="--cols:' + (Number(s.columns) || 3) + '">' + items.map(function (i) {
        return '<figure><img src="' + esc(i.image) + '" alt="' + esc(i.caption || '') + '" loading="lazy">' + (i.caption ? '<figcaption>' + esc(i.caption) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div></div>';
    }

    function secFaq(s) {
      var items = (s.items || []).filter(function (i) { return i.q; });
      if (!items.length) return placeholder('Add questions in the editor');
      return '<div class="sf-wrap sf-faq">' + (s.heading ? '<h2 class="sf-center-h">' + esc(s.heading) + '</h2>' : '') + items.map(function (i) {
        return '<details><summary>' + esc(i.q) + icon('plus', 18) + '</summary><p>' + nl2br(i.a) + '</p></details>';
      }).join('') + '</div>';
    }

    function secVideo(s) {
      var id = youtubeId(s.url);
      if (!id) return placeholder('Paste a YouTube link in the editor');
      return '<div class="sf-wrap">' + (s.heading ? '<h2 class="sf-center-h">' + esc(s.heading) + '</h2>' : '') +
        '<div class="sf-video"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(s.heading || 'Video') + '" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>';
    }

    function secCta(s) {
      return '<div class="sf-wrap sf-cta">' + (s.heading ? '<h2>' + esc(s.heading) + '</h2>' : '') + (s.text ? '<p>' + nl2br(s.text) + '</p>' : '') + buttons(s) + '</div>';
    }

    function secContact(s) {
      var c = store.contact || {};
      var ways = [];
      if (c.whatsapp) ways.push('<a class="sf-contact-way" href="' + esc(waLink('Hi ' + store.name + '!')) + '" target="_blank" rel="noopener">' + icon('chat') + '<span><b>WhatsApp</b>Message us</span></a>');
      if (c.phone) ways.push('<a class="sf-contact-way" href="tel:' + esc(c.phone) + '">' + icon('phone') + '<span><b>Call</b>' + esc(c.phone) + '</span></a>');
      if (c.email) ways.push('<a class="sf-contact-way" href="mailto:' + esc(c.email) + '">' + icon('mail') + '<span><b>Email</b>' + esc(c.email) + '</span></a>');
      return '<div class="sf-wrap sf-contact"><div>' + (s.heading ? '<h2>' + esc(s.heading) + '</h2>' : '') + (s.text ? '<p class="sf-lead">' + nl2br(s.text) + '</p>' : '') +
        (c.address ? '<address>' + icon('pin', 18) + '<span>' + nl2br(c.address) + '</span></address>' : '') +
        (s.hours ? '<div class="sf-hours">' + icon('clock', 18) + '<span>' + nl2br(s.hours) + '</span></div>' : '') +
        (s.showMap && c.address ? '<a class="sf-btn sf-btn-ghost" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.address) + '" target="_blank" rel="noopener">Get directions</a>' : '') + '</div>' +
        '<div class="sf-contact-ways">' + (ways.join('') || placeholder('Add WhatsApp, phone or email in Settings')) + '</div></div>';
    }

    var RENDER = { hero: secHero, features: secFeatures, products: secProducts, imageText: secImageText, richText: secRichText, owner: secOwner, testimonials: secTestimonials, gallery: secGallery, faq: secFaq, video: secVideo, cta: secCta, contact: secContact };

    function sections() {
      var page = currentPage();
      var first = true;
      return page.sections.map(function (sec) {
        if (sec.hidden || !RENDER[sec.type]) return '';
        var inner = RENDER[sec.type](sec.settings || {}, sec.id, first);
        var isFirst = first; first = false;
        if (!inner) return '';
        var s = sec.settings || {};
        var cls = 'sf-s sf-s-' + sec.type + ' sf-scheme-' + (s.scheme || 'default') +
          (sec.type === 'hero' ? ' sf-hero-' + (s.layout || 'split') + ' sf-h-' + (s.height || 'md') + ' sf-align-' + (s.align || 'left') : '') +
          (isFirst ? ' sf-s-first' : '') + (state.selected === sec.id ? ' sf-selected' : '');
        return '<section class="' + cls + '" id="sf-sec-' + esc(sec.id) + '" data-sf-section="' + esc(sec.id) + '">' + inner + '</section>';
      }).join('');
    }

    // ---------- chrome: bottom nav, install banner, cart, modals ----------
    function bottomNav() {
      if (mob().bottomNav === false && !standalone) return '';
      var c = store.contact || {};
      var count = cartCount();
      return '<nav class="sf-bottom-nav" aria-label="Store">' +
        '<button data-sf="go" data-link="home">' + icon('home') + '<span>Home</span></button>' +
        '<button data-sf="go" data-link="products">' + icon('grid') + '<span>Shop</span></button>' +
        '<button data-sf="focus-search">' + icon('search') + '<span>Search</span></button>' +
        '<button data-sf="open-cart" class="sf-bn-cart">' + icon('bag') + (count ? '<i>' + count + '</i>' : '') + '<span>Cart</span></button>' +
        (c.whatsapp ? '<a href="' + esc(waLink()) + '" target="_blank" rel="noopener">' + icon('chat') + '<span>Chat</span></a>' : '') +
        '</nav>';
    }

    function appIconHtml() {
      var app = store.app || {};
      if (app.icons && app.icons['192']) return '<img src="' + esc(app.icons['192']) + '" alt="">';
      if (app.icon) return '<img src="' + esc(app.icon) + '" alt="">';
      if ((store.brand || {}).type === 'image' && isImgUrl(store.logo)) return '<img src="' + esc(store.logo) + '" alt="">';
      return '<span class="sf-install-mono">' + esc(initials((store.brand || {}).text || store.name)) + '</span>';
    }

    function installBanner() {
      var app = store.app || {};
      if (!app.enabled || app.banner === false || standalone || state.installHidden) return '';
      if (!(opts.forceInstall || installEvt || isIOS)) return '';
      var iosHint = isIOS && !installEvt && !opts.forceInstall;
      var bg = app.bg || (store.theme || {}).primary || '#111';
      return '<div class="sf-install" role="dialog" aria-label="Install app">' +
        '<div class="sf-install-icon" style="background:' + esc(bg) + ';color:' + onColor(bg) + '">' + appIconHtml() + '</div>' +
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
        eyebrow(p.category) + '<h2>' + esc(p.title) + '</h2>' + priceHtml(p, 'sf-price-lg') +
        (low ? '<div class="sf-stock sf-stock-low"><i></i>Only ' + Number(p.stock) + ' left</div>' : ok ? '<div class="sf-stock"><i></i>In stock</div>' : '') +
        (ok
          ? '<div class="sf-pd-actions' + (sticky ? ' sf-sticky-buy' : '') + '"><div class="sf-stepper sf-stepper-lg"><button data-sf="qty-dec" aria-label="Decrease">' + icon('minus', 18) + '</button><span>' + state.qty + '</span><button data-sf="qty-inc" aria-label="Increase">' + icon('plus', 18) + '</button></div>' +
            '<button class="sf-btn sf-btn-lg" data-sf="add" data-id="' + esc(p.id) + '">Add to cart</button></div>' +
            '<button class="sf-btn sf-btn-ghost sf-btn-block sf-btn-lg sf-buy-now" data-sf="buy" data-id="' + esc(p.id) + '">Buy it now</button>'
          : '<button class="sf-btn sf-btn-block sf-btn-lg" disabled>Sold out</button>') +
        (p.description ? '<div class="sf-pd-desc"><h4>Details</h4><p>' + nl2br(p.description) + '</p></div>' : '') +
        '<div class="sf-pd-perks"><div>' + icon('truck', 18) + '<span>' + esc(deliveryLine()) + '</span></div>' +
        (paymentLine() ? '<div>' + icon('shield', 18) + '<span>' + esc(paymentLine()) + '</span></div>' : '') + '</div>' +
        '</div></div>' +
        (related.length ? '<div class="sf-related"><h3>You may also like</h3><div class="sf-grid sf-grid-related">' + related.map(card).join('') + '</div></div>' : '');
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
          '&am=' + Number(o.total).toFixed(2) + '&cu=' + encodeURIComponent(store.currency || 'INR') + '&tn=' + encodeURIComponent(o.id);
        actions.push('<a class="sf-btn sf-btn-block sf-btn-lg sf-btn-ghost" href="' + esc(upi) + '">Pay ' + cur(o.total) + ' with UPI</a>' +
          '<p class="sf-fine">UPI ID <b>' + esc(pay.upi) + '</b> · note <b>' + esc(o.id) + '</b></p>');
      }
      if (c.email) {
        actions.push('<a class="sf-btn sf-btn-block sf-btn-ghost" href="mailto:' + esc(c.email) + '?subject=' + encodeURIComponent('New order ' + o.id) + '&body=' + msg + '">Email the order</a>');
      }
      var lead = mode === 'live' && c.whatsapp
        ? '<b>One last step:</b> send your order to ' + esc(store.name) + ' on WhatsApp so they can confirm it.'
        : esc(store.name) + ' will contact you shortly to confirm your order.';
      return '<div class="sf-done"><div class="sf-done-icon">' + icon('check', 30) + '</div>' + eyebrow('Order ' + o.id) + '<h2>Thank you, ' + esc(o.customer.name.split(' ')[0]) + '</h2>' +
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

    // ---------- theme → CSS variables ----------
    function themeStyle() {
      var t = store.theme || {}, c = t.colors || {};
      var F = SS ? SS.FONTS : {};
      var hf = F[(t.fonts || {}).heading] ? F[t.fonts.heading][1] : "'Inter', sans-serif";
      var bf = F[(t.fonts || {}).body] ? F[t.fonts.body][1] : "'Inter', sans-serif";
      var radius = Math.max(0, Math.min(32, Number(t.radius) || 0));
      var btnR = t.buttonShape === 'pill' ? '999px' : t.buttonShape === 'square' ? '0px' : Math.min(Math.max(radius, 6), 14) + 'px';
      var pad = { compact: 56, comfortable: 88, spacious: 120 }[t.density] || 88;
      var primary = t.primary || '#111';
      var vars = {
        '--sf-bg': c.bg || '#fff', '--sf-surface': c.surface || '#F6F5F2', '--sf-text': c.text || '#141413', '--sf-muted': c.muted || '#66635D',
        '--sf-border': c.border || '#E7E4DE', '--sf-primary': primary, '--sf-on-primary': onColor(primary),
        '--sf-hfont': hf, '--sf-bfont': bf, '--sf-hweight': t.headingWeight || 600, '--sf-hcase': t.headingCase || 'none',
        '--sf-hspacing': t.headingCase === 'uppercase' ? '.01em' : '-.02em', '--sf-btn-case': t.buttonCase || 'none',
        '--sf-radius': radius + 'px', '--sf-btn-radius': btnR, '--sf-pad': pad + 'px', '--sf-ratio': ((t.card || {}).ratio || '4/5')
      };
      return Object.keys(vars).map(function (k) { return k + ':' + String(vars[k]).replace(/[;"<>]/g, ''); }).join(';');
    }

    // ---------- render ----------
    function render() {
      var t = store.theme || {};
      ensureFonts(t);
      var m = mob();
      var prevModal = root.querySelector('.sf-modal');
      var modalScroll = prevModal ? prevModal.scrollTop : 0;
      var active = document.activeElement;
      var focused = active && root.contains(active) && active.getAttribute('data-sf-input') ? [active.getAttribute('data-sf-input'), active.getAttribute('data-sec')] : null;
      var sel = focused ? active.selectionStart : 0;
      var hasBn = standalone || m.bottomNav !== false;
      var dark = lum((t.colors || {}).bg || '#fff') < 0.2;
      var css = String(t.customCss || '').replace(/<\/?style/gi, '');
      root.innerHTML = (css ? '<style>' + css + '</style>' : '') + '<div class="sf' + (dark ? ' sf-dark' : '') + (standalone ? ' sf-app' : '') + (opts.inert ? ' sf-inert' : '') + (opts.editor ? ' sf-editor' : '') + (hasBn ? ' sf-has-bn' : '') +
        (t.card && t.card.align === 'center' ? ' sf-cards-center' : '') + (t.headingCase === 'uppercase' ? ' sf-upper' : '') +
        '" data-btn="' + esc(t.buttonShape || 'rounded') + '" data-mcols="' + (Number(m.columns) === 1 ? 1 : 2) + '" style="' + themeStyle() + '">' +
        header() + '<main>' + sections() + '</main>' + footer() + bottomNav() + installBanner() + mobileMenu() + drawer() + modal() + '</div>';
      state.shownModal = state.modal ? state.modal.type : null;
      if (state.drawer && !state.shownDrawer) {
        state.shownDrawer = true;
        requestAnimationFrame(function () {
          var d = root.querySelector('.sf-drawer'), o = root.querySelector('.sf-overlay:not(.open)');
          if (d) { void d.offsetWidth; d.classList.add('open'); if (o) o.classList.add('open'); }
        });
      } else if (!state.drawer) state.shownDrawer = false;
      var nm = root.querySelector('.sf-modal');
      if (nm) nm.scrollTop = modalScroll;
      if (focused) {
        var el = root.querySelector('[data-sf-input="' + focused[0] + '"]' + (focused[1] ? '[data-sec="' + focused[1] + '"]' : ''));
        if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(sel, sel); } catch (e) { /* unsupported */ } }
      }
      if (mode === 'live') document.body.classList.toggle('sf-lock', !!state.modal || state.drawer || state.menu);
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
      var hdr = root.querySelector('.sf-header');
      var y = el.getBoundingClientRect().top + window.pageYOffset - (hdr && !hdr.classList.contains('sf-static') ? hdr.offsetHeight : 0);
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }

    function highlight(id, scroll) {
      state.selected = id;
      root.querySelectorAll('.sf-selected').forEach(function (el) { el.classList.remove('sf-selected'); });
      if (!id) return;
      if (id !== 'header' && id !== 'footer') {
        var owner = pages().filter(function (p) { return p.sections.some(function (x) { return x.id === id; }); })[0];
        if (owner && owner.id !== state.page) { state.page = owner.id; render(); }
      }
      var el = id === 'header' ? root.querySelector('.sf-header') : id === 'footer' ? root.querySelector('.sf-footer') : root.querySelector('#sf-sec-' + id);
      if (!el) return;
      el.classList.add('sf-selected');
      if (scroll !== false) el.scrollIntoView({ behavior: 'smooth', block: id === 'header' ? 'start' : 'center' });
    }

    var api = {
      update: function (next) { store = next; if (SS) SS.upgrade(store); if (!pages().some(function (p) { return p.id === state.page; })) state.page = 'home'; render(); if (state.selected) highlight(state.selected, false); },
      openProduct: function (id) { state.modal = { type: 'product', id: id }; state.qty = 1; state.imgIdx = 0; render(); },
      highlight: highlight,
      showPage: function (id) { state.page = id; render(); window.scrollTo(0, 0); }
    };

    if (opts.inert) { render(); return api; }

    root.addEventListener('click', function (e) {
      // Live editor: clicking selects the section instead of shopping.
      if (opts.editor) {
        var secEl = e.target.closest('[data-sf-section]');
        e.preventDefault();
        if (secEl && typeof opts.onSelect === 'function') { highlight(secEl.getAttribute('data-sf-section'), false); opts.onSelect(secEl.getAttribute('data-sf-section')); }
        return;
      }
      var t = e.target.closest('[data-sf]');
      if (!t || !root.contains(t)) return;
      var a = t.getAttribute('data-sf');
      var id = t.getAttribute('data-id');
      if ((a === 'close-modal-bg') && e.target !== t) return;
      e.preventDefault();
      e.stopPropagation();

      switch (a) {
        case 'go': go(t.getAttribute('data-link')); return;
        case 'scroll': state.modal = null; state.drawer = false; render(); scrollToId(t.getAttribute('data-to')); return;
        case 'focus-search': {
          go('products');
          setTimeout(function () {
            var s = root.querySelector('[data-sf-input="search"]');
            if (s) s.focus({ preventScroll: true });
          }, 400);
          return;
        }
        case 'open-menu': state.menu = true; break;
        case 'close-menu': state.menu = false; break;
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
        case 'open-cart': state.modal = null; state.menu = false; state.drawer = true; break;
        case 'close-cart': state.drawer = false; break;
        case 'inc': addToCart(id, 1); break;
        case 'dec':
          state.cart.forEach(function (l) { if (l.id === id) l.qty -= 1; });
          state.cart = state.cart.filter(function (l) { return l.qty > 0; });
          saveCart(); break;
        case 'rm': state.cart = state.cart.filter(function (l) { return l.id !== id; }); saveCart(); break;
        case 'checkout': state.drawer = false; state.modal = { type: 'checkout' }; break;
        case 'close-modal': case 'close-modal-bg': state.modal = null; break;
        case 'cat': {
          var sec = t.getAttribute('data-sec');
          state.filters[sec] = state.filters[sec] || {};
          state.filters[sec].cat = t.getAttribute('data-cat');
          break;
        }
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
      if (e.key === 'Escape' && (state.modal || state.drawer || state.menu)) { state.modal = null; state.drawer = false; state.menu = false; render(); }
    });

    root.addEventListener('input', function (e) {
      if (e.target.getAttribute('data-sf-input') === 'search') {
        var sec = e.target.getAttribute('data-sec');
        state.filters[sec] = state.filters[sec] || {};
        state.filters[sec].q = e.target.value;
        render();
      }
    });

    root.addEventListener('submit', function (e) {
      if (e.target.getAttribute('data-sf-form') === 'checkout') { e.preventDefault(); placeOrder(e.target); }
    });

    render();
    return api;
  }

  global.SahaayStorefront = { mount: mount, money: money, esc: esc, visual: visual, art: art, onColor: onColor, initials: initials, isImgUrl: isImgUrl, icon: icon, ICONS: ICONS };
})(typeof window !== 'undefined' ? window : this);
