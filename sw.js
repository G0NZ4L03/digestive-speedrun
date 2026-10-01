// ============================================================================
// SERVICE WORKER - DIGESTIVE SPEEDRUN TRACKER
// ============================================================================

/**
 * El Service Worker habilita funcionalidad offline de la PWA.
 * Corre en un thread separado del navegador y puede interceptar requests.
 *
 * ESTRATEGIA DE CACHE:
 * - Cache-First: Sirve desde cache si existe, si no, hace fetch y cachea
 * - CACHE_NAME: Versión del cache (importante para invalidar cache antiguo)
 * - urlsToCache: Lista de URLs para pre-cache en instalación
 *
 * CICLO DE VIDA DEL SERVICE WORKER:
 * 1. install: Se activa cuando se registra. Aquí pre-cacheamos recursos críticos.
 * 2. fetch: Intercepta todas las requests de red. Aquí implementamos cache-first.
 * 3. activate: (no implementado aún) Se usa para limpiar cache antiguo.
 *
 * NOTA: Esta es una implementación básica. Para producción:
 * - Considerar стратегии más sofisticadas (stale-while-revalidate)
 * - Implementar limpieza de cache antiguo en activate
 * - Añadir precaching de assets estáticos (CSS, JS, imágenes)
 */

const CACHE_NAME = 'digestive-sr-v1';
const urlsToCache = ['/'];

// Evento install: Pre-cachea recursos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Evento fetch: Intercepta requests y implementa cache-first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

/*
 * RAZÓN DE ESTA ESTRATEGIA:
 * - Simplicidad: Cache-first es fácil de entender y mantener
 * - Performance: Respuesta inmediata desde cache si está disponible
 * - Offline: Funciona completamente sin conexión para recursos cacheados
 *
 * FUTURO: Mejoras a considerar:
 * - Precaching de assets estáticos (CSS, JS bundles)
 * - Stale-while-revalidate para contenido dinámico
 * - Network-first para actualizaciones en tiempo real
 * - Cache size limit y LRU eviction
 */
