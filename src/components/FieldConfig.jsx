import { Check, X } from 'lucide-react';

// ============================================================================
// COMPONENTE: FieldConfig
// ============================================================================

/**
 * Componente para configurar qué campos trackear.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan personalizar qué datos recopilan
 * - No todos necesitan el mismo nivel de detalle
 * - Reducir fricción permitiendo ocultar campos no usados

 * DISEÑO:
 * - Agrupado por categoría (Adherencia, Síntomas)
 * - Toggle simple para activar/desactivar cada campo
 * - Visual claro de qué está activo
 * - Scrollable para muchos campos

 * USO EN ESTE PROYECTO:
 * - Vista de Configuración: Permite personalizar tracking
 * - Añadido al ProtocolSettings o como sección separada

 * @param {Object} config - Configuración actual de campos
 * @param {function} onToggle - Callback cuando se activa/desactiva un campo
 * @param {Object} availableFields - Definición de campos disponibles
 */
export function FieldConfig({ config, onToggle, availableFields }) {
  return (
    <div className="space-y-6">
      {Object.entries(availableFields).map(([category, { label, fields }]) => (
        <div key={category}>
          <h3 className="text-lg font-medium text-gray-100 mb-3">{label}</h3>
          <div className="space-y-2">
            {fields.map((field) => {
              const isActive = config[category]?.[field.id];
              return (
                <button
                  key={field.id}
                  onClick={() => onToggle(category, field.id)}
                  className={`w-full p-3 rounded-lg text-left touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-between ${
                    isActive
                      ? 'bg-dark-success text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5 opacity-50" />
                    )}
                    <div>
                      <p className="font-medium">{field.label}</p>
                      <p className="text-xs opacity-70">
                        {field.type === 'toggle' && 'Interruptor Sí/No'}
                        {field.type === 'slider' && 'Escala 0-10'}
                        {field.type === 'bristol' && 'Escala Bristol 1-7'}
                        {field.type === 'time' && 'Horario'}
                        {field.type === 'select' && 'Opciones múltiples'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Agrupado por categoría: Organización clara
 * - Check/X icons: Feedback visual inmediato
 * - Descripción de tipo: Para que el usuario sepa qué esperar
 * - Toggle simple: Fácil de usar
 *
 * FUTURO: Mejoras posibles:
 * - Añadir presets de configuración (básico, avanzado)
 * - Añadir search/filter de campos
 * - Añadir arrastrar para reordenar
 * - Considerar accordion para categorías si hay muchos campos
 */