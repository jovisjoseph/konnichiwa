// Offline-first: the app and its art are cached on install; fonts are cached the first time they load.
const V = '__VERSION__', CORE = __FILES__;
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'kt-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return e.respondWith(caches.open('kt-fonts').then(c => c.match(r).then(hit => hit || fetch(r).then(res => { c.put(r, res.clone()); return res; }))));
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') return e.respondWith(caches.match('./index.html').then(hit => hit || fetch(r)));
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r)));
});
