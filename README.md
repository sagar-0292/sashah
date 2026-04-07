# 💊 MedVault — Family Medicine Tracker

A beautiful, fully offline-capable **Progressive Web App (PWA)** for tracking your family's medicines, doses, and inventory. Installable on **iPhone, Android, and desktop** directly from the browser — no App Store needed.

---

## ✨ Features

- 👨‍👩‍👧‍👦 **Family Profiles** — separate medicine lists for each member, with photos and colour themes
- 💊 **Medicine Inventory** — track tablet counts with automatic decrement at scheduled dose times
- ✅ **Mark as Taken** — tap a dose pill to mark it taken; count adjusts automatically
- 🛒 **Smart Strip Refill** — set a strip size once, tap "+ Strip" to restock instantly
- 🆘 **SOS Cabinet** — emergency medicines tracked separately with low-stock alerts
- 🔔 **Alerts** — notifications when any medicine drops to 4 tablets or below
- 📱 **PWA** — install on iPhone (Safari) or Android (Chrome) as a home screen app
- 🌐 **Works Offline** — full functionality without internet after first load
- 💾 **Local Storage** — all data stays on your device, fully private

---

## 🚀 Deploy to GitHub Pages (Free Hosting)

This is the easiest way to get MedVault running on all your devices.

### Step 1 — Create a GitHub account
Go to [github.com](https://github.com) and sign up for free if you don't have an account.

### Step 2 — Create a new repository
1. Click the **+** button → **New repository**
2. Name it `medvault` (or anything you like)
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
**Option A — Drag & Drop (easiest):**
1. Open your new repository on GitHub
2. Click **uploading an existing file**
3. Drag ALL the files and folders from this project into the upload area:
   - `index.html`
   - `style.css`
   - `app.js`
   - `sw.js`
   - `manifest.json`
   - `.nojekyll`
   - `icons/` folder (with all 3 PNG files)
   - `.github/` folder (with the `workflows/deploy.yml` file)
4. Click **Commit changes**

**Option B — Git CLI:**
```bash
git init
git add .
git commit -m "Initial MedVault deploy"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/medvault.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages
1. Go to your repository → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Step 5 — Wait ~60 seconds
GitHub Actions will automatically build and deploy. You'll see a green checkmark under the **Actions** tab when done.

### Step 6 — Open your app
Your app will be live at:
```
https://YOUR-USERNAME.github.io/medvault/
```

---

## 📱 Install on Your Phone

### iPhone / iPad (Safari)
1. Open the URL above in **Safari** (not Chrome)
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. MedVault icon appears on your home screen ✓

### Android (Chrome)
1. Open the URL above in **Chrome**
2. Tap the **three-dot menu** (⋮) → **"Add to Home screen"** or **"Install app"**
3. Tap **Install**
4. MedVault icon appears on your home screen ✓

> After installing, the app works **fully offline** — no internet needed.

---

## 📁 File Structure

```
medvault/
├── index.html          ← Main app HTML
├── style.css           ← All styles
├── app.js              ← All app logic (JavaScript)
├── sw.js               ← Service Worker (offline support)
├── manifest.json       ← PWA manifest (app name, icons, display)
├── .nojekyll           ← Tells GitHub Pages not to use Jekyll
├── icons/
│   ├── icon-192.png    ← App icon (small)
│   ├── icon-512.png    ← App icon (large)
│   └── icon-maskable-512.png  ← Adaptive icon for Android
└── .github/
    └── workflows/
        └── deploy.yml  ← Auto-deploys to GitHub Pages on every push
```

---

## 🔒 Privacy

All your data is stored **only on your device** using the browser's `localStorage`. Nothing is sent to any server. Each family member's device will have its own independent data.

---

## 🛠 Making Changes

Edit `index.html`, `style.css`, or `app.js` directly on GitHub (click the file → pencil icon). Every save automatically re-deploys via GitHub Actions within ~60 seconds.

---

## 📖 How to Use

1. **Add a family member** — tap "+ Add Member", set their name, role, age and photo
2. **Add medicines** — go to their profile → "+ Add Med", set name, count, strip size and schedule
3. **Mark doses taken** — tap the dose pill (e.g. "8 AM") on the medicine card to mark it taken
4. **Restock** — tap "🛒 Strip" on any medicine when you buy a new strip
5. **SOS medicines** — use the SOS tab for emergency medicines that the whole family shares
6. **Alerts** — the bell icon turns red when any medicine is running low (≤4 remaining)

---

## 📜 License

MIT — free to use, modify, and share.
