'use strict';

/* =========================================================================
   SnapList by Sahaay — AI product photo → listing description writer
   All state lives in localStorage on this device. The only network calls
   are direct, from this device to whichever AI provider the user picked,
   using the API key the user pasted in. Nothing is ever sent to a server
   we control.
   ========================================================================= */

const LS = {
  provider: 'spt_provider',
  apiKey: 'spt_apiKey',
  geminiModel: 'spt_geminiModel',
  openrouterModel: 'spt_openrouterModel',
  seenIntro: 'spt_seenIntro',
  history: 'spt_history',
};

const MAX_PHOTOS = 4;
const MAX_DIM = 1024;
const JPEG_QUALITY = 0.85;
const MAX_HISTORY = 12;

/** @type {{dataUrl:string, base64:string, mime:string}[]} */
let photos = [];
let lastResult = null; // parsed listing object currently shown
let lastCoverThumb = null; // small dataURL used for history thumbnails

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

/* ===================== Settings storage ===================== */
// Model IDs providers have retired since this app shipped. Anyone with one of
// these saved from before gets bumped to the current default automatically,
// instead of hitting a confusing "model no longer available" error forever.
const RETIRED_GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
const RETIRED_OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen2.5-vl-32b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];
const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';

function getSettings() {
  let geminiModel = localStorage.getItem(LS.geminiModel) || DEFAULT_GEMINI_MODEL;
  let openrouterModel = localStorage.getItem(LS.openrouterModel) || DEFAULT_OPENROUTER_MODEL;
  if (RETIRED_GEMINI_MODELS.includes(geminiModel)) geminiModel = DEFAULT_GEMINI_MODEL;
  if (RETIRED_OPENROUTER_MODELS.includes(openrouterModel)) openrouterModel = DEFAULT_OPENROUTER_MODEL;
  return {
    provider: localStorage.getItem(LS.provider) || 'gemini',
    apiKey: localStorage.getItem(LS.apiKey) || '',
    geminiModel,
    openrouterModel,
  };
}
function hasKey() {
  return !!getSettings().apiKey.trim();
}

// The free, no-signup AI proxy (see sahaay/api/free-generate.js). Configured
// via window.FREE_API_BASE in index.html; left as the placeholder, the app
// falls back to requiring visitors to bring their own key, exactly as before.
function freeApiConfigured() {
  const base = window.FREE_API_BASE || '';
  return !!base && !base.includes('REPLACE_ME');
}
// Can the user generate right now, one way or another?
function canGenerate() {
  return hasKey() || freeApiConfigured();
}

/* ===================== Intro / first run ===================== */
function initIntro() {
  const seen = localStorage.getItem(LS.seenIntro) === '1';
  if (seen) $('#introCard').classList.add('hidden');

  $('#introSetupBtn').addEventListener('click', () => {
    localStorage.setItem(LS.seenIntro, '1');
    $('#introCard').classList.add('hidden');
    openSettings();
  });
  $('#introDismiss').addEventListener('click', () => {
    localStorage.setItem(LS.seenIntro, '1');
    $('#introCard').classList.add('hidden');
  });
}

function refreshKeyBanner() {
  $('#noKeyBanner').classList.toggle('hidden', canGenerate());
}

/* ===================== Photo handling ===================== */
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
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
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
      updateGenerateState();
    });
  });

  updateGenerateState();
}

function updateGenerateState() {
  const btn = $('#generateBtn');
  const sub = $('#generateSub');
  if (photos.length === 0) {
    btn.disabled = true;
    sub.textContent = 'Add at least one photo to continue';
  } else if (!canGenerate()) {
    btn.disabled = true;
    sub.textContent = 'Add your free AI key in Settings to continue';
  } else {
    btn.disabled = false;
    const usingFreeTier = !hasKey() && freeApiConfigured();
    sub.textContent = usingFreeTier
      ? `${photos.length} photo${photos.length > 1 ? 's' : ''} ready · using shared free AI`
      : `${photos.length} photo${photos.length > 1 ? 's' : ''} ready`;
  }
  refreshKeyBanner();
}

