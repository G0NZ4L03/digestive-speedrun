// ============================================================================
// COMPONENTE: BristolScale
// ============================================================================

/**
 * Selector visual de la Escala de Bristol para consistencia fecal.
 *
 * CONTEXTO CLÍNICO:
 * - La Escala de Bristol clasifica 7 tipos de heces (1-7)
 * - Tipos 1-2: Estreñimiento (dificultad al evacuar)
 * - Tipos 3-4: Normal (ideal para salud digestiva)
 * - Tipos 5-7: Diarrea (indicativo de problemas)
 * - Es crítico para monitorear SIBO y disbiosis

 * PROBLEMA QUE RESUELVE:
 * - Los usuarios no conocen la escala por memoria
 * - Necesitamos descripciones visuales y textuales
 * - Un slider numérico no es lo suficientemente descriptivo

 * DISEÑO:
 * - Grid de 7 botones (2 columnas, el último centrado)
 * - Cada botón muestra tipo + descripción breve
 * - Estado seleccionado: verde, no seleccionado: gris
 * - Touch-friendly para uso con una mano

 * ESCALA DE BRISTOL (resumen):
 * 1: Bolos duros separados (estreñimiento severo)
 * 2: Salsicha pero grumosa (estreñimiento leve)
 * 3: Salsicha con grietas (normal, ligeramente seca)
 * 4: Salsicha suave lisa (ideal)
 * 5: Blandos con bordes (límite diarrea)
 * 6: Trozos blandos (diarrea leve)
 * 7: Líquido sin sólidos (diarrea severa)

 * @param {number} value - Tipo seleccionado (1-7)
 * @param {function} onChange - Callback cuando cambia la selección
 */
export function BristolScale({ value, onChange }) {
  const bristolTypes = [
    { value: 1, label: 'Tipo 1', desc: 'Bolos duros separados' },
    { value: 2, label: 'Tipo 2', desc: 'Salsicha pero grumosa' },
    { value: 3, label: 'Tipo 3', desc: 'Salsicha con grietas' },
    { value: 4, label: 'Tipo 4', desc: 'Salsicha suave lisa' },
    { value: 5, label: 'Tipo 5', desc: 'Blandos con bordes' },
    { value: 6, label: 'Tipo 6', desc: 'Trozos blandos' },
    { value: 7, label: 'Tipo 7', desc: 'Líquido sin sólidos' },
  ];

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <p className="font-medium text-gray-100 mb-3">Escala de Bristol</p>
      <div className="grid grid-cols-2 gap-2">
        {bristolTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`p-3 rounded-lg text-left touch-manipulation active:scale-[0.98] transition-transform ${
              value === type.value
                ? 'bg-dark-success text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <p className="font-medium text-sm">{type.label}</p>
            <p className="text-xs mt-1 opacity-80">{type.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Grid de 2 columnas: Maximiza uso de espacio en móvil
 * - Descripciones breves: Para no abrumar pero ser claros
 * - Color verde para selección: Indica "confirmado"
 * - No usa imágenes: MVP ligero, sin dependencias de assets
 *
 * FUTURO: Mejoras posibles:
 * - Añadir ilustraciones visuales de cada tipo
 * - Añadir recomendación clínica según tipo seleccionado
 * - Añadir tracking de tendencia (está mejorando/empeorando)
 * - Considerar single-select en lugar de grid para scroll vertical
 * - Añadir explicación más detallada en modal al hacer tap
 */
