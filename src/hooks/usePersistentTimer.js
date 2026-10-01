import { useState, useEffect } from 'react';

// ============================================================================
// HOOK: usePersistentTimer
// ============================================================================

/**
 * Hook personalizado para un timer que persiste en localStorage.
 *
 * PROBLEMA QUE RESUELVE:
 * - El timer actual se pierde al recargar la página
 * - Los usuarios pueden cerrar la app accidentalmente
 * - Necesitamos que el timer continúe contando aunque la app se cierre

 * FUNCIONAMIENTO:
 * 1. Al montar, recupera estado del timer de localStorage
 * 2. Si el timer estaba corriendo, calcula el tiempo transcurrido
 * 3. Sincroniza estado con localStorage en cada cambio
 * 4. Limpia localStorage cuando el timer completa o se resetea

 * ESTADOS:
 * - timeLeft: Segundos restantes (null si no iniciado)
 * - isRunning: Si el timer está corriendo
 * - lastTick: Timestamp del último tick (para calcular tiempo transcurrido)

 * @param {number} initialTime - Tiempo inicial en segundos
 * @param {function} onComplete - Callback cuando el timer llega a 0
 * @returns {Object} - { timeLeft, isRunning, start, pause, reset }
 */
export function usePersistentTimer(initialTime, onComplete) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('digestive-timer-state');
      if (stored) {
        const state = JSON.parse(stored);
        // Calcular tiempo transcurrido desde el último tick
        if (state.isRunning && state.lastTick) {
          const elapsed = Math.floor((Date.now() - state.lastTick) / 1000);
          const newTimeLeft = Math.max(0, state.timeLeft - elapsed);
          if (newTimeLeft === 0) {
            // Timer completó mientras la app estaba cerrada
            localStorage.removeItem('digestive-timer-state');
            onComplete?.();
            return null;
          }
          return newTimeLeft;
        }
        return state.timeLeft;
      }
      return null;
    } catch (error) {
      console.error('Error reading timer state:', error);
      return null;
    }
  });

  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem('digestive-timer-state');
      if (stored) {
        const state = JSON.parse(stored);
        return state.isRunning;
      }
      return false;
    } catch (error) {
      console.error('Error reading timer running state:', error);
      return false;
    }
  });

  // Guardar estado en localStorage
  const saveState = (newTimeLeft, running) => {
    try {
      if (typeof window !== 'undefined') {
        if (newTimeLeft === null) {
          localStorage.removeItem('digestive-timer-state');
        } else {
          localStorage.setItem('digestive-timer-state', JSON.stringify({
            timeLeft: newTimeLeft,
            isRunning: running,
            lastTick: running ? Date.now() : null,
          }));
        }
      }
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Efecto: maneja el intervalo del timer
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            saveState(null, false);
            onComplete?.();
            return 0;
          }
          const newTime = prev - 1;
          saveState(newTime, true);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  // Iniciar el timer
  const start = () => {
    setTimeLeft(initialTime);
    setIsRunning(true);
    saveState(initialTime, true);
  };

  // Pausar el timer
  const pause = () => {
    setIsRunning(false);
    saveState(timeLeft, false);
  };

  // Reanudar el timer
  const resume = () => {
    setIsRunning(true);
    saveState(timeLeft, true);
  };

  // Resetear el timer
  const reset = () => {
    setTimeLeft(null);
    setIsRunning(false);
    saveState(null, false);
  };

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    resume,
    reset,
  };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Persistencia: El timer sobrevive a refresh y cierre de app
 * - Precisión: Calcula tiempo transcurrido offline
 * - UX: El usuario no pierde su progreso accidentalmente
 *
 * USO EN ESTE PROYECTO:
 * - GastricTimer: Reemplaza la lógica de estado actual
 * - Permite que el usuario cierre la app y vuelva sin perder el timer
 *
 * FUTURO: Mejoras posibles:
 * - Añadir múltiples timers simultáneos
 * - Añadir historial de timers completados
 * - Añadir notificación push cuando completa offline
 * - Considerar Background Sync API para mayor precisión
 */