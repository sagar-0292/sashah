# 🛍️ Sahaay Stores: online stores and mobile apps for small businesses

A Shopify-style builder for small businesses, home sellers and local shops. Owners set up a store in a few minutes, add products and choose a design. They then publish a real online store that also installs as a **mobile app** and takes orders over **WhatsApp**, with payment by **UPI** or **cash on delivery**.

It has no backend, no signup and no build step, and it doesn't depend on the other projects in this repo.

## What it does

| Area | Features |
|---|---|
| **Landing page** | High-end marketing site. The device mockups show real, working demo stores, not screenshots |
| **Setup wizard** | Split screen with a **live phone preview** that updates as you type. 8 business types, each with its own theme, font, colour, copy and 6 sample products |
| **Home** | Sales stats, a 9-step launch checklist, recent orders, a live store preview and the app status |
| **Orders** | Status tabs with counts, expandable order details, status changes, and one-tap WhatsApp or call to the customer |
| **Products** | Search and status tabs. Up to 4 photos each (compressed in the browser), compare-at price with an automatic discount %, stock with "Only N left" and "Sold out", categories, hide, duplicate |
| **Online store (design)** | Classic, Editorial and Bold themes, 8 brand colours or a custom one, 5 font pairings, emoji or uploaded logo, split or centred banner, announcement bar and about text. **Desktop / tablet / phone preview** in real device frames |
| **Mobile views** | Settings for the store on phones: app-style bottom navigation bar, sticky "Add to cart" bar, 1 or 2 products per row |
| **Mobile app** | Turns the store into an installable PWA: app name, short name, icon (built from your logo or uploaded), launch-screen colour, and a "Get the app" install banner. Previews the home screen, launch screen and the app itself. Explains how to package it for Google Play and the App Store with PWABuilder |
| **Publish** | Downloads a **ZIP** with `index.html`, `manifest.webmanifest`, `sw.js` and PNG icons (192, 512, maskable, Apple touch), or a single `index.html`. Has a readiness check, Netlify Drop and GitHub Pages instructions, and JSON backup and restore |

**The customer's store** has:
- a sticky header with category navigation, a trust strip (delivery, payment, support) and product cards with a hover second photo and quick-add
- product pages with a gallery, stock status, delivery info and "You may also like"
- a cart drawer with a free-delivery progress bar, and a two-column checkout
- after checkout: **Send order on WhatsApp**, **Pay with UPI** (`upi://pay` with the exact amount) or email

On phones, product pages and checkout open as full-screen sheets.

## How it works

```
store-builder/
├── index.html       ← landing page + builder app shell
├── style.css        ← builder/landing design system (light + dark)
├── app.js           ← wizard, dashboard, products, orders, design, mobile app, settings, publish (ZIP + PWA)
├── presets.js       ← business-type presets, store factory, demo stores
├── storefront.js    ← the customer-facing store renderer (no dependencies)
├── storefront.css   ← store themes, all scoped under .sf
└── preview.html     ← renders a store: yours, a demo (?demo=decor), a wizard draft (?draft=1), or app mode (?app=1)
```

- All store data is one JSON object in `localStorage` (`sahaay-stores:v1`). Older saved stores are migrated automatically.
- Previews are real iframes of `preview.html`, scaled into device frames, so phone and tablet media queries behave exactly as they do on a real device. Unsaved edits reach them through `postMessage`.
- **Publish** inlines `storefront.js` and `storefront.css` together with the store data into `index.html`. Orders and customer details are always removed. With the app turned on, it also generates the manifest, a service worker (network-first with an offline fallback) and the icons, drawn on a canvas. These are packed with a small built-in ZIP writer.
- Products without photos get a "studio shot" placeholder: a muted backdrop, the product's emoji and a soft floor shadow.

## Run locally

Any static server works. Publishing uses `fetch()`, so opening the file directly with `file://` isn't enough:

```bash
cd store-builder
python3 -m http.server 8000
# open http://localhost:8000
```

It's also deployed with the rest of the repo by the existing GitHub Pages workflow, at `/store-builder/`.

## Limits

- The builder saves data **per browser**. Owners use **Publish → Download backup** to move between devices.
- A published store is a **snapshot**. After changing products or stock, the owner downloads it again and re-uploads it. Installed apps pick up the update the next time they open.
- Live orders arrive on WhatsApp or email rather than in the dashboard, and stock isn't reduced automatically on the live site.
- Listing in Google Play or the App Store needs the owner's own developer accounts. PWABuilder does the packaging.

## Ideas for next steps

Accounts and cloud sync (e.g. Firebase, like `sahaay/`), hosting on subdomains (`shopname.sahaay.store`), live orders sent to the dashboard, Razorpay checkout, discount codes, product variants, and AI product descriptions reusing SnapList (`product-photo-tool/`).
