// ============================================================================
// COMPONENTE: Toast
// ============================================================================

/**
 * Notificación visual temporal (toast) para feedback de acciones.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan feedback visual inmediato de sus acciones
 * - Las notificaciones push pueden tardar o estar bloqueadas
 * - Necesitamos confirmación visual de que una acción funcionó

 * DISEÑO:
 * - Se muestra en la parte superior de la pantalla
 * - Desaparece automáticamente después de 3 segundos
 * - Colores según tipo (verde para éxito, rojo para error)
 * - Animación de fade in/out

 * USO EN ESTE PROYECTO:
 * - App.jsx: Feedback para activar notificaciones, guardar registro, etc.
 * - Reemplaza o complementa a las notificaciones push

 * @param {string} message - Texto del mensaje
 * @param {string} type - Tipo de notificación ('success' | 'error')
 */
export function Toast({ message, type = 'success' }) {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-dark-success' : 'bg-dark-alert';

  return (
    <div className={`fixed top-4 left-4 right-4 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in-out`}>
      <p className="text-sm font-medium text-center">{message}</p>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Fixed positioning: Siempre visible en la parte superior
 * - Z-index 50: Por encima de todo el contenido
 * - Animación: fade-in-out para suavidad
 * - Center text: Para mejor legibilidad en móvil
 *
 * FUTURO: Mejoras posibles:
 * - Añadir botón para cerrar manualmente
 * - Añadir iconos según tipo
 * - Añadir stack de múltiples toasts
 * - Considerar swipe para dismiss
 */