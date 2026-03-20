// ============================================
// Service Worker | عامل الخدمة
// ============================================
const CACHE_NAME = 'podcast-v2';
const STATIC_ASSETS = ['/', '/index.html'];

// تثبيت | Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// تفعيل وتنظيف الكاش القديم | Activate & clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استراتيجية الشبكة أولاً مع fallback للكاش | Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات API | Skip API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('/rss/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تخزين نسخة في الكاش | Cache a copy
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});
