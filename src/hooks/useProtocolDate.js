import { useState, useEffect } from 'react';

// ============================================================================
// HOOK: useProtocolDate
// ============================================================================

/**
 * Calcula el día del protocolo (1-14) comparando en hora local a medianoche.
 * Evita Math.abs para que fechas futuras no sumen días positivos,
 * y acota el resultado estrictamente entre el día 1 y 14.
 */
function calculateCurrentDay(dateStr) {
  if (!dateStr) return 1;
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 1;
    const [year, month, day] = parts;
    const startLocal = new Date(year, month - 1, day);
    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = todayLocal - startLocal;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Si la fecha es futura, diffDays será negativo -> Día 1
    // Acotar estrictamente entre 1 y 14
    return Math.max(1, Math.min(14, diffDays + 1));
  } catch {
    return 1;
  }
}

/**
 * Hook personalizado para gestionar la fecha de inicio del protocolo.
 *
 * @returns {Object} - { startDate, currentDay, setStartDate }
 */
export function useProtocolDate() {
  const [startDate, setStartDate] = useState(() => {
    if (typeof window === 'undefined') {
      return new Date().toISOString().split('T')[0];
    }
    try {
      const stored = localStorage.getItem('digestive-protocol-start');
      return stored || new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error('Error reading protocol start date:', error);
      return new Date().toISOString().split('T')[0];
    }
  });

  // El día actual es un valor derivado directamente de startDate
  const currentDay = calculateCurrentDay(startDate);

  // Forzar actualización cuando la app vuelve a primer plano tras medianoche
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTick((t) => t + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Actualiza la fecha de inicio y la persiste
  const handleSetStartDate = (newDate) => {
    setStartDate(newDate);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('digestive-protocol-start', newDate);
      }
    } catch (error) {
      console.error('Error setting protocol start date:', error);
    }
  };

  return { startDate, currentDay, setStartDate: handleSetStartDate };
}