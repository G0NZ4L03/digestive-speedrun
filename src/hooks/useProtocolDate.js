import { useState, useEffect } from 'react';

// ============================================================================
// HOOK: useProtocolDate
// ============================================================================

/**
 * Hook personalizado para gestionar la fecha de inicio del protocolo.
 *
 * PROBLEMA QUE RESUELVE:
 * - El cálculo del día del protocolo estaba hardcodeado a una fecha fija
 * - Los usuarios necesitan poder configurar cuándo empezaron su protocolo
 * - Necesitamos persistencia de esta configuración

 * FUNCIONAMIENTO:
 * 1. Al montar, lee la fecha de inicio de localStorage
 * 2. Si no existe, usa la fecha actual por defecto
 * 3. Calcula el día actual del protocolo (días desde inicio + 1)
 * 4. Permite actualizar la fecha de inicio

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

  // Calcula el día actual del protocolo (1-based)
  const currentDay = (() => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 porque el día 1 es el primer día
  })();

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

/*
 * RAZÓN DE ESTE HOOK:
 * - Flexibilidad: Permite al usuario configurar su fecha de inicio real
 * - Persistencia: La configuración sobrevive a refresh
 * - Cálculo automático: No requiere cálculo manual del día actual
 *
 * USO EN ESTE PROYECTO:
 * - Header de App: Muestra "Día X de 14"
 * - Configuración: Permite cambiar fecha de inicio si el usuario se equivocó
 *
 * FUTURO: Mejoras posibles:
 * - Añadir duración configurable (14 días por defecto)
 * - Añadir multiple protocolos (ej: protocolo A, protocolo B)
 * - Añadir alerts cuando se complete el protocolo (día 14)
 */