# 📸 SnapList by Sahaay — AI Product Description Writer

A mobile-friendly Progressive Web App: take or upload a photo of a product and get a ready-to-publish **title, short description, full description, bullet highlights and tags** for your online listing — written by AI.

Fully self-contained; independent of the other project(s) in this repo.

## How it works

1. Add up to 4 photos of the product (camera or gallery).
2. Optionally add product name, category, key details, tone and platform.
3. Tap **Write my listing**. The app sends your photo(s) and details directly from your browser to an AI provider you've connected, and shows back an editable listing.
4. Copy any field, copy everything, or download a `.txt` file. Past listings are saved on-device under the 🕒 history button.

## Free AI providers supported

You bring your own **free** API key — nothing is billed, no credit card required, and the key is stored only in your browser's local storage (never sent anywhere but the provider you choose).

- **Google Gemini** (recommended) — get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Generous daily free quota for `gemini-3.6-flash` and other current Flash models (selectable in Settings).
- **OpenRouter** — get a free key at [openrouter.ai/keys](https://openrouter.ai/keys). Gives access to several `:free`-tier vision models (Gemini, Qwen-VL, Llama Vision, Mistral) through one key.

Set your provider and key from the ⚙️ Settings sheet inside the app — it includes step-by-step instructions and a "Test connection" button.

## Install on a phone

1. Deploy this folder (e.g. GitHub Pages, Vercel, Netlify — any static host works).
2. Open the URL in Safari (iPhone) or Chrome (Android).
3. Safari: Share → **Add to Home Screen**. Chrome: menu (⋮) → **Install app** / **Add to Home screen**.
4. The app icon appears on the home screen and opens full-screen, just like a native app.

## Deploying alongside the rest of this repo

This tool lives entirely under `product-photo-tool/` and shares no files with anything else in this repository. If the repo root is already published (e.g. via GitHub Pages), this tool will be reachable at:

```
https://<your-domain>/product-photo-tool/
```

No build step, server, or backend required — it's plain HTML/CSS/JS.

## Enabling ads (optional)

The app can show a single, tasteful Google AdSense ad — only after a listing is generated, never in the core upload/generate flow. It's off by default (no script loads, no ad box renders) until you configure it:

1. Apply at [google.com/adsense](https://www.google.com/adsense) with this site's live URL. **Be aware**: AdSense approval can take days to weeks, and a small single-purpose utility tool like this sometimes gets rejected for "insufficient content" — if that happens, consider adding a short "How it works" / FAQ section of real text to the page before reapplying.
2. Once approved, create an ad unit and note your **Publisher ID** (`ca-pub-...`) and that unit's **Slot ID**.
3. Open `index.html`, find the `ADSENSE_CLIENT_ID` / `ADSENSE_SLOT_ID` placeholders near the top of `<head>`, and replace them with your real values.
4. **`ads.txt`**: this file needs to live at your domain's *root* (e.g. `https://sagar-0292.github.io/ads.txt`), not inside `/product-photo-tool/`. The one in this folder is a placeholder with the exact line to publish there — it only matters once this tool has its own domain/root, otherwise Google's crawler won't find it at the sub-path.
5. AdSense also requires a linked privacy policy — `privacy.html` in this folder already covers the standard ad/cookie disclosures Google asks for; update the contact section with your real details.

## Getting found in search (SEO)

Since the plan is free-with-ads first to see real demand before any paywall, organic search traffic is the main thing worth investing in — it's both the ad revenue and the demand signal. What's already in place:

- Unique `<title>`/meta description, Open Graph and Twitter Card tags, and a canonical URL on every page.
- `SoftwareApplication` structured data on the home page, `FAQPage` structured data on `how-it-works.html` (Google can show these as rich results — an FAQ dropdown directly in search results, for instance), and `AboutPage`/`Organization` data on `about.html`.
- `sitemap.xml` listing all four pages.
- `robots.txt` — **note its limitation**: crawlers only ever check this file at your domain's true root (`https://sagar-0292.github.io/robots.txt`), never at this sub-path. The copy here is a reference/placeholder only. What actually controls indexing today is each page's `<meta name="robots" content="index, follow">` tag, which works regardless of location — so you don't need the root-level file to be indexed, only if you later want to *block* something.

To actually get indexed and start showing up in results:

1. Go to [Google Search Console](https://search.google.com/search-console), add a property using **URL prefix** (not Domain) with the value `https://sagar-0292.github.io/sashah/product-photo-tool/`. URL-prefix properties can be verified with an HTML tag or file at that exact path — unlike Domain properties, they don't need root-level DNS access you don't have.
2. Verify using the **HTML tag** method: it gives you a `<meta name="google-site-verification" ...>` tag — add it to `index.html`'s `<head>` (any page works, but the home page is simplest).
3. Once verified, go to **Sitemaps** in the left nav and submit `sitemap.xml`.
4. Under **URL Inspection**, request indexing for `index.html` manually to speed up the first crawl instead of waiting for Google to discover it on its own.
5. If this ever moves to a custom domain, update every `canonical`/`og:url`/JSON-LD `url` field in these files (currently hardcoded to the GitHub Pages URL) and redo the Search Console verification for the new domain.

## Privacy

- No backend of ours is involved for the app itself. It runs entirely in your browser.
- Photos are resized/compressed on-device before being sent to the AI provider you chose, for that one request only.
- Your API key and your recent listings history are stored only in this browser's `localStorage`, on this device.
- If ads are enabled, Google AdSense may set advertising cookies — see [`privacy.html`](privacy.html) for details and opt-out links.
