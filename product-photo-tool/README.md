# 📸 SnapList — AI Product Description Writer

A mobile-friendly Progressive Web App: take or upload a photo of a product and get a ready-to-publish **title, short description, full description, bullet highlights and tags** for your online listing — written by AI.

Fully self-contained; independent of the other project(s) in this repo.

## How it works

1. Add up to 4 photos of the product (camera or gallery).
2. Optionally add product name, category, key details, tone and platform.
3. Tap **Write my listing**. The app sends your photo(s) and details directly from your browser to an AI provider you've connected, and shows back an editable listing.
4. Copy any field, copy everything, or download a `.txt` file. Past listings are saved on-device under the 🕒 history button.

## Free AI providers supported

You bring your own **free** API key — nothing is billed, no credit card required, and the key is stored only in your browser's local storage (never sent anywhere but the provider you choose).

- **Google Gemini** (recommended) — get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Generous daily free quota for `gemini-2.0-flash` / `gemini-1.5-flash`.
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

## Privacy

- No backend of ours is involved. The app runs entirely in your browser.
- Photos are resized/compressed on-device before being sent to the AI provider you chose, for that one request only.
- Your API key and your recent listings history are stored only in this browser's `localStorage`, on this device.
