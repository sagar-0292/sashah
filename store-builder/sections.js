/* Sahaay Stores — the section & style system.
 * Shared by the storefront (rendering), the builder (editing) and presets
 * (new stores). Everything a store looks like is data described here:
 *   • FONTS          — typefaces owners can choose
 *   • STYLES         — designer style presets (colours, type, shape)
 *   • TYPES          — page sections with their editable fields & defaults
 *   • upgrade(store) — brings older saved stores up to this model
 */
(function (global) {
  'use strict';

  // key: [label, CSS family, Google Fonts spec, kind]
  var FONTS = {
    inter: ['Inter', "'Inter', system-ui, sans-serif", 'Inter:wght@400;500;600;700', 'Sans'],
    dmsans: ['DM Sans', "'DM Sans', system-ui, sans-serif", 'DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700', 'Sans'],
    manrope: ['Manrope', "'Manrope', system-ui, sans-serif", 'Manrope:wght@400;500;600;700;800', 'Sans'],
    outfit: ['Outfit', "'Outfit', system-ui, sans-serif", 'Outfit:wght@400;500;600;700', 'Sans'],
    poppins: ['Poppins', "'Poppins', system-ui, sans-serif", 'Poppins:wght@400;500;600;700', 'Sans'],
    spacegrotesk: ['Space Grotesk', "'Space Grotesk', system-ui, sans-serif", 'Space+Grotesk:wght@400;500;600;700', 'Sans'],
    nunito: ['Nunito', "'Nunito', system-ui, sans-serif", 'Nunito:wght@400;500;600;700;800', 'Rounded'],
    playfair: ['Playfair Display', "'Playfair Display', Georgia, serif", 'Playfair+Display:wght@400;500;600;700', 'Serif'],
    cormorant: ['Cormorant Garamond', "'Cormorant Garamond', Georgia, serif", 'Cormorant+Garamond:wght@400;500;600;700', 'Serif'],
    fraunces: ['Fraunces', "'Fraunces', Georgia, serif", 'Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700', 'Serif'],
    librebaskerville: ['Libre Baskerville', "'Libre Baskerville', Georgia, serif", 'Libre+Baskerville:wght@400;700', 'Serif'],
    instrument: ['Instrument Serif', "'Instrument Serif', Georgia, serif", 'Instrument+Serif:ital@0;1', 'Serif']
  };
  var OLD_FONTS = { modern: 'inter', geometric: 'manrope', elegant: 'playfair', luxe: 'cormorant', friendly: 'nunito' };

  function fontHref(theme) {
    var f = (theme && theme.fonts) || {};
    var keys = [f.heading, f.body].filter(function (k, i, a) { return FONTS[k] && a.indexOf(k) === i; });
    if (!keys.length) keys = ['inter'];
    return 'https://fonts.googleapis.com/css2?' + keys.map(function (k) { return 'family=' + FONTS[k][2]; }).join('&') + '&display=swap';
  }

  // Designer style presets. Choosing one sets every style token at once.
  var STYLES = {
    editorial: { label: 'Editorial', desc: 'Refined, airy, serif', colors: { bg: '#FFFFFF', surface: '#F5F3EF', text: '#161513', muted: '#6B675F', border: '#E6E2DB' }, primary: '#161513', fonts: { heading: 'cormorant', body: 'inter' }, headingWeight: 500, headingCase: 'none', radius: 0, buttonShape: 'square', density: 'spacious' },
    classic: { label: 'Classic', desc: 'Warm and welcoming', colors: { bg: '#FFFDF9', surface: '#F6EFE7', text: '#231F1B', muted: '#75695E', border: '#EADFD3' }, primary: '#8A5A44', fonts: { heading: 'playfair', body: 'inter' }, headingWeight: 500, headingCase: 'none', radius: 14, buttonShape: 'pill', density: 'comfortable' },
    modern: { label: 'Modern', desc: 'Clean and confident', colors: { bg: '#FFFFFF', surface: '#F5F6F8', text: '#111318', muted: '#646A76', border: '#E4E6EB' }, primary: '#111318', fonts: { heading: 'inter', body: 'inter' }, headingWeight: 600, headingCase: 'none', radius: 12, buttonShape: 'rounded', density: 'comfortable' },
    bold: { label: 'Bold', desc: 'Strong, graphic, loud', colors: { bg: '#FFFFFF', surface: '#F1F2F4', text: '#0D0E10', muted: '#595E69', border: '#E1E3E8' }, primary: '#2E4F7A', fonts: { heading: 'spacegrotesk', body: 'dmsans' }, headingWeight: 700, headingCase: 'uppercase', radius: 4, buttonShape: 'square', density: 'comfortable' },
    soft: { label: 'Soft', desc: 'Gentle and friendly', colors: { bg: '#FFFAF8', surface: '#FBEEEA', text: '#3A2B2A', muted: '#8A7471', border: '#F1DDD8' }, primary: '#B86A78', fonts: { heading: 'fraunces', body: 'dmsans' }, headingWeight: 500, headingCase: 'none', radius: 20, buttonShape: 'pill', density: 'comfortable' },
    midnight: { label: 'Midnight', desc: 'Dark and luxurious', colors: { bg: '#0F1012', surface: '#18191C', text: '#F3F1EC', muted: '#A19E97', border: '#2B2C30' }, primary: '#D1B07C', fonts: { heading: 'cormorant', body: 'inter' }, headingWeight: 500, headingCase: 'none', radius: 2, buttonShape: 'square', density: 'spacious' }
  };
  var OLD_TEMPLATES = { classic: 'classic', minimal: 'editorial', bold: 'bold' };

  function applyStyle(theme, key, keepPrimary) {
    var p = STYLES[key] || STYLES.modern;
    theme.style = key;
    theme.colors = JSON.parse(JSON.stringify(p.colors));
    if (!keepPrimary) theme.primary = p.primary;
    theme.fonts = { heading: p.fonts.heading, body: p.fonts.body };
    theme.headingWeight = p.headingWeight;
    theme.headingCase = p.headingCase;
    theme.radius = p.radius;
    theme.buttonShape = p.buttonShape;
    theme.density = p.density;
    return theme;
  }

  function uid() { return 's' + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 7); }

  var SCHEMES = [['default', 'Default'], ['alt', 'Tinted'], ['dark', 'Dark'], ['accent', 'Brand colour']];
  var ICONS = [['truck', 'Delivery'], ['shield', 'Secure'], ['chat', 'Chat'], ['leaf', 'Natural'], ['star', 'Quality'], ['gift', 'Gift'], ['clock', 'Fast'], ['heart', 'Care'], ['hand', 'Handmade'], ['refresh', 'Returns'], ['pin', 'Local'], ['badge', 'Guarantee']];

  var btn = function (n) {
    return [
      { k: 'button' + n + 'Label', t: 'text', label: 'Button ' + n + ' text', ph: n === 1 ? 'e.g. Shop now' : 'Leave empty to hide' },
      { k: 'button' + n + 'Link', t: 'link', label: 'Button ' + n + ' link', show: function (s) { return !!s['button' + n + 'Label']; } }
    ];
  };

  // Section types. Fields drive the editor form; defaults create new sections.
  var TYPES = {
    hero: {
      label: 'Banner', desc: 'Large headline with an image or product collage', icon: 'image',
      fields: [
        { k: 'layout', t: 'seg', label: 'Layout', opts: [['split', 'Split'], ['center', 'Centered'], ['image', 'Full image'], ['minimal', 'Text only']] },
        { k: 'eyebrow', t: 'text', label: 'Small heading', ph: 'e.g. New collection' },
        { k: 'heading', t: 'text', label: 'Headline' },
        { k: 'text', t: 'textarea', label: 'Text' },
        { k: 'image', t: 'image', label: 'Image', help: 'Without an image, the split layout shows your first products.', show: function (s) { return s.layout !== 'minimal'; } }
      ].concat(btn(1), btn(2), [
        { k: 'align', t: 'seg', label: 'Text alignment', opts: [['left', 'Left'], ['center', 'Center']], show: function (s) { return s.layout !== 'split'; } },
        { k: 'height', t: 'seg', label: 'Height', opts: [['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']], show: function (s) { return s.layout !== 'split'; } },
        { k: 'overlay', t: 'range', label: 'Image darkness', min: 0, max: 80, unit: '%', show: function (s) { return s.layout === 'image'; } },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ]),
      defaults: { layout: 'split', eyebrow: '', heading: 'Welcome to our store', text: '', image: '', button1Label: 'Shop now', button1Link: 'products', button2Label: '', button2Link: 'home', align: 'left', height: 'md', overlay: 40, scheme: 'alt' }
    },
    features: {
      label: 'Highlights', desc: 'Delivery, payment and other reasons to buy', icon: 'badge',
      fields: [
        { k: 'auto', t: 'toggle', label: 'Use my delivery & payment settings', help: 'Turn off to write your own highlights.' },
        { k: 'items', t: 'list', label: 'Highlights', add: 'Add highlight', max: 6, show: function (s) { return !s.auto; }, title: function (it) { return it.title || 'Highlight'; },
          item: [{ k: 'icon', t: 'icon', label: 'Icon' }, { k: 'title', t: 'text', label: 'Title' }, { k: 'text', t: 'text', label: 'Text' }],
          blank: { icon: 'star', title: 'Quality you can feel', text: 'Made with care' } },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { auto: true, items: [], scheme: 'default' }
    },
    products: {
      label: 'Products', desc: 'Your products in a grid, with search and filters', icon: 'grid',
      fields: [
        { k: 'eyebrow', t: 'text', label: 'Small heading' },
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'source', t: 'seg', label: 'Show', opts: [['all', 'All products'], ['category', 'One category']] },
        { k: 'category', t: 'category', label: 'Category', show: function (s) { return s.source === 'category'; } },
        { k: 'limit', t: 'range', label: 'Maximum products', min: 2, max: 48, step: 1 },
        { k: 'columns', t: 'seg', label: 'Columns on desktop', opts: [['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']] },
        { k: 'showSearch', t: 'toggle', label: 'Show search' },
        { k: 'showFilters', t: 'toggle', label: 'Show category filters' },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { eyebrow: '', heading: 'Our products', source: 'all', category: '', limit: 24, columns: '4', showSearch: true, showFilters: true, scheme: 'default' }
    },
    imageText: {
      label: 'Image with text', desc: 'A photo beside a heading, text and button', icon: 'columns',
      fields: [
        { k: 'image', t: 'image', label: 'Image' },
        { k: 'imageSide', t: 'seg', label: 'Image position', opts: [['left', 'Left'], ['right', 'Right']] },
        { k: 'eyebrow', t: 'text', label: 'Small heading' },
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'text', t: 'textarea', label: 'Text' }
      ].concat(btn(1), [{ k: 'scheme', t: 'scheme', label: 'Colours' }]),
      defaults: { image: '', imageSide: 'left', eyebrow: '', heading: 'Made with care', text: 'Tell customers what makes your products special: materials, process, or the people behind them.', button1Label: '', button1Link: 'products', scheme: 'default' }
    },
    richText: {
      label: 'Text', desc: 'A heading and paragraph, e.g. your story', icon: 'text',
      fields: [
        { k: 'eyebrow', t: 'text', label: 'Small heading' },
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'text', t: 'textarea', label: 'Text', rows: 6 },
        { k: 'size', t: 'seg', label: 'Text size', opts: [['md', 'Regular'], ['lg', 'Large']] },
        { k: 'align', t: 'seg', label: 'Alignment', opts: [['left', 'Left'], ['center', 'Center']] }
      ].concat(btn(1), [{ k: 'scheme', t: 'scheme', label: 'Colours' }]),
      defaults: { eyebrow: 'Our story', heading: '', text: '', size: 'lg', align: 'center', button1Label: '', button1Link: 'products', scheme: 'alt' }
    },
    owner: {
      label: 'Meet the owner', desc: 'Your photo and story', icon: 'user',
      fields: [
        { k: 'photo', t: 'image', label: 'Photo', round: true },
        { k: 'eyebrow', t: 'text', label: 'Small heading' },
        { k: 'name', t: 'text', label: 'Name' },
        { k: 'bio', t: 'textarea', label: 'Story', rows: 5 },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { photo: '', eyebrow: 'Meet the owner', name: '', bio: '', scheme: 'default' }
    },
    testimonials: {
      label: 'Customer reviews', desc: 'Quotes from real customers', icon: 'quote',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'items', t: 'list', label: 'Reviews', add: 'Add review', max: 9, title: function (it) { return it.name || 'Review'; }, help: 'Only add reviews real customers gave you.',
          item: [{ k: 'quote', t: 'textarea', label: 'What they said' }, { k: 'name', t: 'text', label: 'Name' }, { k: 'detail', t: 'text', label: 'Detail', ph: 'e.g. Bengaluru' }],
          blank: { quote: '', name: '', detail: '' } },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { heading: 'What customers say', items: [], scheme: 'alt' }
    },
    gallery: {
      label: 'Gallery', desc: 'A grid of photos', icon: 'gallery',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'columns', t: 'seg', label: 'Columns', opts: [['2', '2'], ['3', '3'], ['4', '4']] },
        { k: 'items', t: 'list', label: 'Photos', add: 'Add photo', max: 12, title: function (it, i) { return it.caption || 'Photo ' + (i + 1); },
          item: [{ k: 'image', t: 'image', label: 'Photo' }, { k: 'caption', t: 'text', label: 'Caption' }], blank: { image: '', caption: '' } },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { heading: '', columns: '3', items: [], scheme: 'default' }
    },
    faq: {
      label: 'FAQ', desc: 'Questions and answers', icon: 'help',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'items', t: 'list', label: 'Questions', add: 'Add question', max: 20, title: function (it) { return it.q || 'Question'; },
          item: [{ k: 'q', t: 'text', label: 'Question' }, { k: 'a', t: 'textarea', label: 'Answer' }], blank: { q: 'How long does delivery take?', a: '' } },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { heading: 'Frequently asked questions', items: [], scheme: 'default' }
    },
    video: {
      label: 'Video', desc: 'A YouTube video', icon: 'play',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'url', t: 'text', label: 'YouTube link', ph: 'https://www.youtube.com/watch?v=…' },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { heading: '', url: '', scheme: 'default' }
    },
    cta: {
      label: 'Call to action', desc: 'A bold banner with a button', icon: 'megaphone',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'text', t: 'textarea', label: 'Text' }
      ].concat(btn(1), [{ k: 'scheme', t: 'scheme', label: 'Colours' }]),
      defaults: { heading: 'Questions? We\'re a message away.', text: 'Chat with us on WhatsApp for custom orders, gifting and bulk enquiries.', button1Label: 'Chat on WhatsApp', button1Link: 'whatsapp', scheme: 'accent' }
    },
    contact: {
      label: 'Contact', desc: 'Address, hours and ways to reach you', icon: 'pin',
      fields: [
        { k: 'heading', t: 'text', label: 'Heading' },
        { k: 'text', t: 'textarea', label: 'Text' },
        { k: 'hours', t: 'textarea', label: 'Opening hours', ph: 'e.g. Mon–Sat, 10am–7pm', rows: 2 },
        { k: 'showMap', t: 'toggle', label: 'Show “Get directions” button', help: 'Uses the address in Settings.' },
        { k: 'scheme', t: 'scheme', label: 'Colours' }
      ],
      defaults: { heading: 'Get in touch', text: 'We usually reply within a few hours.', hours: '', showMap: true, scheme: 'alt' }
    }
  };

  function newSection(type, over) {
    var def = TYPES[type];
    return { id: uid(), type: type, hidden: false, settings: Object.assign(JSON.parse(JSON.stringify(def.defaults)), over || {}) };
  }

  // Page templates owners can add.
  var PAGE_TEMPLATES = {
    blank: { title: 'New page', sections: function () { return [newSection('richText', { eyebrow: '', heading: 'New page', text: 'Add your content here.', align: 'left', size: 'md', scheme: 'default' })]; } },
    about: { title: 'About us', sections: function (s) { return [newSection('richText', { eyebrow: 'About us', heading: s.name, text: s.description || '', scheme: 'default' }), newSection('owner', ownerFrom(s))]; } },
    contact: { title: 'Contact', sections: function () { return [newSection('contact', { scheme: 'default' }), newSection('faq')]; } },
    shipping: { title: 'Shipping & returns', sections: function () { return [newSection('richText', { eyebrow: '', heading: 'Shipping & returns', align: 'left', size: 'md', scheme: 'default', text: '[Replace this with your own policy.]\n\nShipping: where you deliver, how long it takes and what it costs.\n\nReturns: whether you accept returns or exchanges, within how many days, and how customers can request one.' })]; } },
    privacy: { title: 'Privacy policy', sections: function () { return [newSection('richText', { eyebrow: '', heading: 'Privacy policy', align: 'left', size: 'md', scheme: 'default', text: '[Replace this with your own privacy policy.]\n\nExplain what details you collect when someone orders (name, phone, address), why you need them, and who you share them with (for example, delivery partners).' })]; } },
    terms: { title: 'Terms of service', sections: function () { return [newSection('richText', { eyebrow: '', heading: 'Terms of service', align: 'left', size: 'md', scheme: 'default', text: '[Replace this with your own terms.]' })]; } }
  };

  function ownerFrom(s) {
    var o = s.owner || {};
    return { name: o.name || '', bio: o.bio || '', photo: o.photo || '' };
  }

  // Brings any saved store (v1/v2 flat fields) up to the section model.
  function upgrade(s) {
    if (!s) return s;
    var t = s.theme = s.theme || {};
    if (!t.colors) {
      var styleKey = OLD_TEMPLATES[t.template] || 'modern';
      var primary = t.primary;
      applyStyle(t, styleKey);
      if (primary) t.primary = primary;
      if (t.font && OLD_FONTS[t.font]) { t.fonts.heading = OLD_FONTS[t.font]; }
    }
    t.card = t.card || { ratio: '4/5', align: 'left', quickAdd: true, showCategory: true };
    t.mobile = t.mobile || { bottomNav: true, stickyBuy: true, columns: 2 };
    if (t.customCss == null) t.customCss = '';
    if (!t.buttonCase) t.buttonCase = t.headingCase === 'uppercase' ? 'uppercase' : 'none';

    if (!s.brand) {
      var img = /^(data:|https?:|\/)/.test(String(s.logo || ''));
      s.brand = { type: img ? 'image' : 'wordmark', text: s.name || '', mark: 'none', size: 'md' };
    }
    if (!s.header) {
      s.header = { layout: 'left', sticky: true, showSearch: true, autoCategories: true, menu: [{ label: 'Shop all', link: 'products' }] };
    }
    if (!s.footer) s.footer = { text: s.tagline || '', showPowered: true, social: { instagram: (s.contact && s.contact.instagram) || '', facebook: '', youtube: '' } };

    if (!Array.isArray(s.pages) || !s.pages.length) {
      var h = s.hero || {};
      var home = [];
      home.push(newSection('hero', {
        layout: h.layout || 'split', eyebrow: h.eyebrow || '', heading: h.heading || s.name || 'Welcome',
        text: h.subheading || s.tagline || '', image: h.image || '', button1Label: h.cta || 'Shop now', button1Link: 'products',
        align: h.layout === 'center' ? 'center' : 'left', scheme: 'alt'
      }));
      home.push(newSection('features'));
      home.push(newSection('products', { heading: s.productsHeading || 'Our products' }));
      if (s.about) home.push(newSection('richText', { eyebrow: 'Our story', heading: '', text: s.about }));
      if (s.owner && s.owner.bio) home.push(newSection('owner', ownerFrom(s)));
      s.pages = [{ id: 'home', title: 'Home', slug: '', sections: home }];
      var story = home.filter(function (x) { return x.type === 'richText' || x.type === 'owner'; })[0];
      if (story && s.header.menu.length < 2) s.header.menu.push({ label: 'About', link: 'section:' + story.id });
    }
    s.schema = 3;
    return s;
  }

  // Link values used by buttons and menus:
  //   home · products · whatsapp · cat:<name> · page:<id> · section:<id> · url:<https…>
  function linkOptions(s) {
    var out = [['home', 'Home page'], ['products', 'All products']];
    var cats = [];
    (s.products || []).forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    cats.forEach(function (c) { out.push(['cat:' + c, 'Category: ' + c]); });
    (s.pages || []).forEach(function (p) { if (p.id !== 'home') out.push(['page:' + p.id, 'Page: ' + p.title]); });
    ((s.pages || [])[0] || { sections: [] }).sections.forEach(function (x) {
      if (x.type !== 'hero' && TYPES[x.type]) out.push(['section:' + x.id, 'Section: ' + sectionName(x)]);
    });
    out.push(['whatsapp', 'WhatsApp chat']);
    out.push(['url:', 'Web address…']);
    return out;
  }

  function sectionName(x) {
    var st = x.settings || {};
    var t = TYPES[x.type] ? TYPES[x.type].label : x.type;
    var h = st.heading || st.name || '';
    return h ? t + ' · ' + String(h).slice(0, 28) : t;
  }

  global.SahaaySections = {
    FONTS: FONTS, STYLES: STYLES, TYPES: TYPES, SCHEMES: SCHEMES, ICONS: ICONS, PAGE_TEMPLATES: PAGE_TEMPLATES,
    fontHref: fontHref, applyStyle: applyStyle, newSection: newSection, upgrade: upgrade, linkOptions: linkOptions,
    sectionName: sectionName, uid: uid, ownerFrom: ownerFrom
  };
})(typeof window !== 'undefined' ? window : globalThis);
