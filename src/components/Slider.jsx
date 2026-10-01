// ============================================================================
// COMPONENTE: Slider
// ============================================================================

/**
 * Componente de deslizador numérico para escalas de intensidad.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los inputs numéricos son tediosos (teclado se abre/cierra)
 * - Necesitamos escalas de intensidad rápida (0-10)
 * - Feedback visual del nivel es importante para síntomas

 * DISEÑO:
 * - Slider nativo de HTML5 con estilizado personalizado
 * - Gradiente de color que se llena según el valor
 * - Color del valor cambia según severidad (verde → amarillo → rojo)
 * - Etiquetas min/max para contexto

 * ESCALA DE COLORES:
 * - 0-3 (0-30%): Verde (bien/bajo)
 * - 4-6 (30-60%): Amarillo (moderado)
 * - 7-10 (60-100%): Rojo (severo)

 * USO EN ESTE PROYECTO:
 * - Módulo de Síntomas: Dolor frénico, distensión, reflujo
 * - Módulo de Adherencia: Horas de ayuno nocturno

 * @param {string} label - Texto principal del slider
 * @param {number} value - Valor actual
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {number} min - Valor mínimo (default: 0)
 * @param {number} max - Valor máximo (default: 10)
 * @param {string} description - Texto explicativo secundario (opcional)
 */
export function Slider({ label, value, onChange, min = 0, max = 10, description }) {
  // Calcula el color del valor según severidad
  const getColor = (val) => {
    const ratio = val / max;
    if (ratio <= 0.3) return 'text-dark-success';
    if (ratio <= 0.6) return 'text-yellow-500';
    return 'text-dark-alert';
  };

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      {/* Header: etiqueta y valor actual */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <p className="font-medium text-gray-100">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <span className={`text-2xl font-bold ${getColor(value)}`}>
          {value}
        </span>
      </div>

      {/* Slider input con gradiente dinámico */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-manipulation"
        style={{
          background: `linear-gradient(to right, #10B981 0%, #10B981 ${(value / max) * 100}%, #374151 ${(value / max) * 100}%, #374151 100%)`,
        }}
      />

      {/* Footer: etiquetas min/max */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Gradiente dinámico: Visualiza el progreso (fill effect)
 * - touch-manipulation: Previene zoom accidental al arrastrar
 * - Color semántico: Verde/amarillo/rojo comunica severidad intuitivamente
 * - Apariencia nativa: Usa input type="range" para accesibilidad
 *
 * FUTURO: Mejoras posibles:
 * - Añadir marcas intermedias (ticks) en el slider
 * - Añadir snap-to-points para valores específicos
 * - Añadir etiquetas descriptivas para rangos (ej: "Leve", "Moderado", "Severo")
 * - Considerar custom thumb size para mejor tapping en móvil
 */
