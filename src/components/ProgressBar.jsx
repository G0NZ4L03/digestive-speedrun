// ============================================================================
// COMPONENTE: ProgressBar
// ============================================================================

/**
 * Barra de progreso visual para el protocolo de 14 días.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan ver visualmente su progreso
 * - El contador de días numérico no es suficiente para motivación
 * - Necesitamos feedback visual del avance del protocolo

 * DISEÑO:
 * - Barra de progreso horizontal con porcentaje
 * - Indicador del día actual con texto
 * - Color semántico según progreso (verde para buen avance)
 * - Animación suave de llenado

 * USO EN ESTE PROYECTO:
 * - Header de App: Muestra progreso del protocolo
 * - Motivación visual para el usuario

 * @param {number} currentDay - Día actual del protocolo (1-14)
 * @param {number} totalDays - Duración total del protocolo (default: 14)
 */
export function ProgressBar({ currentDay, totalDays = 14 }) {
  const percentage = Math.min(100, Math.round((currentDay / totalDays) * 100));
  
  // Color según progreso
  const getColor = (pct) => {
    if (pct >= 75) return 'bg-dark-success';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">Progreso del protocolo</span>
        <span className="text-sm font-medium text-dark-success">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Día {currentDay} de {totalDays}
      </p>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Animación suave: transition-all duration-500 para llenado gradual
 * - Color semántico: Azul (inicio) → Amarillo (mitad) → Verde (casi completo)
 * - Altura reducida: h-2 para no ser intrusivo
 * - Porcentaje visible: Para feedback claro del avance
 *
 * FUTURO: Mejoras posibles:
 * - Añadir hitos intermedios (ej: días 7, 14)
 * - Añadir celebración al completar (confetti, mensaje)
 * - Añadir gráfico circular alternativo
 * - Considerar animación de contador numérico
 */