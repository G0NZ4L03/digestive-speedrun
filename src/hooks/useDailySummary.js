import { useState, useEffect } from 'react';

// ============================================================================
// HOOK: useDailySummary
// ============================================================================

/**
 * Hook personalizado para calcular summary del día actual.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan feedback visual de su progreso diario
 - Motivación: ver adherencia % incentiva a seguir el protocolo
 - Contexto: saber si ya has registrado algo hoy

 * FUNCIONAMIENTO:
 * 1. Lee logs de localStorage
 * 2. Filtra logs de hoy
 * 3. Calcula estadísticas: adherencia %, síntomas promedio
 * 4. Determina hora del último registro

 * @returns {Object} - { adherence, avgPain, lastLogTime, hasLogsToday }
 */
export function useDailySummary() {
  const [summary, setSummary] = useState(() => {
    if (typeof window === 'undefined') {
      return { adherence: 0, avgPain: 0, lastLogTime: null, hasLogsToday: false };
    }
    try {
      const logs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
      const today = new Date().toLocaleDateString('es-ES');
      const todayLogs = logs.filter(log => 
        new Date(log.date).toLocaleDateString('es-ES') === today
      );

      if (todayLogs.length === 0) {
        return { adherence: 0, avgPain: 0, lastLogTime: null, hasLogsToday: false };
      }

      // Calcular adherencia promedio
      const adherenceScores = todayLogs.map(log => {
        const rules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
        const completed = rules.filter(rule => log.adherence[rule]).length;
        return Math.round((completed / rules.length) * 100);
      });
      const avgAdherence = Math.round(adherenceScores.reduce((a, b) => a + b, 0) / adherenceScores.length);

      // Calcular dolor promedio
      const painScores = todayLogs.map(log => {
        return (log.symptoms.phrenicPain + log.symptoms.bloating + log.symptoms.reflux) / 3;
      });
      const avgPain = Math.round(painScores.reduce((a, b) => a + b, 0) / painScores.length);

      // Último registro
      const lastLog = todayLogs[todayLogs.length - 1];
      const lastLogTime = new Date(lastLog.date);

      return {
        adherence: avgAdherence,
        avgPain,
        lastLogTime,
        hasLogsToday: true,
        logCount: todayLogs.length,
      };
    } catch (error) {
      console.error('Error calculating daily summary:', error);
      return { adherence: 0, avgPain: 0, lastLogTime: null, hasLogsToday: false };
    }
  });

  // Recalcular cuando cambia localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const logs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
      const today = new Date().toLocaleDateString('es-ES');
      const todayLogs = logs.filter(log => 
        new Date(log.date).toLocaleDateString('es-ES') === today
      );

      if (todayLogs.length === 0) {
        setSummary({ adherence: 0, avgPain: 0, lastLogTime: null, hasLogsToday: false });
        return;
      }

      const adherenceScores = todayLogs.map(log => {
        const rules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
        const completed = rules.filter(rule => log.adherence[rule]).length;
        return Math.round((completed / rules.length) * 100);
      });
      const avgAdherence = Math.round(adherenceScores.reduce((a, b) => a + b, 0) / adherenceScores.length);

      const painScores = todayLogs.map(log => {
        return (log.symptoms.phrenicPain + log.symptoms.bloating + log.symptoms.reflux) / 3;
      });
      const avgPain = Math.round(painScores.reduce((a, b) => a + b, 0) / painScores.length);

      const lastLog = todayLogs[todayLogs.length - 1];
      const lastLogTime = new Date(lastLog.date);

      setSummary({
        adherence: avgAdherence,
        avgPain,
        lastLogTime,
        hasLogsToday: true,
        logCount: todayLogs.length,
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Formatear tiempo transcurrido
  const getTimeAgo = (date) => {
    if (!date) return null;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return 'Hace más de 24h';
  };

  return {
    ...summary,
    timeAgo: getTimeAgo(summary.lastLogTime),
  };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Motivación: Ver adherencia % incentiva a seguir
 * - Contexto: Saber si ya registraste hoy
 * - Feedback: Datos visuales del progreso
 *
 * USO EN ESTE PROYECTO:
 * - Header de App: Muestra summary del día
 * - Motivación visual y contexto de actividad
 *
 * FUTURO: Mejoras posibles:
 * - Añadir comparación con días anteriores
 * - Añadir trends (mejorando/empeorando)
 * - Añadir gamification (streaks, achievements)
 */