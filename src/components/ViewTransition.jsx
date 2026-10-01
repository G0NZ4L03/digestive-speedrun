// ============================================================================
// COMPONENTE: ViewTransition
// ============================================================================

/**
 * Wrapper para transiciones suaves entre vistas.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los cambios de vista instantáneos pueden ser disorientadores
 * - Necesitamos feedback visual al navegar entre secciones
 * - Las transiciones suaves mejoran la percepción de calidad

 * DISEÑO:
 * - Fade in/out para transiciones
 * - Animación escalonada para elementos hijos
 * - Performance optimizado con CSS transforms

 * USO EN ESTE PROYECTO:
 * - App.jsx: Wrapper para cada vista (dashboard, history, settings)
 * - Proporciona transiciones consistentes en toda la app

 * @param {boolean} isActive - Si la vista está activa
 * @param {React.ReactNode} children - Contenido de la vista
 */
export function ViewTransition({ isActive, children }) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isActive
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'
      }`}
    >
      {children}
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Fade + slide: Combinación de opacidad y translate para efecto natural
 * - duration-300: 300ms es el sweet spot (no demasiado lento, no brusco)
 * - ease-in-out: Curva de aceleración suave
 * - pointer-events-none: Evita clicks en vistas inactivas
 * - absolute inset-0: Las vistas se superponen durante transición
 *
 * FUTURO: Mejoras posibles:
 * - Añadir diferentes tipos de transición (slide horizontal, scale)
 * - Añadir stagger delay para elementos hijos
 * - Considerar Framer Motion para transiciones más complejas
 * - Añadir gestures (swipe) para navegación móvil
 */