function initPhotoInput() {
  $('#cameraInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) {
        toast(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      try {
        const img = await fileToCompressedImage(file);
        photos.push(img);
      } catch (err) {
        toast(err.message || 'Could not load that photo.', 'error');
      }
    }
    renderPhotoGrid();
  });
}

/* ===================== Details panel collapse ===================== */
function initDetailsCollapse() {
  $('#detailsToggle').addEventListener('click', () => {
    $('#detailsBody').classList.toggle('collapsed');
    $('#detailsChevron').classList.toggle('open', !$('#detailsBody').classList.contains('collapsed'));
  });
  $('#detailsChevron').classList.add('open');
}

/* ===================== Prompt building ===================== */
function buildPrompt() {
  const productName = $('#productName').value.trim();
  const category = $('#category').value.trim();
  const platform = $('#platform').value;
  const features = $('#features').value.trim();
  const tone = $('#tone').value;
  const length = $('#length').value;
  const useEmojis = $('#useEmojis').checked;

  const lines = [];
  lines.push(
    'You are an expert e-commerce copywriter. Look carefully at the attached product photo(s) and write a ready-to-publish online listing for the item shown.'
  );
  lines.push(
    'Base what you can see (shape, material, color, style, condition, notable features) on the photos. Use any extra facts given below as ground truth. Never invent brand names, certifications, materials, prices, or claims that are not visible in the photo or given below — if unsure, describe generally instead of guessing.'
  );
  lines.push(`Where this will be sold: ${platform}.`);
  lines.push(`Tone of voice: ${tone}.`);
  lines.push(`Length: ${length}.`);
  lines.push(`Emojis: ${useEmojis ? 'use a few tasteful emojis' : 'do not use any emojis'}.`);
  if (productName) lines.push(`Product name / brand provided by seller: ${productName}.`);
  if (category) lines.push(`Category provided by seller: ${category}.`);
  if (features) lines.push(`Extra details provided by seller (treat as accurate): ${features}`);

  lines.push('');
  lines.push('Respond with ONLY a single valid JSON object (no markdown fences, no commentary) with exactly these keys:');
  lines.push(`{
  "title": "short SEO-friendly product title, under 90 characters",
  "shortDescription": "1-2 sentence hook/summary, great for a search result or social caption",
  "longDescription": "2-4 short paragraphs, persuasive and descriptive, suitable as the main listing body",
  "bullets": ["5-6 short feature/benefit bullet points, each under 15 words"],
  "tags": ["8-12 relevant keyword tags a buyer might search, lowercase, no # symbol"],
  "suggestedCategory": "one best-fit product category"
}`);
  return lines.join('\n');
}

/* ===================== JSON extraction ===================== */
function extractJson(text) {
  if (!text) throw new Error('empty response');
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Could not parse the AI response as JSON');
  }
}

function normalizeResult(raw) {
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean).map(String) : []);
  return {
    title: String(raw.title || raw.productTitle || '').trim(),
    shortDescription: String(raw.shortDescription || raw.summary || '').trim(),
    longDescription: String(raw.longDescription || raw.description || '').trim(),
    bullets: arr(raw.bullets || raw.highlights || raw.features),
    tags: arr(raw.tags || raw.keywords),
    suggestedCategory: String(raw.suggestedCategory || raw.category || '').trim(),
  };
}

/* ===================== Provider calls ===================== */
async function callGemini(prompt, settings) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.geminiModel}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
  const parts = [{ text: prompt }];
  photos.forEach((p) => parts.push({ inline_data: { mime_type: p.mime, data: p.base64 } }));

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(providerErrorMessage(res.status, data?.error?.message));
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(blockReason ? `Gemini blocked this request (${blockReason}). Try a different photo.` : 'Gemini returned an empty response. Please try again.');
  }
  return text;
}

async function callOpenRouter(prompt, settings, withJsonMode = true) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const content = [{ type: 'text', text: prompt }];
  photos.forEach((p) => content.push({ type: 'image_url', image_url: { url: `data:${p.mime};base64,${p.base64}` } }));

  const body = {
    model: settings.openrouterModel,
    messages: [{ role: 'user', content }],
    temperature: 0.7,
  };
  if (withJsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
      'HTTP-Referer': location.origin,
      'X-Title': 'SnapList by Sahaay',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Some free models reject response_format — retry once without it.
    if (withJsonMode && (res.status === 400 || res.status === 422)) {
      return callOpenRouter(prompt, settings, false);
    }
    throw new Error(providerErrorMessage(res.status, data?.error?.message));
  }
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('The AI returned an empty response. Please try again.');
  return text;
}

