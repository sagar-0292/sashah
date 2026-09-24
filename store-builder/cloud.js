/* Sahaay Stores — cloud client.
 * Talks to the hosted platform (/api/*): sign-in, saving and publishing the
 * store, image uploads, AI copywriting and orders.
 *
 * Sign-in is invisible at first: owners get an anonymous Firebase account
 * the moment they launch, so there's no signup form. The dashboard then asks
 * them to "save access" with Google, which upgrades that same account.
 *
 *   SahaayCloud.init() → Promise<{ enabled, dev, ai }>
 */
(function (global) {
  'use strict';

  var cfg = global.SAHAAY_CONFIG || {};
  var FB = 'https://www.gstatic.com/firebasejs/10.12.0/';
  var info = { enabled: false, dev: false, ai: false };
  var fb = null;          // { auth, mod } once Firebase is loaded
  var listeners = [];
  var ready;

  function emit() { listeners.forEach(function (fn) { try { fn(currentUser()); } catch (e) { /* ignore */ } }); }

  function init() {
    if (ready) return ready;
    ready = fetch('/api/health', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (h) {
        if (!h || !h.ok) return info;
        info.dev = !!h.dev;
        info.ai = !!h.ai;
        if (info.dev) { info.enabled = true; return info; }
        if (!cfg.firebase) {
          console.warn('Sahaay Stores: the API is running but SAHAAY_CONFIG.firebase is not set in config.js.');
          return info;
        }
        return Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js')]).then(function (m) {
          var app = m[0].initializeApp(cfg.firebase);
          var auth = m[1].getAuth(app);
          fb = { auth: auth, mod: m[1] };
          info.enabled = true;
          return new Promise(function (resolve) {
            var first = true;
            m[1].onAuthStateChanged(auth, function () {
              emit();
              if (first) { first = false; resolve(info); }
            });
          });
        }).catch(function (e) {
          console.error('Sahaay Stores: could not load Firebase', e);
          return info;
        });
      });
    return ready;
  }

  // ---------- auth ----------
  function devUser() {
    try { return JSON.parse(localStorage.getItem('sahaay-dev-user')); } catch (e) { return null; }
  }
  function currentUser() {
    if (info.dev) {
      var u = devUser();
      return u ? { uid: u.uid, anonymous: !u.email, email: u.email || '' } : null;
    }
    if (!fb || !fb.auth.currentUser) return null;
    var cu = fb.auth.currentUser;
    return { uid: cu.uid, anonymous: cu.isAnonymous, email: cu.email || '' };
  }

  function ensureUser() {
    return init().then(function () {
      if (!info.enabled) throw new Error('Hosting is not available.');
      if (currentUser()) return currentUser();
      if (info.dev) {
        localStorage.setItem('sahaay-dev-user', JSON.stringify({ uid: 'u' + Math.random().toString(36).slice(2, 12) }));
        emit();
        return currentUser();
      }
      return fb.mod.signInAnonymously(fb.auth).then(function () { return currentUser(); });
    });
  }

  function token() {
    if (info.dev) { var u = devUser(); return Promise.resolve(u ? 'dev-' + u.uid : null); }
    return fb && fb.auth.currentUser ? fb.auth.currentUser.getIdToken() : Promise.resolve(null);
  }

  // Upgrades the current (anonymous) account to a Google account, keeping
  // the same user id — so the store stays attached.
  function saveAccessWithGoogle() {
    if (info.dev) {
      var u = devUser() || { uid: 'u' + Math.random().toString(36).slice(2, 12) };
      u.email = u.email || 'owner@example.com';
      localStorage.setItem('sahaay-dev-user', JSON.stringify(u));
      emit();
      return Promise.resolve(currentUser());
    }
    var provider = new fb.mod.GoogleAuthProvider();
    var cu = fb.auth.currentUser;
    var p = cu && cu.isAnonymous ? fb.mod.linkWithPopup(cu, provider) : fb.mod.signInWithPopup(fb.auth, provider);
    return p.then(function () { emit(); return currentUser(); }, function (e) {
      if (e && e.code === 'auth/credential-already-in-use') {
        var err = new Error('That Google account already has a store. Sign in with it from the home page instead.');
        err.code = e.code;
        throw err;
      }
      throw e;
    });
  }

  function signInWithGoogle() {
    return init().then(function () {
      if (info.dev) {
        // Dev: reuse this browser's test account.
        var u = devUser() || { uid: 'u' + Math.random().toString(36).slice(2, 12) };
        u.email = u.email || 'owner@example.com';
        localStorage.setItem('sahaay-dev-user', JSON.stringify(u));
        emit();
        return currentUser();
      }
      return fb.mod.signInWithPopup(fb.auth, new fb.mod.GoogleAuthProvider()).then(function () { emit(); return currentUser(); });
    });
  }

  function signOut() {
    if (info.dev) { localStorage.removeItem('sahaay-dev-user'); emit(); return Promise.resolve(); }
    return fb ? fb.mod.signOut(fb.auth).then(emit) : Promise.resolve();
  }

  // ---------- API ----------
  function api(method, path, body) {
    return token().then(function (t) {
      var headers = { 'Content-Type': 'application/json' };
      if (t) headers.Authorization = 'Bearer ' + t;
      return fetch(path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) {
          var e = new Error(j.error || 'Request failed (' + r.status + ')');
          e.status = r.status;
          throw e;
        }
        return j;
      });
    });
  }

  global.SahaayCloud = {
    init: init,
    info: function () { return info; },
    user: currentUser,
    onUser: function (fn) { listeners.push(fn); },
    ensureUser: ensureUser,
    saveAccessWithGoogle: saveAccessWithGoogle,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    loadMine: function () { return api('GET', '/api/stores?mine=1'); },
    saveStore: function (store) { return api('PUT', '/api/stores', { store: store }); },
    upload: function (dataUrl) { return api('POST', '/api/upload', { dataUrl: dataUrl }).then(function (j) { return j.url; }); },
    generate: function (input) { return api('POST', '/api/generate', input); },
    orders: function () { return api('GET', '/api/orders').then(function (j) { return j.orders || []; }); },
    updateOrder: function (id, status) { return api('PATCH', '/api/orders', { id: id, status: status }); },
    deleteOrder: function (id) { return api('DELETE', '/api/orders?id=' + encodeURIComponent(id)); }
  };
})(window);
