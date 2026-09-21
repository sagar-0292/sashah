'use strict';

/* =========================================================================
   SnapList by Sahaay — subscription AI product-listing writer.
   Frontend only handles: Firebase Auth (sign in/up), Razorpay Checkout UI,
   and the photo/listing UI. The actual AI call and subscription/usage
   enforcement all happen server-side in /api/* — this file never talks to
   Gemini or Razorpay's server API directly, only our own backend.
   ========================================================================= */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

/* ===================== Config — fill these in (see SETUP.md) ===================== */
const FIREBASE_CONFIG = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};
const API_BASE = ''; // same-origin — frontend and /api are deployed together on Vercel
const DISPLAY_PLAN_PRICE_INR = 299; // cosmetic only; the real charge is whatever the Razorpay Plan is set to
const DISPLAY_MONTHLY_QUOTA = 200; // cosmetic only; the real cap is the MONTHLY_LISTING_QUOTA env var

const fbApp = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(fbApp);

/* ===================== Shared state ===================== */
const LS_HISTORY = 'spt_history_v2';
const MAX_PHOTOS = 4;
const MAX_DIM = 1024;
const JPEG_QUALITY = 0.85;
const MAX_HISTORY = 12;

let photos = []; // {dataUrl, base64, mime}
let lastResult = null;
let lastCoverThumb = null;
let authMode = 'signin'; // 'signin' | 'signup'
let meCache = null; // last /api/me response

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ===================== Toast ===================== */
let toastTimer = null;
function toast(msg, type) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ' toast-' + type : '');
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3800);
}

function showScreen(name) {
  $('#authScreen').classList.toggle('hidden', name !== 'auth');
  $('#paywallScreen').classList.toggle('hidden', name !== 'paywall');
  $('#appScreen').classList.toggle('hidden', name !== 'app');
  $('#historyBtn').classList.toggle('hidden', name === 'auth');
  $('#accountBtn').classList.toggle('hidden', name === 'auth');
}

/* ===================== Auth screen ===================== */
function setAuthMode(mode) {
  authMode = mode;
  $('#tabSignIn').classList.toggle('active', mode === 'signin');
  $('#tabSignUp').classList.toggle('active', mode === 'signup');
  $('#authSubmitBtn').textContent = mode === 'signin' ? 'Sign in' : 'Create account';
  $('#forgotPasswordBtn').classList.toggle('hidden', mode !== 'signin');
  $('#authError').textContent = '';
}

function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Incorrect email or password.';
  if (code.includes('email-already-in-use')) return 'That email already has an account — try signing in instead.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('invalid-email')) return 'That email address looks invalid.';
  if (code.includes('too-many-requests')) return 'Too many attempts — please wait a moment and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}

function initAuthScreen() {
  $('#tabSignIn').addEventListener('click', () => setAuthMode('signin'));
  $('#tabSignUp').addEventListener('click', () => setAuthMode('signup'));

  $('#authSubmitBtn').addEventListener('click', async () => {
    const email = $('#authEmail').value.trim();
    const password = $('#authPassword').value;
    $('#authError').textContent = '';
    if (!email || !password) {
      $('#authError').textContent = 'Enter your email and password.';
      return;
    }
    const btn = $('#authSubmitBtn');
    btn.disabled = true;
    try {
      if (authMode === 'signin') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged picks up from here.
    } catch (err) {
      $('#authError').textContent = friendlyAuthError(err);
    } finally {
      btn.disabled = false;
    }
  });

  $('#forgotPasswordBtn').addEventListener('click', async () => {
    const email = $('#authEmail').value.trim();
    if (!email) {
      $('#authError').textContent = 'Enter your email above first, then tap this again.';
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast('Password reset email sent', 'success');
    } catch (err) {
      $('#authError').textContent = friendlyAuthError(err);
    }
  });
}

/* ===================== Backend calls ===================== */
async function authedFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in.');
  const token = await user.getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function fetchMe() {
  meCache = await authedFetch('/api/me');
  return meCache;
}

/* ===================== Paywall / account rendering ===================== */
function renderPaywall(me) {
  $('#planPriceValue').textContent = DISPLAY_PLAN_PRICE_INR;
  $('#planQuotaValue').textContent = DISPLAY_MONTHLY_QUOTA;
  $('#paywallNote').textContent =
    me.subscriptionStatus === 'pending' ? 'Your last payment attempt didn’t go through yet — try again below.' : '';
}

function renderUsage(me) {
  const used = me.usage?.used ?? 0;
  const quota = me.usage?.quota ?? DISPLAY_MONTHLY_QUOTA;
  const pct = Math.min(100, Math.round((used / quota) * 100));
  $('#usageText').textContent = `${used} / ${quota} used`;
  $('#usageBarFill').style.width = `${pct}%`;
}

