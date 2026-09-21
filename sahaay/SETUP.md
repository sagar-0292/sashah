# SnapList by Sahaay — going live on sahaay.online

All the code is written and wired together. What's left is account creation
and configuration that only you can do (identity verification, KYC, domain
DNS). Follow this in order — steps 1–3 can happen in parallel, but step 4
needs all of them finished first.

---

## 1. Firebase project (accounts + database)

Use a **new, separate** Firebase project — don't reuse MedVault's, so a
billing problem or quota spike on one product never touches the other.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it e.g. `sahaay-snaplist`.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database → Production mode** (pick a region close to your users, e.g. `asia-south1` for Mumbai).
4. Deploy the security rules already written in `firestore.rules`: open **Firestore → Rules** tab in the console, paste in the contents of that file, and **Publish**. (It denies all direct client access — the backend's Admin SDK is the only thing that ever touches this data, and it bypasses rules entirely.)
5. **Get the web app config** (safe to expose, not a secret): Project settings (gear icon) → **General** → scroll to "Your apps" → **Add app → Web** → register it (no hosting needed) → copy the `firebaseConfig` object.
   - Paste those values into `sahaay/app.js`, replacing the `FIREBASE_CONFIG` placeholder near the top of the file.
6. **Get the server credentials** (a real secret — never put this in the frontend): Project settings → **Service accounts** → **Generate new private key** → downloads a JSON file. You'll need three fields from it for Vercel env vars in step 4:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` line breaks as-is when pasting into Vercel)

## 2. Gemini API key (now yours, not the user's)

Since subscribers no longer bring their own key, you need one that the
**server** uses for everyone.

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → this becomes `GEMINI_API_KEY`.
2. **Cost/scale note:** the free tier's daily request cap is shared across *all* your subscribers combined, not per-subscriber. Once you have real paying users, watch your usage at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit) and attach a Cloud Billing account (pay-as-you-go) to the project once you're near the free cap, or you'll start seeing 429 errors for everyone. The `MONTHLY_LISTING_QUOTA` env var (default 200/user/month) is your main lever for controlling this cost — lower it if needed.

## 3. Razorpay account (payments)

1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC (PAN, bank account, business/individual details). **Approval can take 1–3 business days** — start this early.
2. Razorpay requires a **Terms of Service**, **Privacy Policy**, and **Refund/Cancellation policy** page linked from your live site before approving you for live payments. These need real legal text for your business — I haven't drafted these since they're legal documents specific to your business/jurisdiction, but you'll need simple pages for them (e.g. `sahaay.online/terms`, `/privacy`, `/refunds`) before Razorpay will let you go live.
3. Once approved, **Dashboard → Account & Settings → API Keys → Generate Key**. Grab both **Test mode** keys (for trying the flow safely first) and **Live mode** keys.
   - `Key Id` → `RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`
4. **Create a Plan**: Dashboard → **Subscriptions → Plans → Create Plan** → Recurring, set your price (e.g. ₹299), Interval: Monthly, Period: 1.
   - Copy the Plan ID (`plan_...`) → `RAZORPAY_PLAN_ID`
5. **Set up the webhook**: Dashboard → **Account & Settings → Webhooks → Add New Webhook**.
   - URL: `https://sahaay.online/api/razorpay-webhook`
   - Secret: generate any random string yourself and save it → `RAZORPAY_WEBHOOK_SECRET`
   - Active events: check **subscription.activated**, **subscription.charged**, **subscription.completed**, **subscription.cancelled**, **subscription.halted**, **subscription.paused**

## 4. Vercel project + domain

1. [vercel.com/new](https://vercel.com/new) → import this GitHub repo (`sagar-0292/sashah`).
2. **Important**: set **Root Directory** to `sahaay` (this repo has multiple independent sub-projects — MedVault, the free product-photo-tool, and this one).
3. Add these **Environment Variables** (Production *and* Preview):

   | Name | Value |
   |---|---|
   | `FIREBASE_PROJECT_ID` | from step 1.6 |
   | `FIREBASE_CLIENT_EMAIL` | from step 1.6 |
   | `FIREBASE_PRIVATE_KEY` | from step 1.6 |
   | `GEMINI_API_KEY` | from step 2 |
   | `GEMINI_MODEL` | optional, defaults to `gemini-3.6-flash` |
   | `MONTHLY_LISTING_QUOTA` | optional, defaults to `200` |
   | `RAZORPAY_KEY_ID` | from step 3.3 (start with **test** key) |
   | `RAZORPAY_KEY_SECRET` | from step 3.3 (start with **test** key) |
   | `RAZORPAY_PLAN_ID` | from step 3.4 |
   | `RAZORPAY_WEBHOOK_SECRET` | from step 3.5 |

4. Deploy.
5. **Add the domain**: Project → **Settings → Domains → Add** → type `sahaay.online` (and `www.sahaay.online` if you want that too). Vercel will show you the exact DNS records to add — usually:
   - `A` record, host `@`, value `76.76.21.21`
   - `CNAME` record, host `www`, value `cname.vercel-dns.com`

   Add those at your domain registrar's DNS settings (wherever you bought `sahaay.online`). Vercel's dashboard will show a green checkmark once it detects the records — this can take a few minutes to a few hours depending on DNS propagation.

## 5. Test before going live

1. With **test-mode** Razorpay keys still in place, open the deployed site, create an account, and go through **Subscribe now**. Razorpay's Checkout will show test payment methods — use their [documented test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/) (no real money moves in test mode).
2. Confirm: after a successful test payment, the app unlocks and `/api/generate` actually returns a written listing.
3. Confirm the webhook is reaching you: Razorpay Dashboard → Webhooks → your webhook → should show recent deliveries with a 200 response.
4. Once that all works, swap `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` in Vercel to your **live** keys and redeploy.

## What the app already does for you

- Users sign up/sign in with email + password (Firebase Auth).
- Not subscribed → sees a paywall with your price/plan and a **Subscribe now** button that opens Razorpay Checkout for the recurring plan.
- Payment success → Razorpay's webhook (not the browser) tells the backend to mark them active — this is the only trusted source of truth, so nothing client-side can fake a subscription.
- Subscribed users get the same photo → AI listing tool as before, now calling your server (`/api/generate`) instead of needing their own key.
- A monthly usage bar shows how many of their included listings they've used; the cap is enforced server-side even if someone tampers with the frontend.
- Account sheet lets them see their plan/renewal date/usage and cancel (takes effect at the end of the current billing period, so they keep what they paid for).