function providerErrorMessage(status, apiMsg) {
  if (status === 401 || status === 403) return 'Your API key was rejected. Double-check it in Settings.';
  if (status === 429) return 'Rate limit reached for the free tier. Wait a minute and try again, or switch provider in Settings.';
  if (status >= 500) return 'The AI provider is having issues right now. Please try again shortly.';
  return apiMsg ? `AI provider error: ${apiMsg}` : `AI provider error (${status}).`;
}

// The no-signup free path: form fields go to our own server (sahaay's
// free-generate endpoint), which holds the AI key and forwards the request —
// the key itself never reaches this page. Rate-limited per visitor server-side.
function freeProxyFields() {
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

async function callFreeProxy() {
  const url = `${window.FREE_API_BASE}/api/free-generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...freeProxyFields(),
      photos: photos.map((p) => ({ base64: p.base64, mime: p.mime })),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `The free AI service is having issues right now (${res.status}). Please try again, or add your own free key in Settings.`);
  }
  return data.result;
}

async function generateListing() {
  if (!canGenerate()) {
    toast('Add your free AI API key in Settings first.', 'error');
    openSettings();
    return;
  }
  if (photos.length === 0) {
    toast('Add a product photo first.', 'error');
    return;
  }

  const btn = $('#generateBtn');
  btn.disabled = true;
  $('#outputPlaceholder').classList.add('hidden');
  $('#loadingCard').classList.remove('hidden');
  $('#resultsSection').classList.add('hidden');
  const loadingMsgs = ['Looking closely at your photos…', 'Spotting materials, colors & style…', 'Writing a title that stands out…', 'Polishing the description…'];
  let mi = 0;
  const loadingInterval = setInterval(() => {
    mi = (mi + 1) % loadingMsgs.length;
    $('#loadingText').textContent = loadingMsgs[mi];
  }, 1800);

  try {
    let parsed;
    if (hasKey()) {
      const settings = getSettings();
      const prompt = buildPrompt();
      const rawText = settings.provider === 'openrouter' ? await callOpenRouter(prompt, settings) : await callGemini(prompt, settings);
      parsed = normalizeResult(extractJson(rawText));
    } else {
      parsed = await callFreeProxy();
    }
    showResult(parsed);
    saveToHistory(parsed);
    toast('Listing ready', 'success');
  } catch (err) {
    console.error(err);
    toast(err.message || 'Something went wrong while generating the listing.', 'error');
  } finally {
    clearInterval(loadingInterval);
    $('#loadingCard').classList.add('hidden');
    btn.disabled = false;
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
  initAds(); // only meaningful now the ad slot is actually visible; no-ops after the first call
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
    bullets,
    tags,
    suggestedCategory: lastResult?.suggestedCategory || '',
  };
}

function resultToText(r) {
  return [
    r.title,
    '',
    r.shortDescription,
    '',
    r.longDescription,
    '',
    'Highlights:',
    ...r.bullets.map((b) => `• ${b}`),
    '',
    'Tags: ' + r.tags.join(', '),
  ].join('\n');
}

/* ===================== Copy / download ===================== */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'success');
  } catch (_) {
    // Fallback for older mobile browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('Copied to clipboard', 'success');
    } catch {
      toast('Could not copy automatically — please select and copy manually.', 'error');
    }
    ta.remove();
  }
}

function initResultActions() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;
    if (copyBtn.dataset.copy) {
      copyText($(copyBtn.dataset.copy).value);
    } else if (copyBtn.dataset.copyList) {
      const items = $$(`${copyBtn.dataset.copyList} li`).map((li) => '• ' + li.innerText.trim());
      copyText(items.join('\n'));
    } else if (copyBtn.dataset.copyTags) {
      const tags = $$(`${copyBtn.dataset.copyTags} .tag-pill`).map((t) => t.textContent.trim());
      copyText(tags.join(', '));
    }
  });

  $('#copyAllBtn').addEventListener('click', () => copyText(resultToText(currentEditedResult())));

  $('#downloadBtn').addEventListener('click', () => {
    const r = currentEditedResult();
    const blob = new Blob([resultToText(r)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const safeName = (r.title || 'product-listing').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    a.download = `${safeName || 'product-listing'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    toast('Downloaded', 'success');
  });

  $('#regenerateBtn').addEventListener('click', generateListing);

  $('#startOverBtn').addEventListener('click', () => {
    photos = [];
    renderPhotoGrid();
    $('#resultsSection').classList.add('hidden');
    $('#outputPlaceholder').classList.remove('hidden');
    $('.generate-bar').classList.remove('hidden');
    $('#productName').value = '';
    $('#features').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===================== History ===================== */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS.history) || '[]');
  } catch {
    return [];
  }
}
function saveToHistory(result) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    date: new Date().toISOString(),
    thumb: lastCoverThumb,
    result,
  });
  while (history.length > MAX_HISTORY) history.pop();
  try {
    localStorage.setItem(LS.history, JSON.stringify(history));
  } catch {
    /* storage full — silently skip history */
  }
}
function renderHistory() {
  const list = $('#historyList');
  const history = getHistory();
  list.innerHTML = '';
  if (history.length === 0) {
    list.innerHTML = '<p class="history-empty">No listings generated yet.</p>';
    return;
  }
  history.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'history-item';
    const dateStr = new Date(item.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    btn.innerHTML = `
      ${item.thumb ? `<img src="${item.thumb}" alt="">` : '<div class="photo-add" style="width:48px;height:48px;border:none;"></div>'}
      <div class="hi-text">
        <div class="hi-title">${escapeHtml(item.result.title || 'Untitled listing')}</div>
        <div class="hi-date">${dateStr}</div>
      </div>
    `;
    btn.addEventListener('click', () => {
      showResult(item.result);
      lastCoverThumb = item.thumb;
      closeSheet($('#historyOverlay'));
    });
    list.appendChild(btn);
  });
}
function initHistory() {
  $('#historyBtn').addEventListener('click', () => {
    renderHistory();
    openSheet($('#historyOverlay'));
  });
  $('#closeHistoryBtn').addEventListener('click', () => closeSheet($('#historyOverlay')));
  $('#clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Delete all saved listings from this device?')) {
      localStorage.removeItem(LS.history);
      renderHistory();
    }
  });
}

