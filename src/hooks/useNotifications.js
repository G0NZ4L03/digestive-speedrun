import { useEffect, useState } from 'react';

// ============================================================================
// HOOK: useNotifications
// ============================================================================

/**
 * Hook personalizado para gestionar Web Push Notifications.
 *
 * PROBLEMA QUE RESUELVE:
 * - Las notificaciones web requieren permiso explícito del usuario
 * - El estado de permiso puede cambiar (granted, denied, default)
 * - Necesitamos una API sencilla para pedir permiso y mostrar notificaciones

 * FUNCIONAMIENTO:
 * 1. Al montar, verifica si el navegador soporta notificaciones
 * 2. Sincroniza el estado de permiso con React state
 * 3. Proporciona métodos para pedir permiso y mostrar notificaciones

 * ESTADOS DE PERMISO:
 * - default: Usuario aún no ha decidido (podemos pedir)
 * - granted: Usuario ha permitido notificaciones
 * - denied: Usuario ha bloqueado notificaciones (no podemos cambiar)

 * COMPATIBILIDAD:
 * - Verifica 'Notification' in window para navegadores que no lo soportan
 * - Graceful degradation: Si no soportado, devuelve 'denied'

 * @returns {Object} - { permission, requestPermission, showNotification }
 */
export function useNotifications() {
  const [permission, setPermission] = useState('default');

  // Detectar estado de permiso al montar
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Pedir permiso al usuario (solo funciona si está en 'default')
  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  // Mostrar notificación (solo si tenemos permiso)
  const showNotification = (title, options = {}) => {
    if ('Notification' in window && permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    }
  };

  return { permission, requestPermission, showNotification };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Abstracción: Esconde la complejidad de Web Notifications API
 * - Estado reactivo: Sincroniza permiso con UI
 * - Reutilizable: Puede usarse en cualquier componente que necesite notificaciones

 * USO EN ESTE PROYECTO:
 * - Timer de vaciado gástrico: Alerta cuando completan 45 min
 * - Guardado de log: Confirmación de guardado exitoso

 * FUTURO: Mejoras posibles:
 * - Añadir Service Worker para notificaciones push remotas
 * - Añadir acciones en notificaciones (botones interactivos)
 * - Añadir scheduling de notificaciones (recordatorios)
 * - Considerar Notification API más avanzada con Service Worker
 */
