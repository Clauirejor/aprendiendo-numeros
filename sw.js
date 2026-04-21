const CACHE_NAME = 'numeros-pwa-v1';
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalación: guardar todos los archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: responder desde caché primero, luego red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(respuestaCacheada => {
      if (respuestaCacheada) {
        return respuestaCacheada;
      }
      return fetch(event.request).then(respuestaRed => {
        // Guardar nuevas respuestas en caché (solo mismo origen)
        if (
          respuestaRed &&
          respuestaRed.status === 200 &&
          respuestaRed.type === 'basic'
        ) {
          const copia = respuestaRed.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });
        }
        return respuestaRed;
      }).catch(() => {
        // Sin conexión y sin caché: devolver index.html como fallback
        return caches.match('./index.html');
      });
    })
  );
});
