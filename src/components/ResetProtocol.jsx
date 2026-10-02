import { AlertTriangle } from 'lucide-react';

// ============================================================================
// COMPONENTE: ResetProtocol
// ============================================================================

/**
 * Componente para resetear completamente el protocolo.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios pueden querer empezar el protocolo de nuevo
 - Necesitamos limpiar todos los datos accumulated
 - Evitar clicks accidentales con confirmación

 * DISEÑO:
 * - Botón rojo con icono de advertencia
 - Confirmación con double-check
 - Limpia: logs, configuración, fecha de inicio, timer

 * USO EN ESTE PROYECTO:
 * - Vista de Configuración: Para resetear y empezar de nuevo
 * - Último recurso: Permite fresh start

 * @param {function} onReset - Callback cuando se confirma el reset
 */
export function ResetProtocol({ onReset }) {
  const handleReset = () => {
    const confirmation = confirm(
      '⚠️ ESTÁS A PUNTO DE BORRAR TODOS LOS DATOS\n\n' +
      'Esto borrará:\n' +
      '• Todos los registros guardados\n' +
      '• Configuración de campos\n' +
      '• Fecha de inicio del protocolo\n' +
      '• Estado del timer\n\n' +
      '¿Estás seguro de que quieres continuar?'
    );

    if (confirmation) {
      const doubleCheck = confirm(
        'ÚLTIMA OPORTUNIDAD:\n\n' +
        'Esta acción NO SE PUEDE DESHACER.\n' +
        '¿Realmente quieres borrar todo y empezar de cero?'
      );

      if (doubleCheck) {
        onReset();
      }
    }
  };

  return (
    <div className="p-4 bg-dark-surface rounded-xl border-2 border-dark-alert">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-dark-alert" />
        <h3 className="font-medium text-dark-alert">Zona de Peligro</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Borra todos los datos y empieza el protocolo de cero. Esta acción no se puede deshacer.
      </p>
      <button
        onClick={handleReset}
        className="w-full py-3 bg-dark-alert text-white font-medium rounded-lg touch-manipulation active:scale-[0.98] transition-transform"
      >
        Resetear Protocolo Completo
      </button>
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Doble confirmación: Evita clicks accidentales
 * - Borde rojo: Visual warning de peligro
 * - Lista clara de qué se borra: Transparencia
 * - Último mensaje en mayúsculas: Urgencia
 *
 * FUTURO: Mejoras posibles:
 * - Añadir backup automático antes de reset
 * - Añadir opción de exportar antes de borrar
 * - Considerar undo con backup temporal
 */