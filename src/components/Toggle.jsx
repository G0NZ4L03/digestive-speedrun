import { Check, X } from 'lucide-react';

// ============================================================================
// COMPONENTE: Toggle
// ============================================================================

/**
 * Componente de interruptor booleano (SÍ/NO) optimizado para móvil.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los checkboxes nativos son pequeños y difíciles de pulsar con una mano
 * - Necesitamos feedback visual claro del estado (activado/desactivado)
 * - Los inputs de texto son demasiado lentos para registro rápido

 * DISEÑO:
 * - Botón grande (toda la tarjeta es clickable)
 * - Feedback visual inmediato con colores (verde = activado, gris = desactivado)
 * - Iconos de Check/X para accesibilidad visual
 * - Animación de escala al pulsar (feedback táctil)

 * USO EN ESTE PROYECTO:
 * - Módulo de Adherencia: Arroz recién hecho, proteína blanda, etc.
 * - Registro rápido de reglas innegociables del protocolo

 * @param {string} label - Texto principal del toggle
 * @param {boolean} value - Estado actual (true/false)
 * @param {function} onChange - Callback cuando cambia el estado
 * @param {string} description - Texto explicativo secundario (opcional)
 */
export function Toggle({ label, value, onChange, description }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-4 bg-dark-surface rounded-xl touch-manipulation active:scale-[0.98] transition-transform"
    >
      {/* Sección izquierda: etiqueta y descripción */}
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-100">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Sección derecha: indicador visual del estado */}
      <div
        className={`w-12 h-7 rounded-full flex items-center justify-center transition-colors ${
          value ? 'bg-dark-success' : 'bg-gray-700'
        }`}
      >
        {value ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <X className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - touch-manipulation: Previene zoom accidental al doble tap
 * - active:scale-[0.98]: Feedback táctil al pulsar
 * - transition-colors: Animación suave entre estados
 * - bg-dark-surface: Contraste con fondo (#121212 vs #1E1E1E)
 *
 * FUTURO: Mejoras posibles:
 * - Añadir haptic feedback (vibración) en móviles que lo soporten
 * - Añadir sonido de confirmación (opcional)
 * - Añadir aria-label para accesibilidad screen readers
 * - Considerar swipe gesture para toggles rápidos
 */
