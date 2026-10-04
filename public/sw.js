// ============================================================================
// SERVICE WORKER - DIGESTIVE SPEEDRUN TRACKER
// ============================================================================

/**
 * El Service Worker habilita funcionalidad offline y soporte PWA completo.
 * Corre en un hilo separado del navegador e intercepta peticiones de red.
 *
 * ESTRATEGIAS DE CACHÉ:
 * 1. Navegación (HTML): Network-First con fallback a caché.
 *    - Garantiza recibir la última versión desplegada de la app si hay conexión.
 *    - Si no hay conexión (offline), sirve la SPA desde la caché local.
 * 2. Recursos estáticos (JS, CSS, iconos, fuentes): Cache-First con Network Fallback.
 *    - Los bundles compilados por Vite tienen hashes únicos en su nombre.
 *    - Cachea dinámicamente assets nuevos encontrados en runtime.
 * 3. Ciclo de vida:
 *    - install: Pre-cachea recursos críticos de arranque y activa skipWaiting.
 *    - activate: Purga automáticamente versiones obsoletas de caché y reclama clientes (clients.claim).
 */

const CACHE_NAME = 'digestive-sr-v2';

// Recursos esenciales pre-cacheados durante la instalación
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './favicon.svg',
];

// Evento install: Pre-cachea recursos base y activa inmediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Evento activate: Purga cachés antiguas y reclama clientes activos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Evento fetch: Estrategia adaptativa según el tipo de petición
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo interceptamos peticiones GET con protocolo http/https
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Peticiones de navegación (cargar la app o recargar página)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback offline para navegación SPA
          return caches.match('./').then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // 2. Recursos estáticos (JS, CSS, imágenes): Cache-first con caché dinámico
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});

