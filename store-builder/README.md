# 🛍️ Sahaay Stores: online shops for small businesses

A Shopify-style store builder for small businesses, home sellers and local shops. Owners set up a store in a few minutes, add products, choose a design, and publish a real online shop that takes orders over **WhatsApp** and payments by **UPI** or **cash on delivery**.

It has no backend, no signup and no build step, and it doesn't depend on the other projects in this repo.

## What it does

| Area | Features |
|---|---|
| **Setup wizard** | Shop name, business type (8 presets, each with its own colours, fonts, copy and sample products), logo, brand colour, style, WhatsApp, UPI, COD and currency |
| **Dashboard** | Sales stats, a launch checklist, recent orders, and a one-click button to delete the sample products |
| **Products** | Up to 4 photos each (compressed in the browser), price, sale price, stock with automatic "Sold out", categories, hide/show, duplicate, delete |
| **Orders** | Status tracking (new → confirmed → paid → shipped → delivered / cancelled), filters, one-tap WhatsApp or call to the customer |
| **Design** | Classic, Bold and Minimal themes, brand colour, 3 fonts, emoji or uploaded logo, announcement bar, banner text and photo, about section. Changes show live in a desktop/mobile preview |
| **Settings** | Contact details, UPI, COD, flat delivery fee and a free-delivery threshold |
| **Publish** | Downloads the whole store as one standalone `index.html`, with step-by-step Netlify Drop and GitHub Pages instructions. Also downloads and restores JSON backups |

**The customer's store** has a product grid with search and category filters, product pages with a photo gallery, a cart that is remembered between visits, and checkout. After checkout the customer gets:
- **Send order on WhatsApp**, which opens a pre-filled message with the items, total and delivery address
- **Pay with a UPI app**, a `upi://pay` link with the exact amount and the order number as the note
- **Email the order**, if the owner has added an email address

## How it works

```
store-builder/
├── index.html       ← landing page + builder app shell
├── style.css        ← builder/landing styles (light + dark)
├── app.js           ← wizard, dashboard, products, orders, design, settings, publish/export
├── storefront.js    ← the customer-facing store renderer (no dependencies)
├── storefront.css   ← store themes, all scoped under .sf
└── preview.html     ← live store preview (used full-page and inside the Design editor)
```

- All store data is one JSON object in `localStorage` (`sahaay-stores:v1`). Photos are resized to 1000px JPEGs so a normal catalogue fits in the browser's ~5 MB limit.
- `storefront.js` and `storefront.css` are shared by the builder's preview and the published site. **Publish** fetches both files and inlines them, together with the store data, into one `index.html`. Orders and customer details are always removed from the exported file.
- Test orders placed in the preview are saved to the dashboard and reduce stock, so owners can practise the whole flow before going live.

## Run locally

Any static server works. `fetch()` is needed for publishing, so opening the file directly with `file://` isn't enough:

```bash
cd store-builder
python3 -m http.server 8000
# open http://localhost:8000
```

It's also deployed automatically with the rest of this repo by the existing GitHub Pages workflow, at `/store-builder/`.

## Current limits (a static-site MVP)

- The builder saves data **per browser**. Owners should use **Publish → Download backup** to move between devices.
- A published store is a **snapshot**. After changing products or stock, the owner downloads the file again and re-uploads it.
- Live orders arrive on WhatsApp or email rather than in the dashboard, and stock on the live site isn't reduced automatically.

## Ideas for next steps

Accounts and cloud sync (e.g. Firebase, like `sahaay/`), hosting stores on subdomains (`shopname.sahaay.store`), live orders sent to the dashboard, Razorpay checkout, discount codes, product variants (size/colour), and AI product descriptions reusing SnapList (`product-photo-tool/`).
