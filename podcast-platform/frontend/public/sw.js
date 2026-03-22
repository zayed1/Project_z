// ============================================
// Service Worker | عامل الخدمة
// مع دعم التحميل للاستماع بدون انترنت
// ============================================
const CACHE_NAME = 'podcast-v3';
const AUDIO_CACHE = 'podcast-audio-v1';
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
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== AUDIO_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استراتيجية الشبكة أولاً مع fallback للكاش | Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // تجاهل طلبات API | Skip API requests
  if (url.includes('/api/') || url.includes('/rss/')) {
    return;
  }

  // ملفات الصوت: كاش أولاً | Audio files: cache-first
  if (url.includes('.mp3') || url.includes('.m4a') || url.includes('.ogg') || url.includes('.wav') || url.includes('podcast-audio')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => new Response('', { status: 503 }));
        })
      )
    );
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

// رسائل من التطبيق | Messages from app
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_AUDIO') {
    const audioUrl = event.data.url;
    caches.open(AUDIO_CACHE).then((cache) => {
      cache.match(audioUrl).then((existing) => {
        if (!existing) {
          fetch(audioUrl).then((response) => {
            if (response.ok) {
              cache.put(audioUrl, response);
              self.clients.matchAll().then((clients) => {
                clients.forEach((client) => client.postMessage({ type: 'AUDIO_CACHED', url: audioUrl }));
              });
            }
          });
        }
      });
    });
  }

  if (event.data.type === 'REMOVE_CACHED_AUDIO') {
    caches.open(AUDIO_CACHE).then((cache) => cache.delete(event.data.url));
  }

  if (event.data.type === 'GET_CACHED_AUDIOS') {
    caches.open(AUDIO_CACHE).then((cache) => {
      cache.keys().then((keys) => {
        const urls = keys.map((k) => k.url);
        event.source.postMessage({ type: 'CACHED_AUDIOS_LIST', urls });
      });
    });
  }
});
