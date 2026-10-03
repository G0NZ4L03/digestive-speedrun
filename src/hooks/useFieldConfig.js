import { useState } from 'react';

// ============================================================================
// HOOK: useFieldConfig
// ============================================================================

/**
 * Hook personalizado para gestionar configuración de campos trackeables.
 *
 * PROBLEMA QUE RESUELVE:
 * - Diferentes usuarios tienen diferentes necesidades de tracking
 * - Alguns quieren máximo detalle, otros prefieren simplicidad
 * - Necesitamos sistema flexible y escalable
 * - El usuario debe tener control sobre qué datos recopila
 
 * FUNCIONAMIENTO:
 * 1. Define campos disponibles organizados por categoría
 * 2. Permite activar/desactivar campos individualmente
 * 3. Persiste configuración en localStorage
 * 4. Proporciona lista de campos activos para renderizado
 
 * CAMPOS DISPONIBLES:
 * - Adherencia: reglas del protocolo
 * - Síntomas: síntomas digestivos y generales
 * - Contexto: información contextual (horario, lugar, etc.)
 
 * @returns {Object} - { config, toggleField, activeFields }
 */

// Definición de campos disponibles
const AVAILABLE_FIELDS = {
  adherence: {
    label: 'Adherencia',
    fields: [
      { id: 'freshRice', label: 'Arroz fresco', type: 'toggle', default: true },
      { id: 'softProtein', label: 'Proteína blanda', type: 'toggle', default: true },
      { id: 'noSweeteners', label: 'Sin edulcorantes', type: 'toggle', default: true },
      { id: 'noColdFood', label: 'Sin frío', type: 'toggle', default: true },
      { id: 'fastingHours', label: 'Ayuno nocturno', type: 'slider', default: true },
      { id: 'supplements', label: 'Suplementos', type: 'toggle', default: false },
      { id: 'mealTime', label: 'Horario comida', type: 'time', default: false },
      { id: 'mealLocation', label: 'Lugar comida', type: 'select', default: false },
    ],
  },
  symptoms: {
    label: 'Síntomas',
    fields: [
      { id: 'phrenicPain', label: 'Dolor frénico', type: 'slider', default: true },
      { id: 'bloating', label: 'Distensión', type: 'slider', default: true },
      { id: 'reflux', label: 'Reflujo', type: 'slider', default: true },
      { id: 'bristolScale', label: 'Escala Bristol', type: 'bristol', default: true },
      { id: 'energy', label: 'Nivel de energía', type: 'slider', default: false },
      { id: 'sleep', label: 'Calidad de sueño', type: 'slider', default: false },
      { id: 'stress', label: 'Nivel de estrés', type: 'slider', default: false },
      { id: 'bowelMovements', label: 'Movimientos intestinales', type: 'slider', default: false },
    ],
  },
};

// Genera configuración inicial con defaults
function getInitialConfig() {
  const initial = {};
  Object.entries(AVAILABLE_FIELDS).forEach(([category, { fields }]) => {
    initial[category] = {};
    fields.forEach((field) => {
      initial[category][field.id] = field.default;
    });
  });
  return initial;
}

export function useFieldConfig() {
  const [config, setConfig] = useState(() => {
    if (typeof window === 'undefined') {
      return getInitialConfig();
    }
    try {
      const stored = localStorage.getItem('digestive-field-config');
      if (stored) {
        return JSON.parse(stored);
      }
      return getInitialConfig();
    } catch (error) {
      console.error('Error reading field config:', error);
      return getInitialConfig();
    }
  });

  // Guarda configuración en localStorage
  const saveConfig = (newConfig) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('digestive-field-config', JSON.stringify(newConfig));
      }
    } catch (error) {
      console.error('Error saving field config:', error);
    }
  };

  // Activa/desactiva un campo
  const toggleField = (category, fieldId) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [category]: {
          ...prev[category],
          [fieldId]: !prev[category][fieldId],
        },
      };
      saveConfig(newConfig);
      return newConfig;
    });
  };

  // Obtiene lista de campos activos por categoría
  const getActiveFields = (category) => {
    return AVAILABLE_FIELDS[category].fields.filter(
      field => config[category]?.[field.id]
    );
  };

  // Verifica si un campo está activo
  const isFieldActive = (category, fieldId) => {
    return config[category]?.[fieldId] || false;
  };

  return {
    config,
    toggleField,
    getActiveFields,
    isFieldActive,
    AVAILABLE_FIELDS,
  };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Flexibilidad: Usuario personaliza su experiencia
 * - Escalabilidad: Fácil añadir nuevos campos
 * - Persistencia: Configuración se guarda entre sesiones
 * - Defaults razonables: Campos importantes activados por defecto
 *
 * USO EN ESTE PROYECTO:
 * - FieldConfig component: UI para configurar campos
 * - App.jsx: Renderizado condicional de campos según config
 * - Permite evolución del tracking según necesidades del usuario
 *
 * FUTURO: Mejoras posibles:
 * - Añadir presets de configuración (básico, intermedio, avanzado)
 * - Añadir campos personalizados definidos por usuario
 * - Añadir orden personalizado de campos
 * - Añadir agrupación de campos en secciones
 * - Considerar sync entre dispositivos si se añade backend
 */