import { useState } from 'react';

// ============================================================================
// HOOK: useGeminiAPI
// ============================================================================

/**
 * Hook personalizado para llamadas a la API de Gemini.
 *
 * PROBLEMA QUE RESUELVE:
 * - Necesitamos comunicación directa con Gemini API desde el frontend
 * - No tenemos backend, así que las llamadas son desde el navegador
 * - Necesitamos manejo robusto de errores y timeouts
 * - Soporte para múltiples modelos (gemini-1.5-pro, gemini-2.0-flash)

 * FUNCIONAMIENTO:
 * 1. Realiza fetch directo a la API de Google AI
 * 2. Envía API key en headers (standard OAuth)
 * 3. Maneja diferentes tipos de errores específicamente
 * 4. Timeout de 30 segundos para no colgar la UI
 * 5. Graceful degradation si falla

 * MODELOS SOPORTADOS:
 * - gemini-1.5-pro: Mayor calidad, mejor razonamiento clínico (default)
 * - gemini-2.0-flash: Más rápido, más barato (opcional)

 * ERRORES ESPECÍFICOS:
 * - 401 Unauthorized: API key inválida o expirada
 * - 429 Too Many Requests: Rate limit excedido
 * - 500 Internal Server Error: Error en servidor de Google
 * - 403 Forbidden: API key sin permiso para el modelo
 * - 400 Bad Request: Error en el request
 * - Otros: Error genérico

 * @param {string} apiKey - API key de Gemini
 * @param {string} prompt - Prompt a enviar a Gemini
 * @param {string} model - Modelo a usar (default: 'gemini-1.5-pro')
 * @returns {Object} - { loading, error, response, callGemini }
 */
export function useGeminiAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callGemini = async (apiKey, prompt, model = 'gemini-1.5-pro') => {
    setLoading(true);
    setError(null);

    try {
      // Validar API key
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('API key no proporcionada');
      }

      // Validar modelo
      const validModels = ['gemini-1.5-pro', 'gemini-2.0-flash'];
      if (!validModels.includes(model)) {
        throw new Error(`Modelo no válido: ${model}`);
      }

      // Validar prompt
      if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt vacío');
      }

      // Timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Endpoint de Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejo específico de errores comunes
        if (response.status === 401) {
          throw new Error('API key inválida o expirada. Verifica en configuración.');
        }
        
        if (response.status === 429) {
          throw new Error('Has excedido el límite de uso gratuito. Espera a que se reinicien los tokens.');
        }
        
        if (response.status === 500) {
          throw new Error('Error en el servidor de Gemini. Intenta más tarde.');
        }
        
        if (response.status === 403) {
          throw new Error('Tu API key no tiene permiso para este modelo.');
        }
        
        if (response.status === 400) {
          throw new Error('Error en el request. Contacta soporte.');
        }
        
        // Error genérico
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraer el texto de la respuesta
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        throw new Error('La respuesta de Gemini está vacía o en formato no reconocido.');
      }

      return text;
    } catch (err) {
      // Manejo de timeout
      if (err.name === 'AbortError') {
        setError('La solicitud tardó demasiado (30s). Intenta con un prompt más corto.');
      } else {
        setError(err.message || 'Error desconocido al conectar con Gemini');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    callGemini,
  };
}

/*
 * RAZÓN DE ESTE HOOK:
 * - Simplicidad: Llamadas directas sin middleware
 * - Flexibilidad: Soporta múltiples modelos
 * - Seguridad: API key solo en dispositivo del usuario
 * - UX: Loading states para feedback visual
 * - Robustez: Error handling específico y timeout
 *
 * USO EN ESTE PROYECTO:
 * - AIAnalysisPanel: Consultar Gemini con el prompt generado
 * - GeminiConfig: Test call para validar API key
 * - HistoryView: Botón "Analizar con IA"
 *
 * FUTURO: Mejoras posibles:
 * - Añadir soporte para streaming responses
 * - Añadir cache de respuestas comunes
 * - Añadir retry automático con backoff
 * - Considerar añadir modelo gemini-expert si se necesita
 */