function renderAccount(me) {
  $('#acctEmail').textContent = me.email || auth.currentUser?.email || '—';
  $('#acctPlan').textContent = me.active ? (me.cancelAtPeriodEnd ? 'Monthly (cancelling)' : 'Monthly — active') : 'No active plan';
  $('#acctRenews').textContent = me.currentPeriodEnd
    ? new Date(me.currentPeriodEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  $('#acctUsage').textContent = `${me.usage?.used ?? 0} / ${me.usage?.quota ?? DISPLAY_MONTHLY_QUOTA}`;
  $('#cancelSubBtn').classList.toggle('hidden', !me.active || me.cancelAtPeriodEnd);
}

async function refreshAccountStatus({ silent = false } = {}) {
  try {
    const me = await fetchMe();
    renderAccount(me);
    if (me.active) {
      renderUsage(me);
      showScreen('app');
      updateGenerateState();
    } else {
      renderPaywall(me);
      showScreen('paywall');
    }
    return me;
  } catch (err) {
    if (!silent) toast(err.message || 'Could not load your account.', 'error');
    throw err;
  }
}

/* ===================== Subscribe flow ===================== */
function initPaywall() {
  $('#subscribeBtn').addEventListener('click', async () => {
    const btn = $('#subscribeBtn');
    btn.disabled = true;
    btn.textContent = 'Starting checkout…';
    try {
      const { subscriptionId, keyId } = await authedFetch('/api/create-subscription', { method: 'POST', body: '{}' });

      const rzp = new Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: 'SnapList by Sahaay',
        description: 'Monthly AI listing subscription',
        theme: { color: '#C4798A' },
        handler: async () => {
          toast('Payment received — activating your account…', 'success');
          await waitForActivation();
        },
        modal: {
          ondismiss: () => {
            btn.disabled = false;
            btn.textContent = 'Subscribe now';
          },
        },
      });
      rzp.open();
    } catch (err) {
      toast(err.message || 'Could not start checkout.', 'error');
      btn.disabled = false;
      btn.textContent = 'Subscribe now';
    }
  });

  $('#paywallSignOutBtn').addEventListener('click', () => signOut(auth));
}

// The webhook usually lands within a second or two of a successful payment,
// but it's a separate async call from Razorpay to our server — so poll
// briefly rather than assuming it's already applied the instant Checkout closes.
async function waitForActivation() {
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const me = await refreshAccountStatus({ silent: true });
      if (me.active) return;
    } catch {
      /* keep polling */
    }
  }
  toast('Payment received — this can take a minute to reflect. Pull to refresh or reopen the app shortly.', 'success');
}

/* ===================== Account sheet ===================== */
function initAccountSheet() {
  $('#accountBtn').addEventListener('click', async () => {
    openSheet($('#accountOverlay'));
    try {
      const me = await fetchMe();
      renderAccount(me);
    } catch {
      /* keep whatever was last rendered */
    }
  });
  $('#closeAccountBtn').addEventListener('click', () => closeSheet($('#accountOverlay')));
  $('#signOutBtn').addEventListener('click', () => signOut(auth));

  $('#cancelSubBtn').addEventListener('click', async () => {
    if (!confirm('Cancel your subscription? You’ll keep access until the end of the current billing period.')) return;
    try {
      await authedFetch('/api/cancel-subscription', { method: 'POST', body: '{}' });
      toast('Subscription set to cancel at period end.', 'success');
      const me = await fetchMe();
      renderAccount(me);
    } catch (err) {
      toast(err.message || 'Could not cancel subscription.', 'error');
    }
  });
}

