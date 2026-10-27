const CACHE_VERSION = 'm2d-v3';
const APP_SHELL = ['index.html','manifest.json','css/app.css','css/tokens.css'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(APP_SHELL)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.includes('/models/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
      return res;
    })));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
