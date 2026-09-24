# Sahaay Stores: going live as a hosted platform

This is a **one-time setup for you, the platform owner**. Once it's done, your customers never deal with hosting. They answer four questions and their store is online at `your-domain/s/their-store/`, with a mobile app, live orders and automatic updates.

It uses the same stack as SnapList in `sahaay/`: **Firebase** (sign-in, database, image storage) and **Vercel** (website + API). Use a **separate Firebase project** from SnapList and MedVault.

---

## 1. Firebase project

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (e.g. `sahaay-stores`).
2. **Authentication → Get started → Sign-in method** and enable both:
   - **Anonymous**. Owners get an invisible account when they launch, so there's no signup form.
   - **Google**. Owners use it to "save access" and sign in from other devices.
3. **Authentication → Settings → Authorized domains**: add your Vercel domain(s), e.g. `sahaay-stores.vercel.app` and your own domain.
4. **Firestore Database → Create database → Production mode** (region `asia-south1` for India). Open the **Rules** tab, paste in [`firestore.rules`](firestore.rules) and **Publish**.
5. **Storage → Get started**, same region. Open the **Rules** tab, paste in [`storage.rules`](storage.rules) and **Publish**. Note the bucket name (e.g. `sahaay-stores.appspot.com` or `sahaay-stores.firebasestorage.app`).
6. **Web config** (safe to publish): Project settings → General → Your apps → **Add app → Web**. Copy the `firebaseConfig` object into [`config.js`](config.js), replacing `firebase: null`.
7. **Server key** (secret, never commit it): Project settings → Service accounts → **Generate new private key**. You'll need `project_id`, `client_email` and `private_key` from it in step 3.

## 2. Gemini key (optional, recommended)

This writes each new store's homepage from the owner's description and bio. Without it, stores still launch, using template text and the owner's own words.

- Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
- Each new store uses one request. Watch usage at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit).

## 3. Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this GitHub repo.
2. Set **Root Directory** to `store-builder`. Vercel reads `vercel.json` (store URLs, app manifest, service worker) and `package.json`.
3. Under **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | from the service-account JSON |
| `FIREBASE_CLIENT_EMAIL` | from the service-account JSON |
| `FIREBASE_PRIVATE_KEY` | from the service-account JSON (paste as-is, `\n`s included) |
| `FIREBASE_STORAGE_BUCKET` | your bucket name from step 1.5 |
| `GEMINI_API_KEY` | optional, from step 2 |
| `IP_HASH_SALT` | any random string (used for rate limiting) |

4. **Deploy.** Open the site, click **Create your store**, and you should reach "… is live" with a working link.

Vercel's free Hobby plan is for non-commercial use only, so switch to **Pro** before you charge anyone. Check current Vercel and Firebase pricing; both have free tiers that cover early growth.

## 4. Your domain

In Vercel → **Settings → Domains**, add your domain (e.g. `sahaay.online` or `stores.sahaay.online`) and follow the DNS steps. Stores then live at `https://sahaay.online/s/store-name/`.

> Subdomains per store (`store-name.sahaay.online`) are a later upgrade. They need a wildcard domain on Vercel plus host-based rewrites, and the path-based links above work well to start.

## 5. Before charging customers

- Razorpay KYC and the legal pages it requires (terms, privacy, refunds). See `sahaay/SETUP.md`.
- A privacy policy that covers the customer data stores collect (names, phones, addresses).
- Update the landing page's pricing section when you add paid plans.

---

## Running it locally

```bash
cd store-builder
node dev-server.js        # http://localhost:3000
```

The dev server needs no accounts and no `npm install`. It runs the real API with an in-memory database and a built-in test sign-in, so you can try the whole flow: create a store, open its live link, place an order, and see it in the dashboard. Data resets when the server stops.

Opening the builder from a plain static server (or GitHub Pages) with no API runs it in the older **download & self-host** mode.
