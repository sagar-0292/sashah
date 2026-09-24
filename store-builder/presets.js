/* Sahaay Stores — business-type presets, the store factory, and demo stores.
 * Shared by the builder (app.js) and the preview page (preview.html). */
(function (global) {
  'use strict';

  // [title, price, compareAt, category, description, emoji]
  var PRESETS = {
    food: {
      label: 'Food & bakery', icon: 'food', emoji: '🧁', color: '#8A5A44', style: 'classic', layout: 'split',
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
      label: 'Clothing & fashion', icon: 'shirt', emoji: '👗', color: '#161513', style: 'editorial', layout: 'split',
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
      label: 'Handmade & crafts', icon: 'hand', emoji: '🧶', color: '#B4553B', style: 'soft', layout: 'split',
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
      label: 'Beauty & wellness', icon: 'sparkle', emoji: '🌸', color: '#B86A78', style: 'soft', layout: 'split',
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
      label: 'Home & decor', icon: 'lamp', emoji: '🪴', color: '#161513', style: 'editorial', layout: 'split',
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
      label: 'Electronics', icon: 'bolt', emoji: '🎧', color: '#2E4F7A', style: 'bold', layout: 'split',
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
      label: 'Grocery & daily needs', icon: 'basket', emoji: '🛒', color: '#2F6B4F', style: 'modern', layout: 'split',
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
      label: 'Something else', icon: 'store', emoji: '🛍️', color: '#111318', style: 'modern', layout: 'split',
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

  function firstSentence(text, max) {
    var t = String(text || '').trim().replace(/\s+/g, ' ');
    if (!t) return '';
    var m = t.match(/^(.+?[.!?])(\s|$)/);
    t = m ? m[1] : t;
    max = max || 110;
    return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t;
  }

  /* Build a complete store object from a business type plus the owner's
   * answers. `o.copy` (optional) is AI-written homepage text from
   * /api/generate; without it we fall back to the preset's copy and the
   * owner's own words. The result uses the section model in sections.js. */
  function buildStore(o) {
    var SS = global.SahaaySections;
    var p = PRESETS[o.category] || PRESETS.other;
    var c = o.copy || {};
    var name = (o.name || '').trim() || 'My Store';
    var description = (o.description || '').trim();
    var tagline = (c.tagline || o.tagline || firstSentence(description, 90) || '').trim();
    var styleKey = o.style || { classic: 'classic', minimal: 'editorial', bold: 'bold' }[o.template] || p.style;
    var theme = SS.applyStyle({}, styleKey);
    theme.primary = o.primary || p.color;
    if (o.headingFont && SS.FONTS[o.headingFont]) theme.fonts.heading = o.headingFont;
    theme.card = { ratio: '4/5', align: styleKey === 'editorial' || styleKey === 'midnight' ? 'center' : 'left', quickAdd: true, showCategory: true };
    theme.mobile = { bottomNav: true, stickyBuy: true, columns: 2 };
    theme.customCss = '';
    theme.buttonCase = theme.headingCase === 'uppercase' ? 'uppercase' : 'none';

    var logoImg = o.logoImage || (/^(data:|https?:|\/)/.test(String(o.logo || '')) ? o.logo : '');
    var ownerBio = (c.ownerBio || o.ownerBio || '').trim();
    var home = [
      SS.newSection('hero', { layout: o.layout || p.layout, eyebrow: c.eyebrow || p.eyebrow, heading: c.heroHeading || p.hero, text: c.heroSubheading || tagline, button1Label: 'Shop now', button1Link: 'products', scheme: 'alt' }),
      SS.newSection('features'),
      SS.newSection('products', { eyebrow: '', heading: c.productsHeading || p.productsHeading })
    ];
    var story = SS.newSection('richText', { eyebrow: 'Our story', heading: '', text: c.about || description || p.about });
    home.push(story);
    if (ownerBio || o.ownerName) home.push(SS.newSection('owner', { name: (o.ownerName || '').trim(), bio: ownerBio, photo: o.ownerPhoto || '' }));
    if (String(o.whatsapp || '').replace(/\D/g, '')) home.push(SS.newSection('cta'));

    return {
      schema: 3,
      id: o.id || uid('s'),
      createdAt: new Date().toISOString(),
      name: name,
      tagline: tagline,
      description: description,
      category: o.category || 'other',
      logo: logoImg,
      brand: { type: logoImg ? 'image' : 'wordmark', text: name, mark: o.mark || 'none', size: 'md' },
      currency: o.currency || 'INR',
      theme: theme,
      header: { layout: styleKey === 'editorial' || styleKey === 'midnight' ? 'center' : 'left', sticky: true, showSearch: true, autoCategories: true,
        menu: [{ label: 'Shop all', link: 'products' }, { label: 'Our story', link: 'section:' + story.id }] },
      footer: { text: tagline, showPowered: true, social: { instagram: '', facebook: '', youtube: '' } },
      announcement: o.announcement || '',
      pages: [{ id: 'home', title: 'Home', slug: '', sections: home }],
      owner: { name: (o.ownerName || '').trim(), bio: ownerBio, photo: '' },   // legacy mirror; the owner section holds the photo
      contact: { whatsapp: String(o.whatsapp || '').replace(/\D/g, ''), phone: '', email: (o.email || '').trim(), instagram: '', address: '' },
      payments: { upi: (o.upi || '').trim(), cod: o.cod !== false },
      shipping: { flat: o.flat || 0, freeAbove: o.freeAbove || 0 },
      app: { enabled: o.app !== false, name: name, shortName: name.slice(0, 12), bg: theme.primary, icon: '', banner: true },
      products: o.samples === false ? [] : p.samples.map(function (x, i) {
        return { id: 'p' + i + uid(), title: x[0], price: x[1], compareAt: x[2], category: x[3], description: x[4], stock: i === 2 ? 4 : null, images: [], active: true, sample: true };
      }),
      orders: [],
      flags: {}
    };
  }

  var DEMOS = {
    decor: function () { return buildStore({ id: 'demo-decor', name: 'Ember & Oak', category: 'home', ownerName: 'Meera Iyer', ownerBio: 'I spent ten years sourcing for design studios before starting Ember & Oak from my living room. Every piece here comes from a maker I have met in person.', tagline: 'Handcrafted homeware from independent Indian makers', announcement: 'Free shipping on orders over ₹2,000', freeAbove: 2000, whatsapp: '910000000000', upi: 'emberandoak@upi' }); },
    bakery: function () { return buildStore({ id: 'demo-bakery', name: 'Crumb & Co.', category: 'food', mark: 'circle', ownerName: 'Rohan Deshpande', ownerBio: 'I started baking for friends during college and never stopped. Everything is made in small batches in my home kitchen in Pune.', tagline: 'Small-batch bakes, delivered warm across Pune', flat: 40, freeAbove: 499, whatsapp: '910000000000', upi: 'crumbco@upi' }); },
    tech: function () { return buildStore({ id: 'demo-tech', name: 'Voltline', category: 'electronics', mark: 'square', tagline: 'Genuine gadgets with same-day delivery', announcement: 'Same-day delivery in Bengaluru', whatsapp: '910000000000', upi: 'voltline@upi' }); },
    beauty: function () { return buildStore({ id: 'demo-beauty', name: 'Petal Apothecary', category: 'beauty', tagline: 'Clean, plant-powered skincare', whatsapp: '910000000000', upi: 'petal@upi', freeAbove: 799 }); }
  };

  global.SahaayPresets = { PRESETS: PRESETS, buildStore: buildStore, DEMOS: DEMOS, uid: uid, firstSentence: firstSentence };
})(typeof window !== 'undefined' ? window : this);
