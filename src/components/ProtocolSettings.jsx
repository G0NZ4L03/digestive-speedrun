import { Settings } from 'lucide-react';

// ============================================================================
// COMPONENTE: ProtocolSettings
// ============================================================================

/**
 * Componente para configurar la fecha de inicio del protocolo.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan poder ajustar cuándo empezaron su protocolo
 * - La fecha hardcodeada no es realista para diferentes usuarios
 * - Necesitamos un modal/panel simple para esta configuración

 * DISEÑO:
 * - Input de tipo date para seleccionar fecha
 * - Visualización del día actual calculado
 * - Estilo minimalista que no distrae del tracking diario

 * USO EN ESTE PROYECTO:
 * - Header de App: Icono de settings que abre este panel
 * - Permitir corrección si el usuario se equivocó al empezar

 * @param {string} startDate - Fecha de inicio actual (YYYY-MM-DD)
 * @param {number} currentDay - Día actual del protocolo
 * @param {function} onDateChange - Callback cuando cambia la fecha
 */
export function ProtocolSettings({ startDate, currentDay, onDateChange }) {
  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-400" />
        <h3 className="font-medium text-gray-100">Configuración del Protocolo</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-3 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-success text-base"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Día actual del protocolo
          </p>
          <p className="text-2xl font-bold text-dark-success mt-1">
            {currentDay} de 14
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Input type="date": Usamos el picker nativo del móvil (mejor UX)
 * - Visualización del día actual: Feedback inmediato del cambio
 * - Estilo consistente: Usa los mismos colores que el resto de la app
 *
 * FUTURO: Mejoras posibles:
 * - Añadir validación (no permitir fechas futuras)
 * - Añadir duración configurable (ej: 7, 14, 21 días)
 * - Añadir reset completo del protocolo
 * - Añadir confirmación antes de cambiar fecha (para evitar cambios accidentales)
 */