const CACHE_NAME = 'kutuphanem-shell-v5';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];
// Vite yapılandırması derleme sonunda bütün uygulama dosyalarını buraya ekler.
const BUILD_ASSETS = ["/assets/index-COU5GUv2.css","/assets/index-D6Afhv7v.js","/assets/local-store-DrPO2s5P.js","/assets/logo.png","/assets/nav-settings.png","/assets/nav-shelf.png","/assets/nav-stats.png","/gizlilik.html","/hesap-silme.html","/manifest.webmanifest"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([...APP_SHELL, ...BUILD_ASSETS])));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('kutuphanem-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('/index.html', response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || Response.error()));
    return;
  }

  // Derleme dosyaları kurulumda önbelleğe alınır; çalışma sırasında yeni sürüm dosyaları da saklanır.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/')) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    })));
  }
});