/* ===================== Photo handling (same as the free version) ===================== */
function fileToCompressedImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('That file does not look like an image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
          else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve({ dataUrl, base64: dataUrl.split(',')[1], mime: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoGrid() {
  const grid = $('#photoGrid');
  grid.querySelectorAll('.photo-thumb').forEach((n) => n.remove());
  photos.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'photo-thumb';
    div.innerHTML = `
      <img src="${p.dataUrl}" alt="Product photo ${i + 1}">
      <button class="remove-photo" data-idx="${i}" aria-label="Remove photo">✕</button>
      ${i === 0 ? '<span class="primary-tag">Main</span>' : ''}
    `;
    grid.insertBefore(div, $('#photoAddTile'));
  });
  $('#photoAddTile').classList.toggle('hidden', photos.length >= MAX_PHOTOS);
  grid.querySelectorAll('.remove-photo').forEach((btn) => {
    btn.addEventListener('click', () => {
      photos.splice(Number(btn.dataset.idx), 1);
      renderPhotoGrid();
    });
  });
  updateGenerateState();
}

function updateGenerateState() {
  const btn = $('#generateBtn');
  const sub = $('#generateSub');
  if (!meCache?.active) {
    btn.disabled = true;
    sub.textContent = 'Subscribe to start writing listings';
    return;
  }
  if (photos.length === 0) {
    btn.disabled = true;
    sub.textContent = 'Add at least one photo to continue';
  } else if ((meCache.usage?.used ?? 0) >= (meCache.usage?.quota ?? DISPLAY_MONTHLY_QUOTA)) {
    btn.disabled = true;
    sub.textContent = 'Monthly limit reached — resets on the 1st';
  } else {
    btn.disabled = false;
    sub.textContent = `${photos.length} photo${photos.length > 1 ? 's' : ''} ready`;
  }
}

function initPhotoInput() {
  $('#cameraInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) { toast(`You can add up to ${MAX_PHOTOS} photos.`); break; }
      try {
        photos.push(await fileToCompressedImage(file));
      } catch (err) {
        toast(err.message || 'Could not load that photo.', 'error');
      }
    }
    renderPhotoGrid();
  });
}

function initDetailsCollapse() {
  $('#detailsToggle').addEventListener('click', () => {
    $('#detailsBody').classList.toggle('collapsed');
    $('#detailsChevron').classList.toggle('open', !$('#detailsBody').classList.contains('collapsed'));
  });
}

/* ===================== Generate ===================== */
function currentFormFields() {
  return {
    productName: $('#productName').value.trim(),
    category: $('#category').value.trim(),
    platform: $('#platform').value,
    features: $('#features').value.trim(),
    tone: $('#tone').value,
    length: $('#length').value,
    useEmojis: $('#useEmojis').checked,
  };
}

async function generateListing() {
  if (photos.length === 0) { toast('Add a product photo first.', 'error'); return; }

  const btn = $('#generateBtn');
  btn.disabled = true;
  $('#loadingCard').classList.remove('hidden');
  $('#resultsSection').classList.add('hidden');
  const loadingMsgs = ['Looking closely at your photos…', 'Spotting materials, colors & style…', 'Writing a title that stands out…', 'Polishing the description…'];
  let mi = 0;
  const loadingInterval = setInterval(() => { mi = (mi + 1) % loadingMsgs.length; $('#loadingText').textContent = loadingMsgs[mi]; }, 1800);

  try {
    const body = JSON.stringify({ ...currentFormFields(), photos: photos.map((p) => ({ base64: p.base64, mime: p.mime })) });
    const data = await authedFetch('/api/generate', { method: 'POST', body });
    showResult(data.result);
    saveToHistory(data.result);
    if (data.usage && meCache) { meCache.usage = data.usage; renderUsage(meCache); }
    toast('Listing ready', 'success');
  } catch (err) {
    toast(err.message || 'Something went wrong while generating the listing.', 'error');
    if (String(err.message || '').toLowerCase().includes('subscription')) {
      await refreshAccountStatus({ silent: true }).catch(() => {});
    }
  } finally {
    clearInterval(loadingInterval);
    $('#loadingCard').classList.add('hidden');
    updateGenerateState();
  }
}

/* ===================== Rendering results ===================== */
function showResult(result) {
  lastResult = result;
  lastCoverThumb = photos[0]?.dataUrl || null;

  $('#resTitle').value = result.title;
  $('#resShort').value = result.shortDescription;
  $('#resLong').value = result.longDescription;

  const bulletsEl = $('#resBullets');
  bulletsEl.innerHTML = '';
  result.bullets.forEach((b) => {
    const li = document.createElement('li');
    li.contentEditable = 'true';
    li.innerHTML = `<span class="bullet-dot">✦</span><span>${escapeHtml(b)}</span>`;
    bulletsEl.appendChild(li);
  });

  const tagsEl = $('#resTags');
  tagsEl.innerHTML = '';
  result.tags.forEach((t) => {
    const span = document.createElement('span');
    span.className = 'tag-pill';
    span.textContent = t;
    tagsEl.appendChild(span);
  });

  $('#resCategoryHint').textContent = result.suggestedCategory ? `Suggested category: ${result.suggestedCategory}` : '';
  $('#resultsSection').classList.remove('hidden');
  $('.generate-bar').classList.add('hidden');
  $('#resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function currentEditedResult() {
  const bullets = $$('#resBullets li').map((li) => li.innerText.trim()).filter(Boolean);
  const tags = $$('#resTags .tag-pill').map((t) => t.textContent.trim()).filter(Boolean);
  return {
    title: $('#resTitle').value.trim(),
    shortDescription: $('#resShort').value.trim(),
    longDescription: $('#resLong').value.trim(),
    bullets, tags,
    suggestedCategory: lastResult?.suggestedCategory || '',
  };
}

function resultToText(r) {
  return [r.title, '', r.shortDescription, '', r.longDescription, '', 'Highlights:', ...r.bullets.map((b) => `• ${b}`), '', 'Tags: ' + r.tags.join(', ')].join('\n');
}

/* ===================== Copy / download ===================== */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'success');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied to clipboard', 'success'); }
    catch { toast('Could not copy automatically — please select and copy manually.', 'error'); }
    ta.remove();
  }
}

