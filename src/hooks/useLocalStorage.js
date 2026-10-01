import { useState, useEffect } from 'react';

// ============================================================================
// HOOK: useLocalStorage
// ============================================================================

/**
 * Hook personalizado para sincronizar estado con localStorage.
 *
 * PROBLEMA QUE RESUELVE:
 * - React state se pierde al recargar la página
 * - localStorage es asíncrono y puede fallar (cuota llena, modo privado, etc.)
 * - Necesitamos un bridge entre ambos mundos

 * FUNCIONAMIENTO:
 * 1. Al montar, lee de localStorage. Si no existe, usa initialValue.
 * 2. Cada vez que cambia el estado, sincroniza con localStorage.
 * 3. Soporta actualizaciones funcionales (como useState: setValue(prev => prev + 1))

 * MANEJO DE ERRORES:
 * - Captura errores de lectura/escritura en localStorage
 * - Fallback a initialValue si falla la lectura
 * - Logs en consola para debugging

 * SSR COMPATIBLE:
 * - Verifica typeof window para evitar crash en server-side rendering
 * - Devuelve initialValue en servidor

 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial si no existe en localStorage
 * @returns {[storedValue, setValue]} - Tuple con valor y setter (como useState)
 */
export function useLocalStorage(key, initialValue) {
  // Inicialización con función lazy para solo leer localStorage una vez
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Setter que actualiza tanto React state como localStorage
  const setValue = (value) => {
    try {
      // Soporta actualizaciones funcionales: setValue(prev => prev + 1)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Reutilizabilidad: Usado en múltiples componentes (adherencia, síntomas, notas)
 * - Abstracción: Esconde la complejidad de localStorage
 * - Seguridad: Manejo de errores robusto
 *
 * FUTURO: Mejoras posibles:
 * - Añadir debounce para no escribir en cada cambio (performance)
 * - Añadir migrate function para cambios de schema
 * - Añadir listener para sincronizar entre tabs
 * - Considerar IndexedDB para datos más grandes
 */
