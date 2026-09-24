/* Sahaay Stores — builder app (setup wizard + admin dashboard).
 * All data lives in localStorage under KEY; the storefront renderer
 * (storefront.js) turns that same object into the customer-facing site. */
(function () {
  'use strict';

  var KEY = 'sahaay-stores:v1';
  var esc = SahaayStorefront.esc;
  var app = document.getElementById('app');
  var landing = document.getElementById('landing');

  var COLORS = ['#C4798A', '#D9642B', '#2F7D5B', '#2F5D9E', '#7A4FB5', '#B8862F', '#1F1D1B', '#D0467A'];
  var LOGO_EMOJIS = ['🛍️', '🏪', '🧁', '👗', '🧶', '💄', '🪴', '🔌', '🛒', '☕', '💍', '📚', '🧸', '🌸', '🥭', '✨'];
  var CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'NPR', 'LKR', 'BDT'];
  var STATUSES = [
    ['new', 'New', 'blue'], ['confirmed', 'Confirmed', 'amber'], ['paid', 'Paid', 'green'],
    ['shipped', 'Shipped', 'amber'], ['delivered', 'Delivered', 'green'], ['cancelled', 'Cancelled', 'red']
  ];

  var PRESETS = {
    food: {
      label: 'Food & bakery', emoji: '🧁', color: '#C4798A', font: 'elegant', template: 'classic',
      hero: 'Freshly made, delivered to your door', productsHeading: 'Today\'s menu',
      about: 'We bake everything in small batches with simple, honest ingredients. Order a day in advance for custom cakes.',
      samples: [
        ['Chocolate truffle cake (1 kg)', 850, 950, 'Cakes', 'Rich, moist chocolate sponge layered with dark chocolate ganache. Eggless option available.', '🎂'],
        ['Butter cookies (250 g)', 240, null, 'Cookies', 'Melt-in-the-mouth butter cookies, baked fresh every morning.', '🍪'],
        ['Assorted cupcake box (6 pcs)', 420, null, 'Cupcakes', 'Six cupcakes in our bestselling flavours: red velvet, vanilla and chocolate.', '🧁']
      ]
    },
    fashion: {
      label: 'Clothing & fashion', emoji: '👗', color: '#1F1D1B', font: 'modern', template: 'minimal',
      hero: 'Everyday styles, made to last', productsHeading: 'New arrivals',
      about: 'Comfortable, well-made clothing designed for everyday life. Easy exchanges within 7 days.',
      samples: [
        ['Cotton block-print kurta', 1290, 1590, 'Women', 'Breathable hand block-printed cotton. Available in S–XXL.', '👗'],
        ['Linen shirt, sky blue', 1490, null, 'Men', 'Relaxed-fit linen shirt that stays cool on hot days.', '👔'],
        ['Silk-blend stole', 690, null, 'Accessories', 'Lightweight stole with a soft sheen and tassel finish.', '🧣']
      ]
    },
    crafts: {
      label: 'Handmade & crafts', emoji: '🧶', color: '#D9642B', font: 'friendly', template: 'classic',
      hero: 'Handmade with love, one piece at a time', productsHeading: 'Shop handmade',
      about: 'Every piece is made by hand in our home studio, so no two are exactly alike.',
      samples: [
        ['Crochet flower bouquet', 650, null, 'Decor', 'A bouquet of crochet flowers that never wilt. Makes a lovely gift.', '💐'],
        ['Hand-painted coasters (set of 4)', 480, 560, 'Home', 'Wooden coasters, hand-painted and sealed to be water-resistant.', '🎨'],
        ['Macramé wall hanging', 1150, null, 'Decor', 'Cotton-cord macramé on a driftwood rod, about 60 cm long.', '🪢']
      ]
    },
    beauty: {
      label: 'Beauty & wellness', emoji: '💄', color: '#D0467A', font: 'elegant', template: 'classic',
      hero: 'Clean, gentle care for every day', productsHeading: 'Bestsellers',
      about: 'Small-batch skincare made with natural ingredients. No harsh chemicals, never tested on animals.',
      samples: [
        ['Rose & aloe face gel (100 ml)', 399, null, 'Skincare', 'Lightweight, cooling gel for all skin types.', '🌹'],
        ['Cold-pressed hair oil (200 ml)', 449, 499, 'Haircare', 'Coconut, bhringraj and amla oil blend for stronger hair.', '🫙'],
        ['Handmade soap trio', 330, null, 'Bath', 'Three handmade soaps: charcoal, turmeric and lavender.', '🧼']
      ]
    },
    home: {
      label: 'Home & decor', emoji: '🪴', color: '#2F7D5B', font: 'modern', template: 'minimal',
      hero: 'Pieces that make a house feel like home', productsHeading: 'Shop the collection',
      about: 'Thoughtfully chosen decor and everyday objects for calm, beautiful homes.',
      samples: [
        ['Ceramic planter, speckled white', 690, null, 'Planters', 'Hand-glazed ceramic planter with a drainage hole. 15 cm.', '🪴'],
        ['Cotton throw, mustard', 1250, 1500, 'Textiles', 'Soft woven throw with fringe detail. 125 × 150 cm.', '🧺'],
        ['Brass tealight holder', 540, null, 'Lighting', 'Solid brass holder that glows beautifully in the evening.', '🕯️']
      ]
    },
    electronics: {
      label: 'Electronics', emoji: '🔌', color: '#2F5D9E', font: 'modern', template: 'bold',
      hero: 'Genuine gadgets & accessories', productsHeading: 'Top picks',
      about: 'Genuine products with bill and warranty. Same-day delivery across the city.',
      samples: [
        ['20W fast charger (USB-C)', 699, 999, 'Chargers', 'Compact fast charger compatible with most phones.', '🔌'],
        ['Wireless earbuds', 1499, 1999, 'Audio', 'Up to 24 hours of battery with the case. Clear calls.', '🎧'],
        ['Braided USB-C cable (1.5 m)', 299, null, 'Cables', 'Tough nylon-braided cable, tested for 10,000+ bends.', '🔋']
      ]
    },
    grocery: {
      label: 'Grocery & daily needs', emoji: '🛒', color: '#2F7D5B', font: 'friendly', template: 'bold',
      hero: 'Daily essentials, delivered fast', productsHeading: 'Shop essentials',
      about: 'Your neighbourhood store, now online. Order before 6 pm for same-day delivery.',
      samples: [
        ['Basmati rice (5 kg)', 649, 720, 'Staples', 'Long-grain aged basmati rice.', '🍚'],
        ['Cold-pressed groundnut oil (1 L)', 289, null, 'Oils', 'Wood-pressed, unrefined groundnut oil.', '🫗'],
        ['Alphonso mangoes (1 dozen)', 899, null, 'Fruits', 'Hand-picked Ratnagiri Alphonso mangoes, naturally ripened.', '🥭']
      ]
    },
    other: {
      label: 'Something else', emoji: '🏪', color: '#7A4FB5', font: 'modern', template: 'classic',
      hero: 'Quality products, friendly service', productsHeading: 'Our products',
      about: 'Tell your customers who you are, what you make and why they will love it.',
      samples: [
        ['Sample product one', 499, null, 'Featured', 'Describe what makes this product special.', '⭐'],
        ['Sample product two', 799, 999, 'Featured', 'Add details like size, material and how to use it.', '🎁'],
        ['Sample product three', 299, null, 'New', 'Great descriptions help customers decide to buy.', '📦']
      ]
    }
  };

  // ---------- storage ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  var store = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      toast('Storage is full. Try fewer or smaller photos.');
      return false;
    }
  }

  function uid(prefix) { return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function money(n) { return SahaayStorefront.money(n, store && store.currency); }
  function waDigits(n) { return String(n || '').replace(/\D/g, ''); }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    } catch (e) { return iso; }
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

  function logoHtml(logo, cls) {
    return '<span class="' + cls + '">' + (logo && logo.indexOf('data:') === 0 ? '<img src="' + esc(logo) + '" alt="">' : esc(logo || '🛍️')) + '</span>';
  }

  function thumbHtml(p) {
    if (p.images && p.images.length) return '<img class="thumb" src="' + esc(p.images[0]) + '" alt="">';
    return '<span class="thumb">' + esc(p.emoji || (p.title || '?').charAt(0).toUpperCase()) + '</span>';
  }

  function statusPill(s) {
    var st = STATUSES.filter(function (x) { return x[0] === s; })[0] || STATUSES[0];
    return '<span class="pill pill-' + st[2] + '">' + st[1] + '</span>';
  }

  // ---------- router ----------
  function route() {
    var h = location.hash || '';
    if (h.indexOf('#/') !== 0 || h === '#/') return { name: 'landing' };
    var parts = h.slice(2).split('/');
    return { name: parts[0], sub: parts[1] || '', id: parts[2] || '' };
  }

  function render() {
    var r = route();
    if (r.name === 'landing') {
      app.hidden = true;
      landing.hidden = false;
      document.querySelectorAll('[data-start]').forEach(function (a) {
        if (!a.dataset.orig) a.dataset.orig = a.textContent;
        a.href = store ? '#/admin' : '#/setup';
        a.textContent = store ? (a.classList.contains('btn-sm') ? 'My dashboard' : 'Open my store dashboard') : a.dataset.orig;
      });
      document.title = 'Sahaay Stores — Build your online shop in minutes, free';
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
    render();
    if (route().name !== 'landing') window.scrollTo(0, 0);
  });

  // ============================================================
  // Setup wizard
  // ============================================================
  var wz = { step: 0, d: { name: '', category: '', tagline: '', logo: '', primary: '', template: '', font: '', whatsapp: '', upi: '', cod: true, email: '', currency: 'INR', samples: true } };

  function applyPreset(cat) {
    var p = PRESETS[cat];
    wz.d.category = cat;
    wz.d.logo = p.emoji;
    wz.d.primary = p.color;
    wz.d.template = p.template;
    wz.d.font = p.font;
  }

  function renderWizard() {
    document.title = 'Create your store · Sahaay Stores';
    var d = wz.d, s = wz.step, body = '';
    var steps = 4;

    if (s === 0) {
      body = '<h1>Let\'s set up your shop</h1><p class="wz-sub">It takes about 3 minutes. You can change anything later.</p>' +
        (store ? '<div class="callout">You already have a store called <b>' + esc(store.name) + '</b>. Finishing this setup will replace it. <a href="#/admin">Go to its dashboard instead</a></div>' : '') +
        '<div class="field"><label for="wz-name">What\'s your shop called?</label><input id="wz-name" data-wz="name" placeholder="e.g. Priya\'s Bakes" value="' + esc(d.name) + '" maxlength="60" autofocus></div>' +
        '<div class="field"><span class="field-label">What do you sell?</span><div class="cat-grid">' +
        Object.keys(PRESETS).map(function (k) {
          return '<button type="button" class="cat-opt' + (d.category === k ? ' on' : '') + '" data-action="wz-cat" data-cat="' + k + '"><span>' + PRESETS[k].emoji + '</span>' + PRESETS[k].label + '</button>';
        }).join('') + '</div></div>' +
        '<div class="field"><label for="wz-tag">Describe your shop in one line <span class="help" style="display:inline">(optional)</span></label><input id="wz-tag" data-wz="tagline" placeholder="e.g. Eggless cakes & cookies, delivered in Pune" value="' + esc(d.tagline) + '" maxlength="120"></div>';
    } else if (s === 1) {
      body = '<h1>Choose your look</h1><p class="wz-sub">We\'ve picked a starting style for ' + esc(PRESETS[d.category].label.toLowerCase()) + '. Make it yours.</p>' +
        '<div class="field"><span class="field-label">Logo</span><div class="emoji-row">' + LOGO_EMOJIS.map(function (e) {
          return '<button type="button" class="' + (d.logo === e ? 'on' : '') + '" data-action="wz-set" data-k="logo" data-v="' + e + '">' + e + '</button>';
        }).join('') + '</div><small>You can upload your own logo image later from Design.</small></div>' +
        '<div class="field"><span class="field-label">Brand colour</span><div class="swatches">' + COLORS.map(function (c) {
          return '<button type="button" class="swatch' + (d.primary === c ? ' on' : '') + '" style="background:' + c + '" data-action="wz-set" data-k="primary" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
        }).join('') + '<input type="color" data-wz="primary" value="' + esc(d.primary) + '" aria-label="Custom colour"></div></div>' +
        '<div class="field"><span class="field-label">Style</span><div class="opt-row">' +
        [['classic', 'Classic', 'Soft & friendly'], ['bold', 'Bold', 'Strong & modern'], ['minimal', 'Minimal', 'Clean & elegant']].map(function (o) {
          return '<button type="button" class="opt' + (d.template === o[0] ? ' on' : '') + '" data-action="wz-set" data-k="template" data-v="' + o[0] + '">' + o[1] + '<small>' + o[2] + '</small></button>';
        }).join('') + '</div></div>' +
        '<div class="field"><span class="field-label">Font</span><div class="opt-row">' +
        [['modern', 'Modern', 'Inter'], ['elegant', 'Elegant', 'Playfair'], ['friendly', 'Friendly', 'Nunito']].map(function (o) {
          return '<button type="button" class="opt' + (d.font === o[0] ? ' on' : '') + '" data-action="wz-set" data-k="font" data-v="' + o[0] + '" style="font-family:' + ({ modern: 'Inter', elegant: 'Playfair Display', friendly: 'Nunito' })[o[0]] + '">' + o[1] + '<small>' + o[2] + '</small></button>';
        }).join('') + '</div></div>';
    } else if (s === 2) {
      body = '<h1>How will you get orders?</h1><p class="wz-sub">When a customer checks out, their order is sent to your WhatsApp with their address, ready to confirm.</p>' +
        '<div class="field"><label for="wz-wa">WhatsApp number for orders</label><input id="wz-wa" data-wz="whatsapp" type="tel" inputmode="tel" placeholder="e.g. 91 98765 43210" value="' + esc(d.whatsapp) + '"><small>Include your country code (91 for India).</small></div>' +
        '<div class="field"><label for="wz-upi">UPI ID for payments <span class="help" style="display:inline">(optional)</span></label><input id="wz-upi" data-wz="upi" placeholder="e.g. priyabakes@okaxis" value="' + esc(d.upi) + '" autocapitalize="off"><small>Customers pay straight into your account. No fees.</small></div>' +
        '<label class="check"><input type="checkbox" data-wz="cod"' + (d.cod ? ' checked' : '') + '><span>Accept cash on delivery</span></label>' +
        '<div class="field-row" style="margin-top:14px"><div class="field"><label for="wz-email">Email <span class="help" style="display:inline">(optional)</span></label><input id="wz-email" data-wz="email" type="email" value="' + esc(d.email) + '"></div>' +
        '<div class="field"><label for="wz-cur">Currency</label><select id="wz-cur" data-wz="currency">' + CURRENCIES.map(function (c) {
          return '<option' + (d.currency === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('') + '</select></div></div>';
    } else {
      body = '<h1>Ready to launch</h1><p class="wz-sub">Here\'s your shop. Next you\'ll land on your dashboard to add products.</p>' +
        '<div class="card" style="display:flex;gap:14px;align-items:center">' + logoHtml(d.logo, 'side-logo') +
        '<div><b style="font-size:18px">' + esc(d.name) + '</b><div style="color:var(--text2);font-size:14px">' + esc(PRESETS[d.category].label) + ' · ' + esc(d.template) + ' style · ' + esc(d.currency) + '</div></div>' +
        '<span class="swatch" style="background:' + esc(d.primary) + ';margin-left:auto"></span></div>' +
        '<label class="check"><input type="checkbox" data-wz="samples"' + (d.samples ? ' checked' : '') + '><span>Add 3 sample products<small>See how your store looks straight away. Delete them any time.</small></span></label>' +
        (!waDigits(d.whatsapp) && !d.email ? '<div class="callout" style="margin-top:14px">You haven\'t added a WhatsApp number or email, so customers won\'t be able to send you orders yet. You can add one later in Settings.</div>' : '');
    }

    var canNext = s === 0 ? d.name.trim() && d.category : true;
    app.innerHTML = '<div class="wz"><div class="wz-top"><a class="lp-logo" href="#/">🛍️ <span>Sahaay <em>Stores</em></span></a>' +
      '<span style="color:var(--text3);font-size:14px">Step ' + (s + 1) + ' of ' + steps + '</span></div>' +
      '<div class="wz-progress">' + Array.from({ length: steps }, function (_, i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      body +
      '<div class="wz-nav">' + (s > 0 ? '<button class="btn btn-ghost" data-action="wz-back">Back</button>' : '<a class="btn btn-ghost" href="#/">Cancel</a>') +
      (s < steps - 1
        ? '<button class="btn btn-accent" data-action="wz-next"' + (canNext ? '' : ' disabled') + '>Continue</button>'
        : '<button class="btn btn-accent" data-action="wz-finish">Create my store 🎉</button>') +
      '</div></div>';
  }

  function finishWizard() {
    var d = wz.d, p = PRESETS[d.category];
    store = {
      id: uid('s'),
      createdAt: new Date().toISOString(),
      name: d.name.trim(),
      tagline: d.tagline.trim(),
      category: d.category,
      logo: d.logo || p.emoji,
      currency: d.currency,
      theme: { template: d.template, primary: d.primary, font: d.font },
      hero: { heading: p.hero, subheading: d.tagline.trim(), cta: 'Shop now', image: '' },
      productsHeading: p.productsHeading,
      announcement: '',
      about: p.about,
      contact: { whatsapp: waDigits(d.whatsapp), phone: '', email: d.email.trim(), instagram: '', address: '' },
      payments: { upi: d.upi.trim(), cod: !!d.cod },
      shipping: { flat: 0, freeAbove: 0 },
      products: d.samples ? p.samples.map(function (x) {
        return { id: uid('p'), title: x[0], price: x[1], compareAt: x[2], category: x[3], description: x[4], emoji: x[5], stock: null, images: [], active: true, sample: true };
      }) : [],
      orders: [],
      flags: {}
    };
    save();
    wz = { step: 0, d: { name: '', category: '', tagline: '', logo: '', primary: '', template: '', font: '', whatsapp: '', upi: '', cod: true, email: '', currency: 'INR', samples: true } };
    location.hash = '#/admin';
    toast('Your store is ready!');
  }

  // ============================================================
  // Admin
  // ============================================================
  var NAV = [
    ['', 'Home', '🏠'], ['products', 'Products', '📦'], ['orders', 'Orders', '🧾'],
    ['design', 'Design', '🎨'], ['settings', 'Settings', '⚙️'], ['publish', 'Publish', '🚀']
  ];

  function newOrdersCount() {
    return (store.orders || []).filter(function (o) { return o.status === 'new'; }).length;
  }

  function renderAdmin(r) {
    var sub = r.sub;
    var content;
    if (sub === 'products' && r.id) content = pageProductForm(r.id);
    else if (sub === 'products') content = pageProducts();
    else if (sub === 'orders') content = pageOrders();
    else if (sub === 'design') content = pageDesign();
    else if (sub === 'settings') content = pageSettings();
    else if (sub === 'publish') content = pagePublish();
    else content = pageHome();

    var nc = newOrdersCount();
    var navLinks = function () {
      return NAV.map(function (n) {
        var on = n[0] === sub || (n[0] === '' && !sub);
        return '<a href="#/admin' + (n[0] ? '/' + n[0] : '') + '" class="' + (on ? 'on' : '') + '"><span class="ic">' + n[2] + '</span><span>' + n[1] + '</span>' +
          (n[0] === 'orders' && nc ? '<span class="count">' + nc + '</span>' : '') + '</a>';
      }).join('');
    };

    document.title = store.name + ' · Sahaay Stores';
    app.innerHTML = '<div class="shell">' +
      '<aside class="side"><div class="side-store">' + logoHtml(store.logo, 'side-logo') + '<div style="min-width:0"><b>' + esc(store.name) + '</b><small>Sahaay Stores</small></div></div>' +
      '<nav class="nav">' + navLinks() + '</nav>' +
      '<div class="side-foot"><a class="btn btn-ghost btn-sm" href="preview.html" target="_blank" rel="noopener">View my store ↗</a></div></aside>' +
      '<div><div class="mobile-top">' + logoHtml(store.logo, 'side-logo') + '<b>' + esc(store.name) + '</b><a class="btn btn-ghost btn-sm" href="preview.html" target="_blank" rel="noopener">View store</a></div>' +
      '<main class="main">' + content + '</main></div>' +
      '<nav class="bottom-nav">' + navLinks() + '</nav></div>';

    if (sub === 'design') setupPreview();
  }

  // ---------- home ----------
  function checklist() {
    var s = store;
    var prods = s.products || [];
    return [
      ['Create your store', true, ''],
      ['Add at least 3 of your own products', prods.filter(function (p) { return !p.sample; }).length >= 3, '#/admin/products/new'],
      ['Add a real product photo', prods.some(function (p) { return p.images && p.images.length; }), '#/admin/products'],
      ['Set up WhatsApp or email for orders', !!(s.contact.whatsapp || s.contact.email), '#/admin/settings'],
      ['Add a payment method (UPI or cash on delivery)', !!(s.payments.upi || s.payments.cod), '#/admin/settings'],
      ['Customise your design', !!s.flags.designed, '#/admin/design'],
      ['Place a test order on your store', (s.orders || []).some(function (o) { return o.test; }), 'preview.html'],
      ['Publish your store online', !!s.flags.published, '#/admin/publish']
    ];
  }

  function orderRevenue(list) {
    return list.filter(function (o) { return o.status !== 'cancelled'; }).reduce(function (s, o) { return s + (Number(o.total) || 0); }, 0);
  }

  function pageHome() {
    var orders = store.orders || [];
    var rev = orderRevenue(orders);
    var cl = checklist();
    var done = cl.filter(function (c) { return c[1]; }).length;
    var samples = (store.products || []).filter(function (p) { return p.sample; }).length;

    return '<div class="page-head"><div><h1>Welcome back 👋</h1><p>Here\'s how ' + esc(store.name) + ' is doing.</p></div>' +
      '<div class="page-actions"><a class="btn btn-ghost" href="#/admin/products/new">+ Add product</a><a class="btn btn-accent" href="#/admin/publish">Publish</a></div></div>' +
      '<div class="stats">' +
      '<div class="stat"><small>Products</small><b>' + (store.products || []).length + '</b></div>' +
      '<div class="stat"><small>Orders</small><b>' + orders.length + '</b></div>' +
      '<div class="stat"><small>Sales</small><b>' + money(rev) + '</b></div>' +
      '<div class="stat"><small>Awaiting action</small><b>' + newOrdersCount() + '</b></div></div>' +
      (samples ? '<div class="callout callout-blue">Your store has ' + samples + ' sample product' + (samples > 1 ? 's' : '') + '. Replace them with your own before you publish. <button class="btn-link" data-action="rm-samples">Delete samples</button></div>' : '') +
        '<div class="two-col"><div class="card"><h2>Launch checklist</h2>' +
      '<div class="progress"><i style="width:' + Math.round(done / cl.length * 100) + '%"></i></div><small class="help" style="margin-bottom:6px">' + done + ' of ' + cl.length + ' done</small>' +
      '<ul class="checklist">' + cl.map(function (c) {
        return '<li class="' + (c[1] ? 'done' : '') + '"><span class="tick">' + (c[1] ? '✓' : '') + '</span><span class="cl-text">' + esc(c[0]) + '</span>' +
          (!c[1] && c[2] ? '<a class="btn-link" href="' + c[2] + '"' + (c[2] === 'preview.html' ? ' target="_blank"' : '') + '>Start</a>' : '') + '</li>';
      }).join('') + '</ul></div>' +
      '<div class="card"><h2>Recent orders</h2>' + (orders.length ? orders.slice(0, 5).map(function (o) {
        return '<a href="#/admin/orders" style="display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);text-decoration:none;color:inherit">' +
          '<span><b style="font-size:14px">' + esc(o.customer.name) + '</b><br><small style="color:var(--text3)">' + fmtDate(o.createdAt) + (o.test ? ' · test' : '') + '</small></span>' +
          '<span style="text-align:right"><b style="font-size:14px">' + money(o.total) + '</b><br>' + statusPill(o.status) + '</span></a>';
      }).join('') : '<p style="color:var(--text2);font-size:14px">No orders yet. <a href="preview.html" target="_blank">Open your store</a> and place a test order to see how it works.</p>') +
      '</div></div>';
  }

  // ---------- products ----------
  var productFilter = '';

  function pageProducts() {
    var list = store.products || [];
    if (!list.length) {
      return '<div class="page-head"><div><h1>Products</h1></div></div><div class="card"><div class="empty"><span>📦</span><h3>Add your first product</h3>' +
        '<p>Add a photo, a name and a price. That\'s all it takes.</p><a class="btn btn-accent" href="#/admin/products/new">+ Add product</a></div></div>';
    }
    var q = productFilter.toLowerCase();
    var shown = list.filter(function (p) { return !q || (p.title + ' ' + (p.category || '')).toLowerCase().indexOf(q) >= 0; });
    return '<div class="page-head"><div><h1>Products</h1><p>' + list.length + ' product' + (list.length > 1 ? 's' : '') + '</p></div>' +
      '<div class="page-actions"><a class="btn btn-accent" href="#/admin/products/new">+ Add product</a></div></div>' +
      '<div class="card"><div class="toolbar"><input type="search" placeholder="Search products" data-input="product-filter" value="' + esc(productFilter) + '"></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Product</th><th>Price</th><th class="hide-sm">Stock</th><th>Status</th></tr></thead><tbody>' +
      shown.map(function (p) {
        var stock = p.stock == null || p.stock === '' ? '<span style="color:var(--text3)">Unlimited</span>' : Number(p.stock) === 0 ? '<span class="pill pill-red">Sold out</span>' : Number(p.stock) <= 5 ? '<span class="pill pill-amber">' + Number(p.stock) + ' left</span>' : Number(p.stock);
        return '<tr class="clickable" data-action="go" data-href="#/admin/products/edit/' + esc(p.id) + '"><td><div class="prod-cell">' + thumbHtml(p) +
          '<div><b>' + esc(p.title) + '</b><small>' + esc(p.category || '') + (p.sample ? ' · sample' : '') + '</small></div></div></td>' +
          '<td>' + money(p.price) + '</td><td class="hide-sm">' + stock + '</td>' +
          '<td>' + (p.active === false ? '<span class="pill pill-gray">Hidden</span>' : '<span class="pill pill-green">Live</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (!shown.length ? '<p class="empty">No products match “' + esc(productFilter) + '”.</p>' : '') + '</div>';
  }

  var draftImages = null;
  var draftFor = null;

  function pageProductForm(id) {
    // routes: #/admin/products/new  and  #/admin/products/edit/<id>
    var parts = location.hash.split('/');
    var editing = parts[3] === 'edit' ? parts[4] : null;
    var p = editing ? (store.products || []).filter(function (x) { return x.id === editing; })[0] : null;
    if (editing && !p) return '<div class="card"><div class="empty"><h3>Product not found</h3><a class="btn" href="#/admin/products">Back to products</a></div></div>';
    p = p || { title: '', description: '', price: '', compareAt: '', stock: '', category: '', images: [], active: true };
    var key = editing || 'new';
    if (draftFor !== key) { draftImages = (p.images || []).slice(); draftFor = key; }
    var cats = [];
    (store.products || []).forEach(function (x) { if (x.category && cats.indexOf(x.category) < 0) cats.push(x.category); });

    return '<div class="page-head"><div><a class="btn-link" href="#/admin/products">← Products</a><h1>' + (editing ? 'Edit product' : 'Add a product') + '</h1></div></div>' +
      '<form data-form="product" data-id="' + esc(editing || '') + '" novalidate><div class="two-col"><div>' +
      '<div class="card"><div class="field"><label for="pf-title">Name</label><input id="pf-title" name="title" required maxlength="120" value="' + esc(p.title) + '" placeholder="e.g. Chocolate truffle cake"></div>' +
      '<div class="field"><label for="pf-desc">Description</label><textarea id="pf-desc" name="description" rows="5" placeholder="Size, ingredients, material, how to use… anything a customer would ask.">' + esc(p.description || '') + '</textarea></div></div>' +
      '<div class="card"><h2>Photos</h2><p class="card-sub">Up to 4 photos. The first one is the cover. Square photos in daylight look best.</p><div class="img-grid" id="pf-imgs">' + imgTiles() + '</div></div>' +
      '<div class="card"><h2>Pricing</h2><div class="field-row">' +
      '<div class="field"><label for="pf-price">Price (' + esc(store.currency) + ')</label><input id="pf-price" name="price" type="number" min="0" step="0.01" inputmode="decimal" required value="' + esc(p.price) + '"></div>' +
      '<div class="field"><label for="pf-cmp">Original price <span class="help" style="display:inline">(optional)</span></label><input id="pf-cmp" name="compareAt" type="number" min="0" step="0.01" inputmode="decimal" value="' + esc(p.compareAt == null ? '' : p.compareAt) + '"><small>Shows a “Sale” badge when it\'s higher than the price.</small></div>' +
      '</div></div></div><div>' +
      '<div class="card"><h2>Status</h2><label class="check"><input type="checkbox" name="active"' + (p.active !== false ? ' checked' : '') + '><span>Show on my store<small>Untick to hide it without deleting.</small></span></label></div>' +
      '<div class="card"><h2>Organise</h2><div class="field"><label for="pf-cat">Category</label><input id="pf-cat" name="category" list="pf-cats" value="' + esc(p.category || '') + '" placeholder="e.g. Cakes"><datalist id="pf-cats">' +
      cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist></div>' +
      '<div class="field"><label for="pf-stock">Stock</label><input id="pf-stock" name="stock" type="number" min="0" step="1" inputmode="numeric" value="' + esc(p.stock == null ? '' : p.stock) + '" placeholder="Leave empty for unlimited"><small>We\'ll show “Sold out” when it reaches 0.</small></div></div>' +
      (editing ? '<div class="card"><button type="button" class="btn btn-ghost btn-block" data-action="dup-product" data-id="' + esc(editing) + '">Duplicate</button>' +
        '<button type="button" class="btn-link" style="color:var(--red);margin-top:10px;width:100%" data-action="del-product" data-id="' + esc(editing) + '">Delete product</button></div>' : '') +
      '</div></div><div class="sticky-bar"><a class="btn btn-ghost" href="#/admin/products">Cancel</a><button class="btn btn-accent" type="submit">' + (editing ? 'Save changes' : 'Add product') + '</button></div></form>';
  }

  function imgTiles() {
    return draftImages.map(function (src, i) {
      return '<div class="img-tile"><img src="' + esc(src) + '" alt="">' + (i === 0 ? '<span class="cover">COVER</span>' : '') +
        '<button type="button" data-action="rm-img" data-i="' + i + '" aria-label="Remove photo">✕</button></div>';
    }).join('') + (draftImages.length < 4 ? '<label class="img-add"><div><span>📷</span>Add photo</div><input type="file" accept="image/*" multiple data-upload="product"></label>' : '');
  }

  function saveProduct(form) {
    var fd = new FormData(form);
    var title = String(fd.get('title') || '').trim();
    var price = fd.get('price');
    if (!title) { toast('Please add a product name'); form.title.focus(); return; }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) { toast('Please add a valid price'); form.price.focus(); return; }
    var id = form.getAttribute('data-id');
    var cmp = fd.get('compareAt'), stock = fd.get('stock');
    var data = {
      title: title,
      description: String(fd.get('description') || '').trim(),
      price: Number(price),
      compareAt: cmp === '' ? null : Number(cmp),
      stock: stock === '' ? null : Math.max(0, Math.floor(Number(stock))),
      category: String(fd.get('category') || '').trim(),
      active: fd.get('active') === 'on',
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
  var orderFilter = 'all';

  function pageOrders() {
    var all = store.orders || [];
    var list = all.filter(function (o) { return orderFilter === 'all' || o.status === orderFilter; });
    var head = '<div class="page-head"><div><h1>Orders</h1><p>' + all.length + ' total · ' + money(orderRevenue(all)) + ' in sales</p></div></div>' +
      '<div class="callout callout-blue">Orders from your <b>published</b> website arrive in your WhatsApp' + (store.contact.email ? ' or email' : '') +
      '. Test orders you place in the <a href="preview.html" target="_blank">preview</a> appear here so you can practise managing them.</div>';
    if (!all.length) {
      return head + '<div class="card"><div class="empty"><span>🧾</span><h3>No orders yet</h3><p>Open your store, add something to the cart and check out to see a test order here.</p>' +
        '<a class="btn btn-accent" href="preview.html" target="_blank">Open my store</a></div></div>';
    }
    return head + '<div class="toolbar"><select data-input="order-filter"><option value="all">All orders</option>' + STATUSES.map(function (s) {
      return '<option value="' + s[0] + '"' + (orderFilter === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
    }).join('') + '</select></div>' +
      (list.length ? list.map(orderCard).join('') : '<div class="card"><p class="empty">No orders with this status.</p></div>');
  }

  function orderCard(o) {
    var phone = waDigits(o.customer.phone);
    if (phone.length === 10 && store.currency === 'INR') phone = '91' + phone;
    var msg = encodeURIComponent('Hi ' + o.customer.name + ', thank you for your order ' + o.id + ' from ' + store.name + ' (' + money(o.total) + ').');
    return '<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start">' +
      '<div><b style="font-size:17px">' + esc(o.customer.name) + '</b> ' + (o.test ? '<span class="pill pill-gray">Test</span>' : '') +
      '<div style="color:var(--text3);font-size:13px">' + esc(o.id) + ' · ' + fmtDate(o.createdAt) + '</div></div>' +
      '<select data-input="order-status" data-id="' + esc(o.id) + '" style="width:auto">' + STATUSES.map(function (s) {
        return '<option value="' + s[0] + '"' + (o.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>';
      }).join('') + '</select></div>' +
      '<div class="order-items">' + o.items.map(function (i) {
        return '<div><span>' + esc(i.title) + ' × ' + i.qty + '</span><span>' + money(i.price * i.qty) + '</span></div>';
      }).join('') +
      '<div style="color:var(--text2)"><span>Delivery</span><span>' + (o.shipping ? money(o.shipping) : 'Free') + '</span></div>' +
      '<div style="font-weight:700;border-top:1px solid var(--border);margin-top:4px;padding-top:8px"><span>Total</span><span>' + money(o.total) + '</span></div></div>' +
      '<div class="order-meta"><div><b>Phone</b>' + esc(o.customer.phone) + '</div><div><b>Payment</b>' + esc(({ upi: 'UPI', cod: 'Cash on delivery', confirm: 'To be confirmed' })[o.payment] || o.payment) + '</div>' +
      '<div><b>Address</b>' + esc(o.customer.address).replace(/\n/g, '<br>') + '</div>' + (o.customer.note ? '<div><b>Note</b>' + esc(o.customer.note) + '</div>' : '') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">' +
      (phone ? '<a class="btn btn-sm" style="background:#1DA851;color:#fff" target="_blank" rel="noopener" href="https://wa.me/' + phone + '?text=' + msg + '">Message on WhatsApp</a>' : '') +
      '<a class="btn btn-sm btn-ghost" href="tel:' + esc(o.customer.phone) + '">Call</a>' +
      '<button class="btn-link" style="color:var(--red);margin-left:auto" data-action="del-order" data-id="' + esc(o.id) + '">Delete</button></div></div>';
  }

  // ---------- design ----------
  var saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      store.flags.designed = true;
      save();
    }, 350);
    pushPreview();
  }

  function pushPreview() {
    var f = document.getElementById('preview-iframe');
    if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'sahaay-store', store: store }, location.origin);
  }

  var previewMobile = false;
  function setupPreview() {
    var f = document.getElementById('preview-iframe');
    if (f) f.addEventListener('load', pushPreview);
  }

  function pageDesign() {
    var t = store.theme, h = store.hero;
    var bindText = function (path, label, val, opts) {
      opts = opts || {};
      var tag = opts.rows
        ? '<textarea data-bind="' + path + '" rows="' + opts.rows + '" placeholder="' + esc(opts.ph || '') + '">' + esc(val || '') + '</textarea>'
        : '<input data-bind="' + path + '" value="' + esc(val || '') + '" placeholder="' + esc(opts.ph || '') + '" maxlength="' + (opts.max || 200) + '">';
      return '<div class="field"><label>' + label + '</label>' + tag + (opts.help ? '<small>' + opts.help + '</small>' : '') + '</div>';
    };
    var isImgLogo = store.logo && store.logo.indexOf('data:') === 0;

    return '<div class="page-head"><div><h1>Design</h1><p>Changes save automatically and show in the preview.</p></div></div>' +
      '<div class="design"><div class="design-panel">' +
      '<div class="card"><h2>Theme</h2><div class="field"><span class="field-label">Style</span><div class="opt-row">' +
      [['classic', 'Classic'], ['bold', 'Bold'], ['minimal', 'Minimal']].map(function (o) {
        return '<button type="button" class="opt' + (t.template === o[0] ? ' on' : '') + '" data-action="set-theme" data-k="template" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><span class="field-label">Brand colour</span><div class="swatches">' + COLORS.map(function (c) {
        return '<button type="button" class="swatch' + (t.primary === c ? ' on' : '') + '" style="background:' + c + '" data-action="set-theme" data-k="primary" data-v="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') + '<input type="color" data-bind="theme.primary" value="' + esc(t.primary) + '" aria-label="Custom colour"></div></div>' +
      '<div class="field"><span class="field-label">Font</span><div class="opt-row">' +
      [['modern', 'Modern', 'Inter'], ['elegant', 'Elegant', 'Playfair Display'], ['friendly', 'Friendly', 'Nunito']].map(function (o) {
        return '<button type="button" class="opt' + (t.font === o[0] ? ' on' : '') + '" style="font-family:\'' + o[2] + '\'" data-action="set-theme" data-k="font" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div></div></div>' +

      '<div class="card"><h2>Logo</h2><div class="emoji-row" style="margin-bottom:12px">' + LOGO_EMOJIS.map(function (e) {
        return '<button type="button" class="' + (store.logo === e ? 'on' : '') + '" data-action="set-logo" data-v="' + e + '">' + e + '</button>';
      }).join('') + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' + (isImgLogo ? logoHtml(store.logo, 'side-logo') : '') +
      '<label class="btn btn-ghost btn-sm">Upload logo image<input type="file" accept="image/*" data-upload="logo" hidden></label>' +
      (isImgLogo ? '<button class="btn-link" data-action="set-logo" data-v="' + esc(PRESETS[store.category] ? PRESETS[store.category].emoji : '🛍️') + '">Remove</button>' : '') + '</div></div>' +

      '<div class="card"><h2>Banner</h2>' +
      bindText('announcement', 'Announcement bar', store.announcement, { ph: 'e.g. Free delivery on orders above ₹999', help: 'A thin strip at the very top. Leave empty to hide it.' }) +
      bindText('hero.heading', 'Headline', h.heading, { max: 90 }) +
      bindText('hero.subheading', 'Sub-headline', h.subheading, { max: 160 }) +
      bindText('hero.cta', 'Button text', h.cta, { max: 30 }) +
      '<div class="field"><span class="field-label">Background photo <span class="help" style="display:inline">(optional)</span></span>' +
      (h.image ? '<div class="img-tile" style="width:100%;height:120px;margin-bottom:8px"><img src="' + esc(h.image) + '" alt=""><button type="button" data-action="rm-hero" aria-label="Remove">✕</button></div>' : '') +
      '<label class="btn btn-ghost btn-sm">' + (h.image ? 'Change photo' : 'Upload photo') + '<input type="file" accept="image/*" data-upload="hero" hidden></label></div></div>' +

      '<div class="card"><h2>Sections</h2>' +
      bindText('productsHeading', 'Products heading', store.productsHeading, { max: 60 }) +
      bindText('about', 'About your shop', store.about, { rows: 5, ph: 'Tell customers your story.' }) + '</div>' +
      '</div>' +
      '<div class="preview-frame' + (previewMobile ? ' mobile' : '') + '"><div class="preview-bar">Live preview<div class="seg"><button class="' + (!previewMobile ? 'on' : '') + '" data-action="pv-size" data-v="desktop">Desktop</button><button class="' + (previewMobile ? 'on' : '') + '" data-action="pv-size" data-v="mobile">Mobile</button></div></div>' +
      '<iframe id="preview-iframe" src="preview.html" title="Store preview"></iframe></div></div>';
  }

  function setPath(path, val) {
    var parts = path.split('.'), o = store;
    for (var i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] || {}; o = o[parts[i]]; }
    o[parts[parts.length - 1]] = val;
  }

  // ---------- settings ----------
  function pageSettings() {
    var c = store.contact, p = store.payments, sh = store.shipping;
    return '<div class="page-head"><div><h1>Settings</h1></div></div>' +
      '<form data-form="settings" novalidate>' +
      '<div class="card"><h2>Store details</h2>' +
      '<div class="field"><label for="st-name">Store name</label><input id="st-name" name="name" required maxlength="60" value="' + esc(store.name) + '"></div>' +
      '<div class="field"><label for="st-tag">Tagline</label><input id="st-tag" name="tagline" maxlength="120" value="' + esc(store.tagline) + '"><small>Used in search results and link previews.</small></div>' +
      '<div class="field"><label for="st-cur">Currency</label><select id="st-cur" name="currency">' + CURRENCIES.map(function (x) {
        return '<option' + (store.currency === x ? ' selected' : '') + '>' + x + '</option>';
      }).join('') + '</select></div></div>' +

      '<div class="card"><h2>Orders & contact</h2><p class="card-sub">Where customers send their orders and how they reach you.</p>' +
      '<div class="field"><label for="st-wa">WhatsApp number</label><input id="st-wa" name="whatsapp" type="tel" value="' + esc(c.whatsapp) + '" placeholder="e.g. 919876543210"><small>With country code. Orders are sent here.</small></div>' +
      '<div class="field-row"><div class="field"><label for="st-email">Email</label><input id="st-email" name="email" type="email" value="' + esc(c.email) + '"></div>' +
      '<div class="field"><label for="st-phone">Phone</label><input id="st-phone" name="phone" type="tel" value="' + esc(c.phone) + '"></div></div>' +
      '<div class="field"><label for="st-ig">Instagram handle</label><div class="input-prefix"><span>@</span><input id="st-ig" name="instagram" value="' + esc(String(c.instagram || '').replace(/^@/, '')) + '"></div></div>' +
      '<div class="field"><label for="st-addr">Address <span class="help" style="display:inline">(shown in the footer)</span></label><textarea id="st-addr" name="address" rows="2">' + esc(c.address) + '</textarea></div></div>' +

      '<div class="card"><h2>Payments</h2>' +
      '<div class="field"><label for="st-upi">UPI ID</label><input id="st-upi" name="upi" value="' + esc(p.upi) + '" placeholder="e.g. yourname@okaxis" autocapitalize="off"><small>Customers can pay you directly with any UPI app. Leave empty to turn off.</small></div>' +
      '<label class="check"><input type="checkbox" name="cod"' + (p.cod ? ' checked' : '') + '><span>Accept cash on delivery</span></label></div>' +

      '<div class="card"><h2>Delivery charges</h2><div class="field-row">' +
      '<div class="field"><label for="st-flat">Delivery fee (' + esc(store.currency) + ')</label><input id="st-flat" name="flat" type="number" min="0" step="0.01" value="' + esc(sh.flat || 0) + '"><small>0 for free delivery.</small></div>' +
      '<div class="field"><label for="st-free">Free delivery above</label><input id="st-free" name="freeAbove" type="number" min="0" step="0.01" value="' + esc(sh.freeAbove || '') + '" placeholder="Optional"></div></div></div>' +

      '<div class="sticky-bar"><button class="btn btn-accent" type="submit">Save settings</button></div></form>' +

      '<div class="card" style="border-color:var(--red)"><h2>Danger zone</h2><p class="card-sub">Delete this store and everything in it from this browser. Download a backup from Publish first if you might want it back.</p>' +
      '<button class="btn btn-danger btn-sm" data-action="delete-store">Delete store</button></div>';
  }

  function saveSettings(form) {
    var fd = new FormData(form);
    var name = String(fd.get('name') || '').trim();
    if (!name) { toast('Store name can\'t be empty'); return; }
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
    var warn = [];
    if (!store.contact.whatsapp && !store.contact.email) warn.push('Add a WhatsApp number or email in <a href="#/admin/settings">Settings</a>, otherwise customers can\'t send you orders.');
    if (!(store.products || []).some(function (p) { return p.active !== false; })) warn.push('Your store has no visible products yet.');
    if ((store.products || []).some(function (p) { return p.sample; })) warn.push('Your store still has sample products. <button class="btn-link" data-action="rm-samples">Delete them</button>');

    return '<div class="page-head"><div><h1>Publish</h1><p>Put your store on the internet, free.</p></div></div>' +
      warn.map(function (w) { return '<div class="callout">⚠️ ' + w + '</div>'; }).join('') +
      '<div class="two-col"><div><div class="card"><h2>1. Download your website</h2>' +
      '<p class="card-sub" style="margin-top:0">Your whole store (design, products and photos) in one file called <b>index.html</b>.</p>' +
      '<button class="btn btn-accent btn-lg" data-action="download-site">⬇ Download website</button>' +
      (store.flags.publishedAt ? '<small class="help">Last downloaded ' + fmtDate(store.flags.publishedAt) + '</small>' : '') + '</div>' +

      '<div class="card"><h2>2. Put it online (free)</h2><p class="card-sub">The easiest way: Netlify Drop. No coding, takes about a minute.</p><ol class="publish-steps">' +
      '<li>Make a new folder on your computer, for example <b>my-store</b>, and move <b>index.html</b> into it.</li>' +
      '<li>Open <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">app.netlify.com/drop</a> and drag the folder onto the page.</li>' +
      '<li>You\'ll get a link like <b>my-store-123.netlify.app</b>. Create a free account to keep it and choose a nicer name.</li>' +
      '<li>Share the link on WhatsApp, Instagram and Google Business, and print it as a QR code for your counter.</li></ol>' +
      '<details><summary style="cursor:pointer;font-weight:600;font-size:14px">Other options: GitHub Pages or your own domain</summary><div style="font-size:14px;color:var(--text2);margin-top:10px">' +
      '<p style="margin-bottom:8px"><b>GitHub Pages:</b> create a public repository, upload index.html, then go to Settings → Pages and pick your main branch. Your store appears at <i>username.github.io/repo</i>.</p>' +
      '<p><b>Your own domain:</b> buy a domain (e.g. from GoDaddy, Hostinger or Namecheap) and connect it in Netlify under Domain settings. Any web host that serves plain HTML files works too.</p></div></details></div>' +

      '<div class="card"><h2>Updating your store</h2><p style="font-size:14px;color:var(--text2)">Your published site is a snapshot. After you change products, prices or stock, download again and drag the new folder onto the same Netlify site under <b>Deploys</b>.</p></div></div>' +

      '<div><div class="card"><h2>How orders work</h2><ul style="padding-left:18px;font-size:14px;color:var(--text2);display:grid;gap:8px">' +
      '<li>Customers add products to their cart and check out with their name, phone and address.</li>' +
      '<li>' + (store.contact.whatsapp ? 'They tap <b>Send order on WhatsApp</b> and the order arrives in your chat.' : 'Add a WhatsApp number so orders arrive in your chat.') + '</li>' +
      '<li>' + (store.payments.upi ? 'They can pay the exact total to <b>' + esc(store.payments.upi) + '</b> from any UPI app.' : 'Add a UPI ID in Settings to take online payments.') + '</li>' +
      '<li>You confirm the order, pack it and deliver. No commission, no fees from us.</li></ul></div>' +
      '<div class="card"><h2>Backup</h2><p class="card-sub">Your store is saved in this browser only. Keep a backup, or use it to move your store to another device.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" data-action="backup">Download backup</button>' +
      '<label class="btn btn-ghost btn-sm">Restore backup<input type="file" accept="application/json,.json" data-upload="restore" hidden></label></div></div></div></div>';
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  var FONT_LINKS = {
    modern: 'family=Inter:wght@400;500;600;700',
    elegant: 'family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700',
    friendly: 'family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700;800'
  };

  function buildSite() {
    return Promise.all([
      fetch('storefront.css').then(function (r) { if (!r.ok) throw new Error(); return r.text(); }),
      fetch('storefront.js').then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
    ]).then(function (res) {
      var pub = JSON.parse(JSON.stringify(store));
      delete pub.orders;   // customer data never goes into the public site
      delete pub.flags;
      // Escape so the JSON can't close the <script> tag or break on line separators.
      var data = JSON.stringify(pub).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
      var title = store.name + (store.tagline ? ' — ' + store.tagline : '');
      var desc = store.tagline || (store.about || '').slice(0, 160) || ('Shop online at ' + store.name);
      var icon = store.logo && store.logo.indexOf('data:') === 0
        ? store.logo
        : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + (store.logo || '🛍️') + '</text></svg>');
      return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n' +
        '<title>' + esc(title) + '</title>\n' +
        '<meta name="description" content="' + esc(desc) + '">\n' +
        '<meta name="theme-color" content="' + esc(store.theme.primary) + '">\n' +
        '<meta property="og:title" content="' + esc(store.name) + '">\n' +
        '<meta property="og:description" content="' + esc(desc) + '">\n' +
        '<meta property="og:type" content="website">\n' +
        '<link rel="icon" href="' + esc(icon) + '">\n' +
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
        '<link href="https://fonts.googleapis.com/css2?' + (FONT_LINKS[store.theme.font] || FONT_LINKS.modern) + '&display=swap" rel="stylesheet">\n' +
        '<style>\nhtml,body{margin:0;background:#fff;}\n' + res[0] + '\n</style>\n</head>\n<body>\n' +
        '<div id="sf-root"><noscript>' + esc(store.name) + ' needs JavaScript turned on to show products.</noscript></div>\n' +
        '<!-- Built with Sahaay Stores -->\n<script>\n' + res[1] + '\n</script>\n' +
        '<script>\nvar STORE = ' + data + ';\nSahaayStorefront.mount(document.getElementById("sf-root"), STORE, { mode: "live" });\n</script>\n</body>\n</html>\n';
    });
  }

  // ============================================================
  // Events
  // ============================================================
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
        if (save()) { draftFor = null; toast('Duplicated'); location.hash = '#/admin/products/edit/' + copy.id; }
        break;
      }
      case 'del-order':
        if (!confirm('Delete this order?')) return;
        store.orders = store.orders.filter(function (o) { return o.id !== id; });
        save(); render(); break;
      case 'set-theme':
        store.theme[t.getAttribute('data-k')] = t.getAttribute('data-v');
        scheduleSave();
        t.parentNode.querySelectorAll('.on').forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        if (t.getAttribute('data-k') === 'primary') { var ci = t.parentNode.querySelector('input[type=color]'); if (ci) ci.value = t.getAttribute('data-v'); }
        break;
      case 'set-logo': store.logo = t.getAttribute('data-v'); store.flags.designed = true; save(); render(); break;
      case 'rm-hero': store.hero.image = ''; save(); render(); break;
      case 'pv-size': previewMobile = t.getAttribute('data-v') === 'mobile'; {
        var pf = document.querySelector('.preview-frame');
        pf.classList.toggle('mobile', previewMobile);
        t.parentNode.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === t); });
      } break;
      case 'delete-store':
        if (!confirm('Delete "' + store.name + '" and all its products and orders from this browser?')) return;
        if (prompt('Type DELETE to confirm') !== 'DELETE') return;
        localStorage.removeItem(KEY);
        store = null;
        location.hash = '#/';
        break;
      case 'download-site':
        t.disabled = true;
        buildSite().then(function (html) {
          download('index.html', html, 'text/html');
          store.flags.published = true;
          store.flags.publishedAt = new Date().toISOString();
          save();
          toast('Downloaded index.html');
          render();
        }).catch(function () {
          t.disabled = false;
          toast('Couldn\'t build the site. Open the builder from a web address, not a file on your computer.');
        });
        break;
      case 'backup':
        download((store.name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-backup.json', JSON.stringify(store, null, 2), 'application/json');
        break;
    }
  });

  app.addEventListener('input', function (e) {
    var t = e.target;
    var wzKey = t.getAttribute('data-wz');
    if (wzKey) {
      wz.d[wzKey] = t.type === 'checkbox' ? t.checked : t.value;
      if (wzKey === 'name') {
        var btn = app.querySelector('[data-action="wz-next"]');
        if (btn) btn.disabled = !(wz.d.name.trim() && wz.d.category);
      }
      if (wzKey === 'primary') app.querySelectorAll('.swatch.on').forEach(function (x) { x.classList.remove('on'); });
      return;
    }
    var bind = t.getAttribute('data-bind');
    if (bind) {
      setPath(bind, t.value);
      if (bind === 'theme.primary') app.querySelectorAll('.swatch.on').forEach(function (x) { x.classList.remove('on'); });
      scheduleSave();
      return;
    }
    var inp = t.getAttribute('data-input');
    if (inp === 'product-filter') {
      productFilter = t.value;
      var pos = t.selectionStart;
      render();
      var ni = app.querySelector('[data-input="product-filter"]');
      if (ni) { ni.focus(); ni.setSelectionRange(pos, pos); }
    }
  });

  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-wz') && (t.type === 'checkbox' || t.tagName === 'SELECT')) {
      wz.d[t.getAttribute('data-wz')] = t.type === 'checkbox' ? t.checked : t.value;
      return;
    }
    var inp = t.getAttribute('data-input');
    if (inp === 'order-filter') { orderFilter = t.value; render(); return; }
    if (inp === 'order-status') {
      var o = store.orders.filter(function (x) { return x.id === t.getAttribute('data-id'); })[0];
      if (o) { o.status = t.value; save(); toast('Order marked ' + t.options[t.selectedIndex].text.toLowerCase()); render(); }
      return;
    }

    var up = t.getAttribute('data-upload');
    if (!up || !t.files || !t.files.length) return;
    var files = Array.prototype.slice.call(t.files);

    if (up === 'product') {
      files = files.slice(0, 4 - draftImages.length);
      Promise.all(files.map(function (f) { return compressImage(f, 1000, 0.8).catch(function () { return null; }); })).then(function (urls) {
        urls.forEach(function (u) { if (u) draftImages.push(u); });
        if (urls.some(function (u) { return !u; })) toast('Some files weren\'t images and were skipped');
        var box = document.getElementById('pf-imgs');
        if (box) box.innerHTML = imgTiles();
      });
    } else if (up === 'logo') {
      compressImage(files[0], 256, 0.9).then(function (u) {
        store.logo = u; store.flags.designed = true; save(); render();
      }).catch(function () { toast('Please choose an image file'); });
    } else if (up === 'hero') {
      compressImage(files[0], 1600, 0.78).then(function (u) {
        store.hero.image = u; store.flags.designed = true;
        if (save()) render(); else store.hero.image = '';
      }).catch(function () { toast('Please choose an image file'); });
    } else if (up === 'restore') {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || !data.name || !Array.isArray(data.products)) throw new Error('bad');
          if (!confirm('Replace your current store with "' + data.name + '" from this backup?')) return;
          data.flags = data.flags || {};
          data.orders = data.orders || [];
          store = data;
          if (save()) { toast('Backup restored'); render(); }
        } catch (err) { toast('That file isn\'t a Sahaay Stores backup'); }
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

  // Test orders placed in the embedded/other-tab preview.
  window.addEventListener('storage', function (e) {
    if (e.key !== KEY) return;
    store = load();
    var r = route();
    // Don't blow away a half-filled form.
    if (r.name === 'admin' && r.sub !== 'products' && r.sub !== 'settings' && r.sub !== 'design') render();
  });
  window.addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data && e.data.type === 'sahaay-order') {
      store = load();
      toast('Test order received. See it in Orders.');
    }
  });

  render();
})();
