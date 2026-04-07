const CACHE_NAME = 'marche-nous-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'https://i.postimg.cc/Z0zj5WYL/logo.png'
];

// Installation du Service Worker et mise en cache des fichiers de base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Stratégie : Network First (on privilégie le réseau, sinon le cache)
// C'est idéal pour un site d'annonces qui change souvent
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});