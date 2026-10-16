// Offline-first: the app and its art are cached on install; fonts are cached the first time they load.
const V = 'kt-2f1c9f59fa', CORE = ["./", "./manifest.webmanifest", "./art/city-depart.webp", "./art/city-fuji.webp", "./art/city-kyoto.webp", "./art/city-nara.webp", "./art/city-nikko.webp", "./art/city-osaka.webp", "./art/city-tokyo.webp", "./art/dishes.webp", "./art/hero.webp", "./art/mascot.webp", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-32.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./itinerary/"];
// Cloudflare Pages redirects /index.html to /, and a redirected response can't answer a page load, so store clean copies
const clean = res => res.redirected ? res.blob().then(b => new Response(b, { status: 200, headers: res.headers })) : res;
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => fetch(u, { cache: 'reload' }).then(clean).then(r => c.put(u, r))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'kt-fonts').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return e.respondWith(caches.open('kt-fonts').then(c => c.match(r).then(hit => hit || fetch(r).then(res => { c.put(r, res.clone()); return res; }))));
  if (u.origin !== location.origin) return;
  // page loads: fresh copy if the network answers within 3 s, otherwise the saved one
  if (r.mode === 'navigate') return e.respondWith(Promise.race([fetch(r), new Promise((_, no) => setTimeout(no, 3000))]).then(res => { if (res.ok && !res.redirected) caches.open(V).then(c => c.put(u.pathname, res.clone())); return res; }).catch(() => caches.match(u.pathname).then(hit => hit || caches.match('./')).then(hit => hit || fetch(r))));
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r)));
});
