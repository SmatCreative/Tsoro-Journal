// Tsoro Journal service worker: network-first app shell with an offline fallback
const CACHE = 'tsoro-v3';
const PRECACHE = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(r => { clearTimeout(t); resolve(r); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Data, fonts and CDN scripts go straight to the network; only our own files are cached
  if (url.origin !== self.location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    withTimeout(fetch(req), isPage ? 6000 : 15000)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(isPage ? '/' : req, copy)); }
        return res;
      })
      .catch(() => caches.match(isPage ? '/' : req).then(hit => hit || fetch(req)))
  );
});
