import { useState, useEffect, useRef } from 'react';

// ============================================================================
// HOOK: usePersistentTimer
// ============================================================================

/**
 * Hook personalizado para un timer que persiste y funciona en background.
 *
 * PROBLEMA QUE RESUELVE:
 * - El timer se pausa en Safari iOS cuando la app va a background
 * - setInterval no funciona cuando la app no está en primer plano
 * - Necesitamos un sistema basado en timestamps para calcular tiempo real

 * FUNCIONAMIENTO:
 * 1. Usa timestamps en lugar de setInterval contando segundos
 * 2. Al volver a primer plano, calcula tiempo transcurrido real
 * 3. Usa Page Visibility API para detectar cuando la app vuelve
 * 4. Corrige el tiempo basándose en el tiempo real transcurrido

 * ESTADOS:
 * - timeLeft: Segundos restantes (null si no iniciado)
 * - isRunning: Si el timer está corriendo
 * - lastTick: Timestamp del último tick (para calcular tiempo transcurrido)

 * @param {number} initialTime - Tiempo inicial en segundos
 * @param {function} onComplete - Callback cuando el timer llega a 0
 * @returns {Object} - { timeLeft, isRunning, start, pause, resume, reset }
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

  const intervalRef = useRef(null);
  const lastTickRef = useRef(null);

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
    if (isRunning && timeLeft > 0) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastTickRef.current) / 1000);
        if (elapsed >= 1) {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              saveState(null, false);
              onComplete?.();
              return 0;
            }
            const newTime = prev - elapsed;
            saveState(newTime, true);
            lastTickRef.current = Date.now();
            return newTime;
          });
        }
      }, 100);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  // Efecto: detecta cuando la app vuelve a primer plano para sincronizar el tiempo transcurrido
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && lastTickRef.current) {
        const elapsed = Math.floor((Date.now() - lastTickRef.current) / 1000);
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0) {
            setIsRunning(false);
            saveState(null, false);
            onComplete?.();
            return 0;
          }
          return newTime;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, onComplete]);

  // Iniciar el timer
  const start = () => {
    setTimeLeft(initialTime);
    setIsRunning(true);
    lastTickRef.current = Date.now();
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
    lastTickRef.current = Date.now();
    saveState(timeLeft, true);
  };

  // Resetear el timer
  const reset = () => {
    setTimeLeft(null);
    setIsRunning(false);
    saveState(null, false);
    lastTickRef.current = null;
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
 * - Background: Funciona correctamente cuando la app va a background
 * - Precisión: Usa timestamps para calcular tiempo real transcurrido
 * - Page Visibility API: Detecta cuando la app vuelve a primer plano
 * - UX: El usuario no pierde su progreso aunque cambie de app
 *
 * USO EN ESTE PROYECTO:
 * - GastricTimer: Reemplaza la lógica de estado actual
 * - Permite que el usuario cierre la app y vuelva sin perder el timer
 *
 * CAMBIOS RECIENTES:
 * - Añadido Page Visibility API para detectar cambios de visibilidad
 * - Corrección de tiempo basada en timestamps reales
 * - Interval más frecuente (100ms) para mayor precisión
 * - lastTickRef para tracking preciso del tiempo
 *
 * FUTURO: Mejoras posibles:
 * - Añadir múltiples timers simultáneos
 * - Añadir historial de timers completados
 * - Añadir notificación push cuando completa offline
 * - Considerar Background Sync API para mayor precisión
 */