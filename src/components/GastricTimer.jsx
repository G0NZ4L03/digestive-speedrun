import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { usePersistentTimer } from '../hooks/usePersistentTimer';

// ============================================================================
// COMPONENTE: GastricTimer
// ============================================================================

/**
 * Timer de cuenta atrás para vaciado gástrico (45 minutos).
 *
 * CONTEXTO CLÍNICO:
 * - El protocolo requiere 45 min de espera tras comida sólida
 * - Tras este tiempo, el estómago ha realizado vaciado inicial
 * - Esto permite infusiones tibias sin riesgo de fermentación
 * - Es crítico para evitar SIBO y acumulación de gas

 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan recordar cuándo pueden tomar infusiones
 * - Los timers del móvil son tediosos de configurar cada vez
 * - Necesitamos alertas visuales y push cuando complete
 * - El timer debe persistir si el usuario cierra la app

 * FUNCIONAMIENTO:
 * 1. Botón "Fin Comida Sólida" inicia timer de 45 min
 * 2. Cuenta atrás en tiempo real (MM:SS)
 * 3. Controles de pausa/reanudar/reset
 * 4. Al completar, llama a onTimerComplete (para notificación)
 * 5. Estado persiste en localStorage (survive refresh/cierre)

 * ESTADOS:
 * - timeLeft === null: Timer no iniciado (muestra botón de inicio)
 * - timeLeft > 0: Timer corriendo o pausado (muestra tiempo y controles)
 * - timeLeft === 0: Timer completado

 * CAMBIOS RECIENTES:
 * - Ahora usa usePersistentTimer hook para persistencia
 * - El timer continúa contando aunque la app se cierre
 * - Al reabrir la app, calcula el tiempo transcurrido offline

 * @param {function} onTimerComplete - Callback cuando el timer llega a 0
 */
const INITIAL_TIME = 45 * 60; // 45 minutos en segundos

export function GastricTimer({ onTimerComplete }) {
  const { timeLeft, isRunning, start, pause, resume, reset } = usePersistentTimer(
    INITIAL_TIME,
    onTimerComplete
  );

  // Formatea segundos a MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle entre pausar y reanudar
  const toggleTimer = () => {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="p-6 bg-dark-surface rounded-xl text-center">
      <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center justify-center gap-2">
        <Clock className="w-5 h-5" />
        Vaciado Gástrico
      </h3>

      {/* Estado: Timer no iniciado */}
      {timeLeft === null ? (
        <button
          onClick={start}
          className="w-full py-4 bg-dark-success text-white font-bold rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6" />
          Fin Comida Sólida
        </button>
      ) : (
        <>
          {/* Estado: Timer iniciado - muestra tiempo y controles */}
          <div className="text-5xl font-bold text-gray-100 mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Reanudar
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 bg-dark-alert text-white font-medium rounded-xl touch-manipulation active:scale-[0.98] transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - 45 min fijo: Según protocolo clínico (no configurable)
 * - Persistencia: Usa usePersistentTimer para survive refresh
 * - formatTime con padStart: Siempre muestra 2 dígitos (ej: 05:03)
 * - Font-mono para tiempo: Evita jitter visual por anchos variables
 * - Botón de reset prominentemente rojo: Para evitar clicks accidentales
 *
 * CAMBIOS RECIENTES:
 * - Refactorizado para usar usePersistentTimer hook
 * - El timer ahora persiste en localStorage
 * - Calcula tiempo transcurrido offline al reabrir la app
 * - Simplifica la lógica del componente
 *
 * FUTURO: Mejoras posibles:
 * - Añadir presets para diferentes tiempos (ej: 30 min para líquidos)
 * - Añadir sonido de alarma al completar
 * - Añadir vibración en móviles que lo soporten
 * - Considerar Background Sync API para mayor precisión offline
 * - Añadir historial de timers completados
 */
