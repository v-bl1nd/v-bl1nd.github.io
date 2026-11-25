const CACHE = 'budget-v3'; // Обновили версию кэша, чтобы сбросить старые данные

self.addEventListener('install', e => {
  self.skipWaiting(); // Активировать нового SW сразу
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            return caches.delete(key); // Удаляем старые кэши
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', e => {
  // Пропускаем запросы к базам данных (Supabase и Firebase) и API.
  // Они должны идти напрямую в сеть, без вмешательства Service Worker!
  if (
    e.request.url.includes('supabase') || 
    e.request.url.includes('firebase') || 
    e.request.url.includes('googleapis')
  ) {
    return; 
  }

  // Стратегия "Сначала сеть, потом кэш" для HTML.
  // Это гарантирует, что вы всегда увидите свежие обновления интерфейса.
  // (Добавлена безопасная проверка ?.includes, чтобы избежать ошибок)
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, resClone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Для остальных файлов (иконки, manifest.json) — "Сначала кэш, потом сеть"
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
