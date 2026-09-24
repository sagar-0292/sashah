# 🛍️ Sahaay Stores: online stores and mobile apps for small businesses

A Shopify-style builder for small businesses, home sellers and local shops. Owners answer four questions and their store goes **live automatically**, hosted for them, with a **mobile app**, AI-written homepage, live orders and payment by **UPI** or **cash on delivery**.

Frontend: plain HTML/CSS/JS with no build step. Backend: Vercel functions with Firebase. It doesn't depend on the other projects in this repo.

## What it does

| Area | Features |
|---|---|
| **Landing page** | High-end marketing site. The device mockups show real, working demo stores, not screenshots |
| **Setup** | Four questions (business type, description, owner bio, optional logo & colours) with a **live phone preview**, then an automatic launch: AI-written homepage, store published at its own link, app icons generated |
| **Home** | Sales stats, a 9-step launch checklist, recent orders, a live store preview and the app status |
| **Orders** | Status tabs with counts, expandable order details, status changes, and one-tap WhatsApp or call to the customer |
| **Products** | Search and status tabs. Up to 4 photos each (compressed in the browser), compare-at price with an automatic discount %, stock with "Only N left" and "Sold out", categories, hide, duplicate |
| **Online store (design)** | Classic, Editorial and Bold themes, 8 brand colours or a custom one, 5 font pairings, emoji or uploaded logo, split or centred banner, announcement bar and about text. **Desktop / tablet / phone preview** in real device frames |
| **Mobile views** | Settings for the store on phones: app-style bottom navigation bar, sticky "Add to cart" bar, 1 or 2 products per row |
| **Mobile app** | Turns the store into an installable PWA: app name, short name, icon (built from your logo or uploaded), launch-screen colour, and a "Get the app" install banner. Previews the home screen, launch screen and the app itself. Explains how to package it for Google Play and the App Store with PWABuilder |
| **Share / Publish** | Hosted: the live link with copy and WhatsApp share (changes publish automatically). Download mode: a ZIP with the site, manifest, service worker and icons. Both modes have JSON backup |

**The customer's store** has:
- a sticky header with category navigation, a trust strip (delivery, payment, support) and product cards with a hover second photo and quick-add
- product pages with a gallery, stock status, delivery info and "You may also like"
- a cart drawer with a free-delivery progress bar, and a two-column checkout
- after checkout: **Send order on WhatsApp**, **Pay with UPI** (`upi://pay` with the exact amount) or email

On phones, product pages and checkout open as full-screen sheets.

## How it works

### Hosted mode (the product)

Owners answer **four questions**: what kind of business it is, a short description, a few lines about themselves, and optionally a logo and colours. Then:

1. They get an invisible (anonymous) account, so there's no signup form.
2. `/api/generate` has Gemini write the homepage (headline, tagline, "Our story", a polished bio) from their own words.
3. The store is saved and **published at once** at `/s/{store-name}/`. Photos go to Firebase Storage and app icons are generated.
4. From then on, **every edit republishes automatically** (see the "Live · saved" status in the dashboard).
5. **Customer orders go to the server.** Prices and stock are re-checked there, stock goes down, and orders show up in the owner's dashboard.
6. The dashboard nudges owners to **"Save access with Google"**, which upgrades the same account so they can sign in on any device.

```
store-builder/
├── index.html · style.css · app.js   ← landing page + builder (wizard, dashboard)
├── cloud.js · config.js              ← sign-in and API client; Firebase web config
├── storefront.js · storefront.css    ← the customer-facing store (shared by preview, hosting and export)
├── presets.js                        ← business-type presets, store factory, demo stores
├── preview.html                      ← previews (own store, drafts, demos, app mode)
├── store-sw.js                       ← offline/app service worker for hosted stores
├── api/                              ← Vercel serverless functions
│   ├── stores.js     save/publish a store, fetch public or own store
│   ├── orders.js     place orders (server-priced, stock-checked), list/update/delete
│   ├── upload.js     image uploads to Firebase Storage
│   ├── generate.js   AI homepage copy (Gemini)
│   ├── render.js     serves /s/{slug}/ with real title/og tags for link previews
│   ├── manifest.js   per-store PWA manifest
│   └── _lib.js       auth, Firestore/Storage (or in-memory for dev), slugs, rate limits
├── vercel.json · package.json · firestore.rules · storage.rules
└── dev-server.js                     ← run the whole platform locally, no accounts needed
```

Firestore layout: `stores/{slug}` (store + owner), `stores/{slug}/orders/{id}`, `owners/{uid}`. Browsers never touch the database directly (the rules deny all access); only the API does.

**To go live, follow [SETUP.md](SETUP.md)** (Firebase + Vercel, about an hour, once).

### Download mode (fallback)

With no API available (e.g. GitHub Pages), the builder still works. The store is saved in the browser, and **Publish** downloads a ZIP (site + PWA manifest, service worker, icons) to host anywhere.

## Run locally

```bash
cd store-builder
node dev-server.js     # full hosted platform, in-memory data → http://localhost:3000
```

## Limits

- Stores live at `/s/{name}/` on your domain. Per-store subdomains and custom domains are a later upgrade.
- Orders arrive in the dashboard (refreshed on open and every 30 seconds). Email or push alerts to owners aren't built yet; customers can also send the order on WhatsApp.
- Online card payments (Razorpay) aren't built yet: UPI to the owner's ID, or cash on delivery.

## Ideas for next steps

Accounts and cloud sync (e.g. Firebase, like `sahaay/`), hosting on subdomains (`shopname.sahaay.store`), live orders sent to the dashboard, Razorpay checkout, discount codes, product variants, and AI product descriptions reusing SnapList (`product-photo-tool/`).
