/* Sahaay Stores — storefront renderer.
 * Self-contained: used for the live preview inside the builder AND inlined
 * verbatim into every exported store website, so it must not depend on
 * anything from app.js.
 *
 *   SahaayStorefront.mount(rootEl, store, { mode: 'preview' | 'live', onOrder })
 */
(function (global) {
  'use strict';

  var FONTS = {
    modern: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    elegant: "'Playfair Display', Georgia, serif",
    friendly: "'Nunito', 'Inter', system-ui, sans-serif"
  };

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

  // Deterministic soft gradient for products without photos.
  function placeholderStyle(seed, primary) {
    var h = 0, str = String(seed || 'x');
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return 'background:linear-gradient(135deg,hsl(' + h + ',55%,88%),hsl(' + ((h + 40) % 360) + ',60%,78%));';
  }

  function productImage(p, cls, primary) {
    if (p.images && p.images.length) {
      return '<img class="' + cls + '" src="' + esc(p.images[0]) + '" alt="' + esc(p.title) + '" loading="lazy">';
    }
    var label = p.emoji || (p.title || '?').trim().charAt(0).toUpperCase();
    return '<div class="' + cls + ' sf-ph" style="' + placeholderStyle(p.id || p.title, primary) + '"><span>' + esc(label) + '</span></div>';
  }

  function inStock(p) { return p.stock == null || p.stock === '' || Number(p.stock) > 0; }
  function maxQty(p) { return (p.stock == null || p.stock === '') ? 99 : Math.max(0, Number(p.stock)); }

  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }

  function orderId() {
    var d = new Date();
    return 'ORD-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
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
      imgIdx: 0
    };

    function loadCart() {
      if (mode !== 'live') return [];
      try { return JSON.parse(localStorage.getItem(cartKey)) || []; } catch (e) { return []; }
    }
    function saveCart() {
      if (mode !== 'live') return;
      try { localStorage.setItem(cartKey, JSON.stringify(state.cart)); } catch (e) { /* storage unavailable */ }
    }

    function products() {
      return (store.products || []).filter(function (p) { return p.active !== false; });
    }
    function findProduct(id) {
      return (store.products || []).filter(function (p) { return p.id === id; })[0];
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

    // ---------- templates ----------
    function header() {
      var logo = store.logo && store.logo.indexOf('data:') === 0
        ? '<img src="' + esc(store.logo) + '" alt="" class="sf-logo-img">'
        : '<span class="sf-logo-emoji">' + esc(store.logo || '🛍️') + '</span>';
      var count = cartCount();
      return (store.announcement ? '<div class="sf-announce">' + esc(store.announcement) + '</div>' : '') +
        '<header class="sf-header"><div class="sf-wrap sf-header-in">' +
        '<a class="sf-brand" href="#" data-sf="home">' + logo + '<span>' + esc(store.name || 'My Store') + '</span></a>' +
        '<button class="sf-cart-btn" data-sf="open-cart" aria-label="Open cart">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        (count ? '<span class="sf-badge">' + count + '</span>' : '') +
        '</button></div></header>';
    }

    function hero() {
      var h = store.hero || {};
      var bg = h.image ? ' style="background-image:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(\'' + esc(h.image) + '\')"' : '';
      return '<section class="sf-hero' + (h.image ? ' sf-hero-img' : '') + '"' + bg + '><div class="sf-wrap">' +
        '<h1>' + esc(h.heading || store.name) + '</h1>' +
        (h.subheading || store.tagline ? '<p>' + esc(h.subheading || store.tagline) + '</p>' : '') +
        '<a href="#sf-products" class="sf-btn sf-btn-lg" data-sf="scroll-products">' + esc(h.cta || 'Shop now') + '</a>' +
        '</div></section>';
    }

    function productGrid() {
      var all = products();
      var cats = [];
      all.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
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

      var cards = list.map(function (p) {
        var sale = Number(p.compareAt) > Number(p.price);
        return '<article class="sf-card" data-sf="view" data-id="' + esc(p.id) + '" tabindex="0">' +
          '<div class="sf-card-media">' + productImage(p, 'sf-card-img') +
          (!inStock(p) ? '<span class="sf-tag sf-tag-out">Sold out</span>' : sale ? '<span class="sf-tag">Sale</span>' : '') +
          '</div><div class="sf-card-body"><h3>' + esc(p.title) + '</h3>' +
          '<div class="sf-price">' + cur(p.price) + (sale ? ' <s>' + cur(p.compareAt) + '</s>' : '') + '</div>' +
          '</div></article>';
      }).join('');

      var empty = !all.length
        ? '<p class="sf-empty">New products are coming soon. Check back shortly!</p>'
        : !list.length ? '<p class="sf-empty">No products match your search.</p>' : '';

      return '<section class="sf-section" id="sf-products"><div class="sf-wrap">' +
        '<div class="sf-section-head"><h2>' + esc(store.productsHeading || 'Our products') + '</h2>' +
        (all.length > 4 ? '<input class="sf-search" type="search" placeholder="Search products" value="' + esc(state.query) + '" data-sf-input="search">' : '') +
        '</div>' + chips + '<div class="sf-grid">' + cards + '</div>' + empty + '</div></section>';
    }

    function about() {
      if (!store.about) return '';
      return '<section class="sf-section sf-about"><div class="sf-wrap sf-narrow"><h2>About us</h2>' +
        '<p>' + esc(store.about).replace(/\n/g, '<br>') + '</p></div></section>';
    }

    function footer() {
      var c = store.contact || {};
      var items = [];
      if (c.whatsapp) items.push('<a href="https://wa.me/' + waDigits(c.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>');
      if (c.phone) items.push('<a href="tel:' + esc(c.phone) + '">' + esc(c.phone) + '</a>');
      if (c.email) items.push('<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>');
      if (c.instagram) items.push('<a href="https://instagram.com/' + esc(String(c.instagram).replace(/^@/, '')) + '" target="_blank" rel="noopener">Instagram</a>');
      return '<footer class="sf-footer"><div class="sf-wrap">' +
        '<div class="sf-footer-name">' + esc(store.name) + '</div>' +
        (c.address ? '<div class="sf-footer-addr">' + esc(c.address).replace(/\n/g, '<br>') + '</div>' : '') +
        (items.length ? '<div class="sf-footer-links">' + items.join('') + '</div>' : '') +
        '<div class="sf-footer-small">© ' + new Date().getFullYear() + ' ' + esc(store.name) +
        ' · Built with Sahaay Stores</div>' +
        '</div></footer>';
    }

    function drawer() {
      var lines = cartLines();
      var t = totals();
      var sh = store.shipping || {};
      var body = lines.length ? lines.map(function (l) {
        return '<div class="sf-line">' + productImage(l.p, 'sf-line-img') +
          '<div class="sf-line-info"><div class="sf-line-title">' + esc(l.p.title) + '</div>' +
          '<div class="sf-line-price">' + cur(l.p.price) + '</div>' +
          '<div class="sf-stepper"><button data-sf="dec" data-id="' + esc(l.p.id) + '" aria-label="Decrease">−</button>' +
          '<span>' + l.qty + '</span><button data-sf="inc" data-id="' + esc(l.p.id) + '" aria-label="Increase"' + (l.qty >= maxQty(l.p) ? ' disabled' : '') + '>+</button></div></div>' +
          '<button class="sf-line-rm" data-sf="rm" data-id="' + esc(l.p.id) + '" aria-label="Remove">✕</button></div>';
      }).join('') : '<p class="sf-empty">Your cart is empty.</p>';

      var freeHint = Number(sh.freeAbove) > 0 && t.subtotal > 0 && t.subtotal < Number(sh.freeAbove)
        ? '<div class="sf-hint">Add ' + cur(Number(sh.freeAbove) - t.subtotal) + ' more for free delivery</div>' : '';

      // A freshly opened drawer renders closed first so it can slide in (see render()).
      var open = state.drawer && state.shownDrawer;
      return '<div class="sf-overlay' + (open ? ' open' : '') + '" data-sf="close-cart"></div>' +
        '<aside class="sf-drawer' + (open ? ' open' : '') + '" aria-hidden="' + !state.drawer + '">' +
        '<div class="sf-drawer-head"><h2>Your cart</h2><button class="sf-x" data-sf="close-cart" aria-label="Close">✕</button></div>' +
        '<div class="sf-drawer-body">' + body + '</div>' +
        (lines.length ? '<div class="sf-drawer-foot">' + freeHint +
          summaryRows(t) +
          '<button class="sf-btn sf-btn-block" data-sf="checkout">Checkout</button></div>' : '') +
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
      var media = imgs
        ? '<img class="sf-pd-img" src="' + esc(imgs[idx]) + '" alt="' + esc(p.title) + '">' +
          (imgs.length > 1 ? '<div class="sf-thumbs">' + imgs.map(function (src, i) {
            return '<button class="sf-thumb' + (i === idx ? ' on' : '') + '" data-sf="img" data-i="' + i + '"><img src="' + esc(src) + '" alt=""></button>';
          }).join('') + '</div>' : '')
        : productImage(p, 'sf-pd-img');
      var sale = Number(p.compareAt) > Number(p.price);
      var ok = inStock(p);
      var low = ok && p.stock != null && p.stock !== '' && Number(p.stock) <= 5;
      return '<div class="sf-pd"><div class="sf-pd-media">' + media + '</div><div class="sf-pd-info">' +
        (p.category ? '<div class="sf-pd-cat">' + esc(p.category) + '</div>' : '') +
        '<h2>' + esc(p.title) + '</h2>' +
        '<div class="sf-price sf-price-lg">' + cur(p.price) + (sale ? ' <s>' + cur(p.compareAt) + '</s>' : '') + '</div>' +
        (low ? '<div class="sf-low">Only ' + Number(p.stock) + ' left</div>' : '') +
        (p.description ? '<p class="sf-pd-desc">' + esc(p.description).replace(/\n/g, '<br>') + '</p>' : '') +
        (ok
          ? '<div class="sf-pd-actions"><div class="sf-stepper sf-stepper-lg"><button data-sf="qty-dec" aria-label="Decrease">−</button><span>' + state.qty + '</span><button data-sf="qty-inc" aria-label="Increase">+</button></div>' +
            '<button class="sf-btn" data-sf="add" data-id="' + esc(p.id) + '">Add to cart</button></div>' +
            '<button class="sf-btn sf-btn-ghost sf-btn-block" data-sf="buy" data-id="' + esc(p.id) + '">Buy now</button>'
          : '<button class="sf-btn sf-btn-block" disabled>Sold out</button>') +
        '</div></div>';
    }

    function checkoutModal() {
      var t = totals();
      var pay = store.payments || {};
      var methods = [];
      if (pay.upi) methods.push(['upi', 'Pay online via UPI', 'GPay, PhonePe, Paytm or any UPI app']);
      if (pay.cod) methods.push(['cod', 'Cash on delivery', 'Pay when your order arrives']);
      if (!methods.length) methods.push(['confirm', 'Confirm payment with seller', 'We\'ll share payment details with you']);
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem('sahaay-buyer') || '{}'); } catch (e) { /* ignore */ }
      return '<form class="sf-checkout" data-sf-form="checkout"><h2>Checkout</h2>' +
        '<label>Full name<input name="name" required autocomplete="name" value="' + esc(saved.name || '') + '"></label>' +
        '<label>Phone number<input name="phone" required type="tel" autocomplete="tel" value="' + esc(saved.phone || '') + '"></label>' +
        '<label>Delivery address<textarea name="address" required rows="3" autocomplete="street-address">' + esc(saved.address || '') + '</textarea></label>' +
        '<label>Note for the seller <span class="sf-opt">(optional)</span><input name="note"></label>' +
        '<fieldset class="sf-pay"><legend>Payment</legend>' + methods.map(function (m, i) {
          return '<label class="sf-radio"><input type="radio" name="payment" value="' + m[0] + '"' + (i === 0 ? ' checked' : '') + '>' +
            '<span><b>' + m[1] + '</b><small>' + m[2] + '</small></span></label>';
        }).join('') + '</fieldset>' +
        '<div class="sf-order-box">' + cartLines().map(function (l) {
          return '<div class="sf-sum"><span>' + esc(l.p.title) + ' × ' + l.qty + '</span><span>' + cur(l.p.price * l.qty) + '</span></div>';
        }).join('') + summaryRows(t) + '</div>' +
        '<button class="sf-btn sf-btn-block sf-btn-lg" type="submit">Place order · ' + cur(t.total) + '</button></form>';
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
        actions.push('<a class="sf-btn sf-btn-block sf-btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + waDigits(c.whatsapp) + '?text=' + msg + '">Send order on WhatsApp</a>');
      }
      if (o.payment === 'upi' && pay.upi) {
        var upi = 'upi://pay?pa=' + encodeURIComponent(pay.upi) + '&pn=' + encodeURIComponent(store.name) +
          '&am=' + o.total.toFixed(2) + '&cu=' + encodeURIComponent(store.currency || 'INR') + '&tn=' + encodeURIComponent(o.id);
        actions.push('<a class="sf-btn sf-btn-block sf-btn-ghost" href="' + esc(upi) + '">Pay ' + cur(o.total) + ' with a UPI app</a>' +
          '<div class="sf-hint">UPI ID: <b>' + esc(pay.upi) + '</b> · add <b>' + esc(o.id) + '</b> as the note</div>');
      }
      if (c.email) {
        actions.push('<a class="sf-btn sf-btn-block sf-btn-ghost" href="mailto:' + esc(c.email) + '?subject=' + encodeURIComponent('New order ' + o.id) + '&body=' + msg + '">Email the order</a>');
      }
      var step = mode === 'live' && c.whatsapp
        ? '<p class="sf-done-lead"><b>One last step:</b> send your order to the seller on WhatsApp so they can confirm it.</p>'
        : '<p class="sf-done-lead">Thank you! The seller will contact you to confirm your order.</p>';
      return '<div class="sf-done"><div class="sf-done-icon">✓</div><h2>Order placed</h2>' +
        '<div class="sf-done-id">' + esc(o.id) + '</div>' + step + actions.join('') +
        '<button class="sf-btn sf-btn-link" data-sf="close-modal">Continue shopping</button></div>';
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
        '<button class="sf-x sf-modal-x" data-sf="close-modal" aria-label="Close">✕</button>' + inner + '</div></div>';
    }

    // ---------- render ----------
    function render() {
      var th = store.theme || {};
      var scrollY = root.scrollTop;
      var modalScroll = root.querySelector('.sf-modal') ? root.querySelector('.sf-modal').scrollTop : 0;
      var focused = document.activeElement && document.activeElement.getAttribute('data-sf-input');
      root.innerHTML = '<div class="sf" data-template="' + esc(th.template || 'classic') + '" style="--sf-primary:' + esc(th.primary || '#C4798A') +
        ';--sf-font:' + esc(FONTS[th.font] || FONTS.modern) + '">' +
        header() + '<main>' + hero() + productGrid() + about() + '</main>' + footer() + drawer() + modal() + '</div>';
      state.shownModal = state.modal ? state.modal.type : null;
      if (state.drawer && !state.shownDrawer) {
        state.shownDrawer = true;
        requestAnimationFrame(function () {
          var d = root.querySelector('.sf-drawer'), o = root.querySelector('.sf-overlay');
          if (d) { void d.offsetWidth; d.classList.add('open'); o.classList.add('open'); }
        });
      } else if (!state.drawer) state.shownDrawer = false;
      root.scrollTop = scrollY;
      var m = root.querySelector('.sf-modal');
      if (m) m.scrollTop = modalScroll;
      if (focused) {
        var el = root.querySelector('[data-sf-input="' + focused + '"]');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      }
      document.body.classList.toggle('sf-lock', mode === 'live' && (!!state.modal || state.drawer));
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
      if (typeof opts.onOrder === 'function') opts.onOrder(o);
      state.cart = [];
      saveCart();
      state.modal = { type: 'done', order: o };
      render();
    }

    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-sf]');
      if (!t || !root.contains(t)) return;
      var a = t.getAttribute('data-sf');
      var id = t.getAttribute('data-id');
      if (a === 'close-modal-bg' && e.target !== t) return;
      if (t.tagName === 'A' && a !== 'home' && a !== 'scroll-products') { /* real links */ } else e.preventDefault();

      switch (a) {
        case 'home': state.modal = null; state.drawer = false; render(); root.scrollTop = 0; window.scrollTo(0, 0); return;
        case 'scroll-products': {
          var sec = root.querySelector('#sf-products');
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        case 'view': state.modal = { type: 'product', id: id }; state.qty = 1; state.imgIdx = 0; break;
        case 'img': state.imgIdx = Number(t.getAttribute('data-i')); break;
        case 'qty-inc': {
          var mp = findProduct(state.modal && state.modal.id);
          state.qty = Math.min(mp ? maxQty(mp) : 99, state.qty + 1); break;
        }
        case 'qty-dec': state.qty = Math.max(1, state.qty - 1); break;
        case 'add': addToCart(id, state.qty); state.modal = null; state.drawer = true; break;
        case 'buy': addToCart(id, state.qty); state.modal = { type: 'checkout' }; break;
        case 'open-cart': state.drawer = true; break;
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

  global.SahaayStorefront = { mount: mount, money: money, esc: esc };
})(typeof window !== 'undefined' ? window : this);