/* ===================== Sheets (modals) ===================== */
function openSheet(overlay) {
  overlay.classList.remove('hidden');
}
function closeSheet(overlay) {
  overlay.classList.add('hidden');
}
function initSheetDismiss() {
  [$('#settingsOverlay'), $('#historyOverlay')].forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSheet(overlay);
    });
  });
}

/* ===================== Settings sheet ===================== */
const GET_KEY_HTML = {
  gemini: `
    <strong>Get a free Gemini API key (no credit card):</strong>
    <ol>
      <li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a></li>
      <li>Sign in with any Google account</li>
      <li>Tap <em>"Create API key"</em> and copy it</li>
      <li>Paste it above and tap Save</li>
    </ol>`,
  openrouter: `
    <strong>Get a free OpenRouter API key (no credit card):</strong>
    <ol>
      <li>Open <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a></li>
      <li>Sign in and tap <em>"Create Key"</em></li>
      <li>Copy the key and paste it above</li>
      <li>Keep the model set to one ending in <code>:free</code></li>
    </ol>`,
};

function refreshProviderUI() {
  const provider = $('#provider').value;
  $('#geminiModelField').classList.toggle('hidden', provider !== 'gemini');
  $('#openrouterModelField').classList.toggle('hidden', provider !== 'openrouter');
  $('#getKeyBox').innerHTML = GET_KEY_HTML[provider];
}

function openSettings() {
  const s = getSettings();
  $('#provider').value = s.provider;
  $('#geminiModel').value = s.geminiModel;
  $('#openrouterModel').value = s.openrouterModel;
  $('#apiKey').value = s.apiKey;
  refreshProviderUI();
  openSheet($('#settingsOverlay'));
}

