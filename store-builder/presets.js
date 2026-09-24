/* Sahaay Stores — business-type presets, the store factory, and demo stores.
 * Shared by the builder (app.js) and the preview page (preview.html). */
(function (global) {
  'use strict';

  // [title, price, compareAt, category, description, emoji]
  var PRESETS = {
    food: {
      label: 'Food & bakery', emoji: '🧁', color: '#8A5A44', font: 'elegant', template: 'classic', layout: 'split',
      eyebrow: 'Baked fresh daily', hero: 'Freshly baked, delivered to your door', productsHeading: 'Today\'s menu',
      about: 'We bake everything in small batches with simple, honest ingredients — no preservatives, no shortcuts. Order a day ahead for custom celebration cakes.',
      samples: [
        ['Chocolate truffle cake, 1 kg', 850, 950, 'Cakes', 'Moist chocolate sponge layered with Belgian dark chocolate ganache. Eggless option available.', '🎂'],
        ['Brown butter cookies, 250 g', 240, null, 'Cookies', 'Crisp edges, chewy centres, flaky sea salt. Baked fresh every morning.', '🍪'],
        ['Signature cupcake box, 6 pcs', 420, null, 'Cupcakes', 'Red velvet, Madagascar vanilla and double chocolate — two of each.', '🧁'],
        ['Sourdough loaf', 180, null, 'Bread', 'Naturally leavened over 36 hours for a crackling crust and open crumb.', '🍞'],
        ['Butter croissants, 4 pcs', 320, null, 'Pastry', 'Laminated by hand with French butter. Best warmed for two minutes.', '🥐'],
        ['Classic cheesecake slice', 190, 220, 'Cakes', 'Baked New York–style cheesecake on a buttery biscuit base.', '🍰']
      ]
    },
    fashion: {
      label: 'Clothing & fashion', emoji: '👗', color: '#1F1D1B', font: 'luxe', template: 'minimal', layout: 'split',
      eyebrow: 'New season', hero: 'Considered clothing, made to last', productsHeading: 'New arrivals',
      about: 'Comfortable, well-made pieces designed for everyday life, in natural fabrics and small production runs. Free exchanges within 7 days.',
      samples: [
        ['Block-print cotton kurta', 1290, 1590, 'Women', 'Hand block-printed cotton with a relaxed fit. Available in XS–XXL.', '👗'],
        ['Linen shirt, sky blue', 1490, null, 'Men', 'Pure linen that softens with every wash. Relaxed fit, mother-of-pearl buttons.', '👔'],
        ['Silk-blend stole', 690, null, 'Accessories', 'Lightweight stole with a soft sheen and hand-knotted tassels.', '🧣'],
        ['Wide-leg trousers', 1690, null, 'Women', 'High-rise, fluid drape and deep pockets. Pairs with everything.', '👖'],
        ['Canvas tote', 590, null, 'Accessories', 'Heavy 16 oz canvas with a leather-trim handle. Fits a laptop.', '👜'],
        ['Everyday sneakers', 2490, 2990, 'Footwear', 'Cushioned, breathable and made to walk all day.', '👟']
      ]
    },
    crafts: {
      label: 'Handmade & crafts', emoji: '🧶', color: '#B4553B', font: 'friendly', template: 'classic', layout: 'split',
      eyebrow: 'Made by hand', hero: 'Handmade with love, one piece at a time', productsHeading: 'Shop handmade',
      about: 'Every piece is made by hand in our home studio, so no two are exactly alike. We use natural fibres and non-toxic finishes.',
      samples: [
        ['Crochet flower bouquet', 650, null, 'Decor', 'A bouquet of crochet blooms that never wilt. Makes a lovely gift.', '💐'],
        ['Hand-painted coasters, set of 4', 480, 560, 'Home', 'Mango-wood coasters, painted by hand and sealed to be water-resistant.', '🎨'],
        ['Macramé wall hanging', 1150, null, 'Decor', 'Cotton-cord macramé on a driftwood rod, about 60 cm long.', '🪢'],
        ['Chunky knit throw', 2450, null, 'Home', 'Hand-knit in soft merino blend. 100 × 130 cm.', '🧶'],
        ['Terracotta planter', 540, null, 'Garden', 'Hand-thrown terracotta with a drainage hole. 12 cm.', '🪴'],
        ['Scented soy candle', 399, null, 'Home', 'Hand-poured soy wax with sandalwood and vetiver. 40-hour burn.', '🕯️']
      ]
    },
    beauty: {
      label: 'Beauty & wellness', emoji: '🌸', color: '#C27C88', font: 'luxe', template: 'classic', layout: 'split',
      eyebrow: 'Clean skincare', hero: 'Gentle, clean care for every day', productsHeading: 'Bestsellers',
      about: 'Small-batch skincare made with plant-based ingredients. No harsh chemicals, never tested on animals, always kind to skin.',
      samples: [
        ['Rose & aloe face gel, 100 ml', 399, null, 'Skincare', 'A lightweight, cooling gel for all skin types. Soothes and hydrates.', '🌹'],
        ['Cold-pressed hair oil, 200 ml', 449, 499, 'Haircare', 'Coconut, bhringraj and amla for stronger, shinier hair.', '🫙'],
        ['Handmade soap trio', 330, null, 'Bath', 'Activated charcoal, turmeric and lavender. 100 g each.', '🧼'],
        ['Vitamin C serum, 30 ml', 649, null, 'Skincare', 'Brightening serum with stabilised vitamin C and niacinamide.', '💧'],
        ['Lip balm duo', 249, null, 'Lips', 'Shea butter and beeswax in rose and vanilla.', '💄'],
        ['Bath salts, 300 g', 349, null, 'Bath', 'Himalayan pink salt with eucalyptus essential oil.', '🛁']
      ]
    },
    home: {
      label: 'Home & decor', emoji: '🪴', color: '#1F1D1B', font: 'luxe', template: 'minimal', layout: 'split',
      eyebrow: 'The home edit', hero: 'Objects for a calmer, more beautiful home', productsHeading: 'Shop the collection',
      about: 'Thoughtfully sourced decor and everyday objects, made by independent makers across India.',
      samples: [
        ['Speckled ceramic planter', 690, null, 'Planters', 'Hand-glazed stoneware planter with a drainage hole. 15 cm.', '🪴'],
        ['Woven cotton throw, mustard', 1250, 1500, 'Textiles', 'Soft handloom throw with a fringed edge. 125 × 150 cm.', '🧺'],
        ['Solid brass tealight holder', 540, null, 'Lighting', 'Heavy, hand-finished brass that glows warmly at night.', '🕯️'],
        ['Stoneware vase', 890, null, 'Vases', 'Matte reactive glaze; every piece is slightly different. 22 cm.', '🏺'],
        ['Linen cushion cover', 720, null, 'Textiles', 'Stonewashed linen with a hidden zip. 45 × 45 cm.', '🛋️'],
        ['Hanging pendant lamp', 3450, 3900, 'Lighting', 'Hand-woven rattan shade with a braided fabric cord.', '💡']
      ]
    },
    electronics: {
      label: 'Electronics', emoji: '🎧', color: '#2E4F7A', font: 'geometric', template: 'bold', layout: 'split',
      eyebrow: 'Genuine · Warranty', hero: 'Gadgets that just work', productsHeading: 'Top picks',
      about: 'Genuine products with a bill and full warranty. Same-day delivery across the city, and real support when you need it.',
      samples: [
        ['Wireless earbuds', 1499, 1999, 'Audio', 'Up to 24 hours with the case, clear calls and a snug fit.', '🎧'],
        ['20W USB-C fast charger', 699, 999, 'Chargers', 'Compact fast charger compatible with most phones.', '🔌'],
        ['Braided USB-C cable, 1.5 m', 299, null, 'Cables', 'Nylon-braided and tested for 10,000+ bends.', '🔋'],
        ['Smartwatch', 2999, 3999, 'Wearables', 'Heart rate, SpO2, sleep tracking and 7-day battery.', '⌚'],
        ['Bluetooth speaker', 1799, null, 'Audio', 'Room-filling sound, IPX7 waterproof, 12-hour playtime.', '🔊'],
        ['Wireless mouse', 599, null, 'Accessories', 'Silent clicks, ergonomic shape, 12-month battery.', '🖱️']
      ]
    },
    grocery: {
      label: 'Grocery & daily needs', emoji: '🛒', color: '#2F6B4F', font: 'geometric', template: 'classic', layout: 'split',
      eyebrow: 'Delivered today', hero: 'Everyday essentials, delivered fast', productsHeading: 'Shop essentials',
      about: 'Your neighbourhood store, now online. Order before 6 pm for same-day delivery.',
      samples: [
        ['Aged basmati rice, 5 kg', 649, 720, 'Staples', 'Long-grain basmati, aged for 12 months.', '🍚'],
        ['Wood-pressed groundnut oil, 1 L', 289, null, 'Oils', 'Unrefined, cold wood-pressed groundnut oil.', '🫗'],
        ['Alphonso mangoes, 1 dozen', 899, null, 'Fruits', 'Hand-picked Ratnagiri Alphonso, naturally ripened.', '🥭'],
        ['Farm eggs, 12 pcs', 110, null, 'Dairy & eggs', 'Free-range eggs from local farms.', '🥚'],
        ['Masala chai blend, 250 g', 220, null, 'Beverages', 'Assam CTC with cardamom, ginger and clove.', '☕'],
        ['Seasonal vegetables box', 349, null, 'Vegetables', 'About 3 kg of fresh, seasonal vegetables.', '🥕']
      ]
    },
    other: {
      label: 'Something else', emoji: '🛍️', color: '#6B4FA0', font: 'modern', template: 'classic', layout: 'split',
      eyebrow: 'Welcome', hero: 'Quality products, friendly service', productsHeading: 'Our products',
      about: 'Tell your customers who you are, what you make and why they will love it.',
      samples: [
        ['Sample product one', 499, null, 'Featured', 'Describe what makes this product special.', '⭐'],
        ['Sample product two', 799, 999, 'Featured', 'Add details like size, material and how to use it.', '🎁'],
        ['Sample product three', 299, null, 'New', 'Great descriptions help customers decide.', '📦'],
        ['Sample product four', 1299, null, 'New', 'Mention what\'s included and delivery times.', '✨']
      ]
    }
  };

  function uid(prefix) { return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* Build a complete store object from a business type plus the owner's choices. */
  function buildStore(o) {
    var p = PRESETS[o.category] || PRESETS.other;
    var name = (o.name || '').trim() || 'My Store';
    return {
      id: o.id || uid('s'),
      createdAt: new Date().toISOString(),
      name: name,
      tagline: (o.tagline || '').trim(),
      category: o.category || 'other',
      logo: o.logo || p.emoji,
      currency: o.currency || 'INR',
      theme: {
        template: o.template || p.template,
        primary: o.primary || p.color,
        font: o.font || p.font,
        mobile: { bottomNav: true, stickyBuy: true, columns: 2 }
      },
      hero: { layout: o.layout || p.layout, eyebrow: p.eyebrow, heading: p.hero, subheading: (o.tagline || '').trim(), cta: 'Shop now', image: '' },
      productsHeading: p.productsHeading,
      announcement: o.announcement || '',
      about: p.about,
      contact: { whatsapp: String(o.whatsapp || '').replace(/\D/g, ''), phone: '', email: (o.email || '').trim(), instagram: '', address: '' },
      payments: { upi: (o.upi || '').trim(), cod: o.cod !== false },
      shipping: { flat: o.flat || 0, freeAbove: o.freeAbove || 0 },
      app: { enabled: o.app !== false, name: name, shortName: name.slice(0, 12), bg: o.primary || p.color, icon: '', banner: true },
      products: o.samples === false ? [] : p.samples.map(function (x, i) {
        return { id: 'p' + i + uid(), title: x[0], price: x[1], compareAt: x[2], category: x[3], description: x[4], emoji: x[5], stock: i === 2 ? 4 : null, images: [], active: true, sample: true };
      }),
      orders: [],
      flags: {}
    };
  }

  var DEMOS = {
    decor: function () { return buildStore({ id: 'demo-decor', name: 'Ember & Oak', category: 'home', tagline: 'Handcrafted homeware from independent Indian makers', announcement: 'Free shipping on orders over ₹2,000', freeAbove: 2000, whatsapp: '910000000000', upi: 'emberandoak@upi' }); },
    bakery: function () { return buildStore({ id: 'demo-bakery', name: 'Crumb & Co.', category: 'food', tagline: 'Small-batch bakes, delivered warm across Pune', flat: 40, freeAbove: 499, whatsapp: '910000000000', upi: 'crumbco@upi' }); },
    tech: function () { return buildStore({ id: 'demo-tech', name: 'Voltline', category: 'electronics', tagline: 'Genuine gadgets with same-day delivery', announcement: 'Same-day delivery in Bengaluru', whatsapp: '910000000000', upi: 'voltline@upi' }); },
    beauty: function () { return buildStore({ id: 'demo-beauty', name: 'Petal Apothecary', category: 'beauty', tagline: 'Clean, plant-powered skincare', whatsapp: '910000000000', upi: 'petal@upi', freeAbove: 799 }); }
  };

  global.SahaayPresets = { PRESETS: PRESETS, buildStore: buildStore, DEMOS: DEMOS, uid: uid };
})(typeof window !== 'undefined' ? window : this);
