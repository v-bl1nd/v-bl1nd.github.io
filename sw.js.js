const CACHE = 'budget-v1';
const ASSETS = ['/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // Пропускаем запросы к Firebase и другие внешние API
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis')) return;
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});