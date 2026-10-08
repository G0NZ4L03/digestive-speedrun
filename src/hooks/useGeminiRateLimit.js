import { useState, useEffect, useMemo } from 'react';

// ============================================================================
// HOOK: useGeminiRateLimit
// ============================================================================

/**
 * Hook personalizado para rate limiting y tracking de tokens de Gemini.
 *
 * PROBLEMA QUE RESUELVE:
 * - Prevenir uso accidental que exceda límites gratuitos (1500 requests/día)
 * - Proteger al usuario de costes inesperados
 * - Dar visibilidad del uso de tokens
 * - Prevenir abuso de la API

 * LÍMITES GRATUITOS DE GEMINI:
 * - 15 requests/min
 * - 1500 requests/día
 * - Reset diario a medianoche UTC

 * FUNCIONAMIENTO:
 * 1. Cuenta requests en última hora (limite local: 10/hora)
 * 2. Estima tokens usados (aprox 1K tokens por request)
 * 3. Calcula tokens restantes y tiempo de reset
 * 4. Bloquea si se excede límite local
 * 5. Visualiza uso para el usuario

 * POLÍTICA:
 * - NUNCA pagar, usar solo tier gratuito
 * - Bloquear si se excede límite local
 * - Avisar cuando quedan pocos tokens
 * - Reiniciar contador al día siguiente

 * @returns {Object} - { canMakeRequest, tokensUsed, tokensRemaining, timeToReset, recordRequest }
 */
export function useGeminiRateLimit() {
  const [requestsInHour, setRequestsInHour] = useState(() => {
    const saved = localStorage.getItem('digestive-gemini-requests');
    if (saved) {
      const { count, timestamp } = JSON.parse(saved);
      // Reset si ha pasado más de 1 hora
      if (Date.now() - timestamp > 3600000) {
        return { count: 0, timestamp: Date.now() };
      }
      return { count, timestamp };
    }
    return { count: 0, timestamp: Date.now() };
  });

  const [tokensUsedToday, setTokensUsedToday] = useState(() => {
    const saved = localStorage.getItem('digestive-gemini-tokens');
    if (saved) {
      const { count, date } = JSON.parse(saved);
      // Reset si es día diferente
      const today = new Date().toDateString();
      if (date !== today) {
        return { count: 0, date: today };
      }
      return { count, date };
    }
    return { count: 0, date: new Date().toDateString() };
  });

  // Persistir estado de requests en localStorage
  useEffect(() => {
    localStorage.setItem('digestive-gemini-requests', JSON.stringify(requestsInHour));
  }, [requestsInHour]);

  // Persistir estado de tokens en localStorage
  useEffect(() => {
    localStorage.setItem('digestive-gemini-tokens', JSON.stringify(tokensUsedToday));
  }, [tokensUsedToday]);

  // Limpiar estado de requests cada hora
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const saved = localStorage.getItem('digestive-gemini-requests');
      if (saved) {
        const { timestamp } = JSON.parse(saved);
        if (now - timestamp > 3600000) {
          setRequestsInHour({ count: 0, timestamp: now });
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, []);

  // Límites de Gemini (tier gratuito)
  const MAX_REQUESTS_PER_HOUR = 10; // Límite local conservador
  const MAX_REQUESTS_PER_DAY = 1500; // Límite de Gemini

  // Calcular si puede hacer request
  const canMakeRequest = requestsInHour.count < MAX_REQUESTS_PER_HOUR &&
                           tokensUsedToday.count < MAX_REQUESTS_PER_DAY;

  // Calcular tokens restantes
  const tokensRemaining = MAX_REQUESTS_PER_DAY - tokensUsedToday.count;

  // Calcular tiempo de reset (a medianoche UTC) - usar useMemo para evitar impureza
  const timeToReset = useMemo(() => {
    const now = new Date();
    const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const msUntilReset = utcMidnight - now;
    const hours = Math.floor(msUntilReset / 3600000);
    const minutes = Math.floor((msUntilReset % 3600000) / 60000);
    return { hours, minutes };
  }, []);

  // Determinar estado de tokens
  const getTokenStatus = () => {
    const percentage = (tokensUsedToday.count / MAX_REQUESTS_PER_DAY) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'warning';
    return 'ok';
  };

  // Registrar un request
  const recordRequest = () => {
    if (!canMakeRequest) {
      return false;
    }

    setRequestsInHour(prev => ({
      count: prev.count + 1,
      timestamp: Date.now(),
    }));

    setTokensUsedToday(prev => ({
      count: prev.count + 1,
      date: prev.date,
    }));

    return true;
  };

  return {
    canMakeRequest,
    tokensUsed: tokensUsedToday.count,
    tokensRemaining,
    maxTokens: MAX_REQUESTS_PER_DAY,
    timeToReset,
    tokenStatus: getTokenStatus(),
    recordRequest,
    requestsInHour: requestsInHour.count,
    maxRequestsPerHour: MAX_REQUESTS_PER_HOUR,
  };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Protección financiera: Previene costes inesperados
 * - Transparencia: Usuario ve uso de tokens
 * - Usabilidad: Avisos cuando quedan pocos tokens
 * - Responsabilidad: Política de "nunca pagar"
 *
 * USO EN ESTE PROYECTO:
 * - useGeminiAPI: Verificar rate limit antes de llamar API
 * - GeminiConfig: Mostrar visual de token usage
 * - AIAnalysisPanel: Mostrar aviso si se cerca del límite
 *
 * FUTURO: Mejoras posibles:
 * - Añadir histórico de uso por día/semana
 * - Añadir proyección de cuánto dura el tier gratuito
 * - Considerar añadir upgrade plan (付费 tier) si usuario quiere
 * - Añadir notificación cuando se acerca del límite
 */