function initSettings() {
  $('#settingsBtn').addEventListener('click', openSettings);
  $('#noKeyBannerBtn').addEventListener('click', openSettings);
  $('#closeSettingsBtn').addEventListener('click', () => closeSheet($('#settingsOverlay')));
  $('#provider').addEventListener('change', refreshProviderUI);

  $('#toggleKeyVisibility').addEventListener('click', () => {
    const input = $('#apiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  $('#saveKeyBtn').addEventListener('click', () => {
    localStorage.setItem(LS.provider, $('#provider').value);
    localStorage.setItem(LS.geminiModel, $('#geminiModel').value);
    localStorage.setItem(LS.openrouterModel, $('#openrouterModel').value);
    localStorage.setItem(LS.apiKey, $('#apiKey').value.trim());
    updateGenerateState();
    closeSheet($('#settingsOverlay'));
    toast('Settings saved', 'success');
  });

  $('#clearKeyBtn').addEventListener('click', () => {
    if (confirm('Remove your saved API key from this device?')) {
      localStorage.removeItem(LS.apiKey);
      $('#apiKey').value = '';
      updateGenerateState();
      toast('API key removed');
    }
  });

  $('#testKeyBtn').addEventListener('click', async () => {
    const provider = $('#provider').value;
    const apiKey = $('#apiKey').value.trim();
    if (!apiKey) {
      toast('Paste a key first.', 'error');
      return;
    }
    const testBtn = $('#testKeyBtn');
    testBtn.disabled = true;
    testBtn.textContent = 'Testing…';
    try {
      const settings = {
        provider,
        apiKey,
        geminiModel: $('#geminiModel').value,
        openrouterModel: $('#openrouterModel').value,
      };
      const savedPhotos = photos;
      photos = []; // text-only ping, keep it cheap
      const prompt = 'Reply with only this exact JSON: {"ok": true}';
      if (provider === 'openrouter') await callOpenRouter(prompt, settings);
      else await callGemini(prompt, settings);
      photos = savedPhotos;
      toast('Connection works!', 'success');
    } catch (err) {
      toast(err.message || 'Could not connect with that key.', 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test connection';
    }
  });
}

/* ===================== Service worker ===================== */
function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  // Only a genuine update (this page load was already controlled by a
  // service worker, and it just got replaced) should force a reload. A
  // first-ever install has no old JS to be stuck on, so skip it there.
  const hadControllerAtLoad = !!navigator.serviceWorker.controller;
  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerAtLoad || reloadedForUpdate) return;
    reloadedForUpdate = true;
    window.location.reload();
  });

  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.update().catch(() => {});
  }).catch(() => {});
}

/* ===================== Ads (Google AdSense) ===================== */
// Configure window.ADSENSE_CLIENT_ID / ADSENSE_SLOT_ID in index.html once
// you're approved — see README.md. Left unconfigured, this does nothing:
// no script load, no ad box, no console noise.
let adsInitialized = false;
function initAds() {
  if (adsInitialized) return; // AdSense doesn't support pushing twice into the same <ins>
  const clientId = window.ADSENSE_CLIENT_ID || '';
  const slotId = window.ADSENSE_SLOT_ID || '';
  const configured = clientId && slotId && !clientId.includes('REPLACE_ME') && !slotId.includes('REPLACE_ME');
  if (!configured) return;
  adsInitialized = true;

  const ins = document.getElementById('adSlot');
  ins.setAttribute('data-ad-client', clientId);
  ins.setAttribute('data-ad-slot', slotId);
  document.getElementById('adSlotWrap').classList.remove('hidden');

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense render failed:', err);
    }
  };
  script.onerror = () => console.error('AdSense script failed to load.');
  document.head.appendChild(script);
}

/* ===================== Init ===================== */
function init() {
  initIntro();
  initPhotoInput();
  initDetailsCollapse();
  renderPhotoGrid();
  initResultActions();
  initHistory();
  initSheetDismiss();
  initSettings();
  initServiceWorker();

  $('#generateBtn').addEventListener('click', generateListing);
  refreshKeyBanner();
  updateGenerateState();
}

document.addEventListener('DOMContentLoaded', init);
