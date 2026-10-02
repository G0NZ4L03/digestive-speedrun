// ============================================================================
// COMPONENTE: MealTypeSelector
// ============================================================================

/**
 * Selector de tipo de comida para cada registro.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan registrar múltiples comidas por día
 - Diferentes tipos de comida tienen diferentes efectos clínicos
 - Necesitamos distinguir entre sólida, pastosa y líquida

 * DISEÑO:
 * - Selector simple con 3 opciones
 * - Visual claro del tipo seleccionado
 * - Touch-friendly para uso con una mano

 * USO EN ESTE PROYECTO:
 * - App.jsx: Selector antes de guardar el registro
 * - Permite múltiples registros del mismo tipo por día

 * @param {string} value - Tipo seleccionado ('solid' | 'soft' | 'liquid')
 * @param {function} onChange - Callback cuando cambia el tipo
 */
export function MealTypeSelector({ value, onChange }) {
  const mealTypes = [
    { 
      value: 'solid', 
      label: 'Sólida', 
      description: 'Comida sólida estándar',
      icon: '🍽️'
    },
    { 
      value: 'soft', 
      label: 'Pastosa', 
      description: 'Consistencia intermedia',
      icon: '🥣'
    },
    { 
      value: 'liquid', 
      label: 'Líquida', 
      description: 'Infusión/té/caldo',
      icon: '🫖'
    },
  ];

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <p className="font-medium text-gray-100 mb-3">Tipo de Comida</p>
      <div className="space-y-2">
        {mealTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`w-full p-3 rounded-lg text-left touch-manipulation active:scale-[0.98] transition-transform flex items-center gap-3 ${
              value === type.value
                ? 'bg-dark-success text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <span className="text-2xl">{type.icon}</span>
            <div>
              <p className="font-medium">{type.label}</p>
              <p className="text-xs opacity-80">{type.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Iconos emoji: Visuales y sin dependencias externas
 * - Descripción breve: Para claridad clínica
 * - Espacio vertical: Mejor para tapping en móvil
 * - Mismo estilo que BristolScale: Consistencia UI
 *
 * FUTURO: Mejoras posibles:
 * - Añadir más tipos (ej: "snack", "suplemento")
 * - Añadir hora del día (pre/post workout, etc.)
 * - Considerar preset para comidas frecuentes
 */