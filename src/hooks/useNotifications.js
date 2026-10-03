import { useState } from 'react';

// ============================================================================
// HOOK: useNotifications
// ============================================================================

/**
 * Hook personalizado para gestionar Web Notifications con soporte
 * para Service Worker (requerido en PWA móvil iOS/Android) y fallback
 * a la Notification API tradicional.
 *
 * @returns {Object} - { permission, requestPermission, showNotification }
 */
export function useNotifications() {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Pedir permiso al usuario (debe llamarse como respuesta a un toque/acción explícita del usuario)
  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (err) {
        console.error('Error solicitando permisos de notificación:', err);
        return 'denied';
      }
    }
    return 'denied';
  };

  // Mostrar notificación (ServiceWorkerRegistration con fallback a new Notification)
  const showNotification = async (title, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (permission !== 'granted' && Notification.permission !== 'granted') return;

    const baseUrl = import.meta.env.BASE_URL || '/';
    const notificationOptions = {
      icon: `${baseUrl}icon-192.png`,
      badge: `${baseUrl}icon-192.png`,
      ...options,
    };

    // 1. Intentar vía Service Worker (requerido para iOS PWA y Chrome Android)
    if ('serviceWorker' in navigator) {
      try {
        // Prevenir bloqueo indefinido si no hay SW registrado usando getRegistration y Promise.race con timeout de 2s
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
        const registration = await Promise.race([
          navigator.serviceWorker.getRegistration().then((reg) => reg || navigator.serviceWorker.ready),
          timeoutPromise,
        ]);

        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, notificationOptions);
          return;
        }
      } catch (swError) {
        console.warn('Fallo al mostrar notificación vía Service Worker, recurriendo a fallback:', swError);
      }
    }

    // 2. Fallback: new Notification (para entornos de escritorio tradicionales)
    try {
      new Notification(title, notificationOptions);
    } catch (fallbackError) {
      console.warn('No se pudo mostrar la notificación mediante constructor estándar:', fallbackError);
    }
  };

  return { permission, requestPermission, showNotification };
}