function initResultActions() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;
    if (copyBtn.dataset.copy) copyText($(copyBtn.dataset.copy).value);
    else if (copyBtn.dataset.copyList) copyText($$(`${copyBtn.dataset.copyList} li`).map((li) => '• ' + li.innerText.trim()).join('\n'));
    else if (copyBtn.dataset.copyTags) copyText($$(`${copyBtn.dataset.copyTags} .tag-pill`).map((t) => t.textContent.trim()).join(', '));
  });

  $('#copyAllBtn').addEventListener('click', () => copyText(resultToText(currentEditedResult())));

  $('#downloadBtn').addEventListener('click', () => {
    const r = currentEditedResult();
    const blob = new Blob([resultToText(r)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const safeName = (r.title || 'product-listing').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    a.download = `${safeName || 'product-listing'}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
    toast('Downloaded', 'success');
  });

  $('#regenerateBtn').addEventListener('click', generateListing);

  $('#startOverBtn').addEventListener('click', () => {
    photos = [];
    renderPhotoGrid();
    $('#resultsSection').classList.add('hidden');
    $('.generate-bar').classList.remove('hidden');
    $('#productName').value = '';
    $('#features').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===================== History (per-device, unchanged from free version) ===================== */
function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch { return []; }
}
function saveToHistory(result) {
  const history = getHistory();
  history.unshift({ id: Date.now(), date: new Date().toISOString(), thumb: lastCoverThumb, result });
  while (history.length > MAX_HISTORY) history.pop();
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(history)); } catch { /* storage full — skip */ }
}
function renderHistory() {
  const list = $('#historyList');
  const history = getHistory();
  list.innerHTML = '';
  if (history.length === 0) { list.innerHTML = '<p class="history-empty">No listings generated yet.</p>'; return; }
  history.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'history-item';
    const dateStr = new Date(item.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    btn.innerHTML = `
      ${item.thumb ? `<img src="${item.thumb}" alt="">` : '<div class="photo-add" style="width:48px;height:48px;border:none;"></div>'}
      <div class="hi-text"><div class="hi-title">${escapeHtml(item.result.title || 'Untitled listing')}</div><div class="hi-date">${dateStr}</div></div>
    `;
    btn.addEventListener('click', () => { showResult(item.result); lastCoverThumb = item.thumb; closeSheet($('#historyOverlay')); });
    list.appendChild(btn);
  });
}
function initHistory() {
  $('#historyBtn').addEventListener('click', () => { renderHistory(); openSheet($('#historyOverlay')); });
  $('#closeHistoryBtn').addEventListener('click', () => closeSheet($('#historyOverlay')));
  $('#clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Delete all saved listings from this device?')) { localStorage.removeItem(LS_HISTORY); renderHistory(); }
  });
}

/* ===================== Sheets ===================== */
function openSheet(overlay) { overlay.classList.remove('hidden'); }
function closeSheet(overlay) { overlay.classList.add('hidden'); }
function initSheetDismiss() {
  [$('#accountOverlay'), $('#historyOverlay')].forEach((overlay) => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(overlay); });
  });
}

/* ===================== Service worker ===================== */
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const hadControllerAtLoad = !!navigator.serviceWorker.controller;
  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtLoad || reloadedForUpdate) return;
    reloadedForUpdate = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => reg.update().catch(() => {})).catch(() => {});
}

/* ===================== Init ===================== */
function init() {
  clearTimeout(window.__snaplistLoadTimer);
  initAuthScreen();
  initPaywall();
  initAccountSheet();
  initPhotoInput();
  initDetailsCollapse();
  renderPhotoGrid();
  initResultActions();
  initHistory();
  initSheetDismiss();
  initServiceWorker();
  $('#generateBtn').addEventListener('click', generateListing);

  onAuthStateChanged(auth, async (user) => {
    if (!user) { meCache = null; showScreen('auth'); return; }
    try {
      await refreshAccountStatus();
    } catch {
      showScreen('paywall'); // safest default: don't show the paid tool if we couldn't confirm status
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
