// ============================================================================
// UTILIDAD: geminiPrompts
// ============================================================================

/**
 * Utilidades para generar prompts optimizados para Gemini API.
 *
 * PROBLEMA QUE RESUELVE:
 * - Necesitamos prompts estructurados para análisis clínico
 * - Diferentes prompts para análisis de hoy vs completo
 * - Contexto clínico detallado para mejor comprensión de IA
 * - Prompts optimizados para la capacidad de Gemini

 * FUNCIONAMIENTO:
 * 1. Genera prompt con contexto clínico del protocolo
 * 2. Agrupa logs por día para mejor análisis
 * 3. Incluye contexto del paciente y objetivos
 * 4. Pide análisis específico: correlaciones, patrones, recomendaciones

 * FORMATO DE PROMPT:
 * - Markdown estructurado
 * - Secciones claras con emojis
 * - Peticiones específicas a la IA
 * - Contexto suficiente para respuestas útiles

 * @param {Array} logs - Array de logs de localStorage
 * @param {Object} options - { fullHistory: boolean, includeContext: boolean }
 * @returns {string} - Prompt formateado para Gemini
 */
export function generateAnalysisPrompt(logs, options = {}) {
  const { fullHistory = false, includeContext = true } = options;

  if (!logs || logs.length === 0) {
    return '';
  }

  // Filtrar logs según opción
  let logsToUse = logs;
  if (!fullHistory) {
    const today = new Date().toLocaleDateString('es-ES');
    logsToUse = logs.filter(log => 
      new Date(log.date).toLocaleDateString('es-ES') === today
    );
  }

  if (logsToUse.length === 0) {
    return '';
  }

  // Agrupar logs por día
  const logsByDay = {};
  logsToUse.forEach(log => {
    const date = new Date(log.date).toLocaleDateString('es-ES');
    if (!logsByDay[date]) {
      logsByDay[date] = [];
    }
    logsByDay[date].push(log);
  });

  // Generar prompt
  let prompt = `=== DIGESTIVE SPEEDRUN TRACKER - ANÁLISIS CLÍNICO PARA GEMINI ===\n\n`;

  if (includeContext) {
    prompt += `## CONTEXTO DEL PACIENTE\n\n`;
    prompt += `Soy un paciente siguiendo un protocolo estricto de 14 días para recuperación intestinal:\n`;
    prompt += `- Objetivo: Revertir disbiosis intestinal/SIBO/FODMAPs\n`;
    prompt += `- Mecanismo: Vaciado gástrico ultrarrápido (45 min tras comida sólida)\n`;
    prompt += `- Reglas principales: Almidón hidrolizado/gelatinizado, proteína blanda, cero edulcorantes, sin frío, ayuno >12h\n`;
    prompt += `- Síntoma principal: Dolor en nervio frénico (clavícula derecha) por acumulación de gas\n\n`;
  }

  prompt += `## TAREA\n\n`;
  prompt += `Analiza los siguientes datos de adherencia y síntomas y proporciona:\n`;
  prompt += `1. 📊 **Correlación**: ¿Hay correlación entre adherencia al protocolo y mejora de síntomas?\n`;
  prompt += `2. 🔍 **Patrones**: ¿Identificas patrones temporales (horarios, tipos de comida, etc.)?\n`;
  prompt += `3. 💡 **Recomendaciones**: ¿Qué recomendaciones específicas basadas en mis datos?\n`;
  prompt += `4. ⚠️ **Áreas de mejora**: ¿Qué áreas de adherencia necesito mejorar?\n`;
  prompt += `5. 📈 **Tendencias**: ¿Hay tendencia de mejora o empeoramiento con el tiempo?\n\n`;

  prompt += `=== DATOS DEL PACIENTE ===\n\n`;

  Object.entries(logsByDay).forEach(([date, dayLogs]) => {
    prompt += `## 📅 ${date}\n\n`;
    
    dayLogs.forEach((log, index) => {
      const mealTypeLabel = log.mealType === 'solid' ? '🍽️ Sólida' : 
                            log.mealType === 'soft' ? '🥣 Pastosa' : 
                            log.mealType === 'liquid' ? '🫖 Líquida' : 
                            '❓ Desconocida';
      const time = new Date(log.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      prompt += `### Registro ${index + 1}: ${mealTypeLabel} (${time})\n\n`;
      
      prompt += `**Adherencia al Protocolo:**\n`;
      prompt += `- Arroz fresco: ${log.adherence.freshRice ? '✅' : '❌'}\n`;
      prompt += `- Proteína blanda: ${log.adherence.softProtein ? '✅' : '❌'}\n`;
      prompt += `- Sin edulcorantes: ${log.adherence.noSweeteners ? '✅' : '❌'}\n`;
      prompt += `- Sin frío: ${log.adherence.noColdFood ? '✅' : '❌'}\n`;
      prompt += `- Ayuno nocturno: ${log.adherence.fastingHours}h (objetivo: >12h)\n`;
      
      if (log.adherence.supplements !== undefined) {
        prompt += `- Suplementos: ${log.adherence.supplements ? '✅' : '❌'}\n`;
      }
      
      prompt += `\n**Síntomas:**\n`;
      prompt += `- Dolor frénico: ${log.symptoms.phrenicPain}/10\n`;
      prompt += `- Distensión: ${log.symptoms.bloating}/10\n`;
      prompt += `- Reflujo: ${log.symptoms.reflux}/10\n`;
      prompt += `- Escala Bristol: Tipo ${log.symptoms.bristolScale}\n`;
      
      if (log.symptoms.energy !== undefined) {
        prompt += `- Energía: ${log.symptoms.energy}/10\n`;
      }
      if (log.symptoms.sleep !== undefined) {
        prompt += `- Sueño: ${log.symptoms.sleep}/10\n`;
      }
      if (log.symptoms.stress !== undefined) {
        prompt += `- Estrés: ${log.symptoms.stress}/10\n`;
      }
      if (log.symptoms.bowelMovements !== undefined) {
        prompt += `- Movimientos intestinales: ${log.symptoms.bowelMovements}/día\n`;
      }
      
      if (log.notes && log.notes.trim() !== '') {
        prompt += `\n**Notas del paciente:**\n${log.notes}\n`;
      }
      
      prompt += `\n---\n\n`;
    });
  });

  prompt += `=== FIN DE LOS DATOS ===\n\n`;
  prompt += `Por favor, proporciona tu análisis en un formato claro y estructurado con las secciones solicitadas.\n\n`;
  prompt += `🔹 Importante: Este es para uso clínico personal. Sé específico y práctico.`;

  return prompt;
}

/**
 * Genera prompt simplificado para test de API key
 */
export function generateTestPrompt() {
  return `Hola, este es un test para verificar que la API key de Gemini funciona correctamente. Por favor, responde con "✅ API key válida" si puedes leer este mensaje.`;
}

/*
 * RAZÓN DE ESTA UTILIDAD:
 * - Centralización: Todos los prompts en un lugar
 * - Mantenibilidad: Fácil actualizar prompts según feedback
 * - Calidad: Prompts optimizados para contexto clínico
 * - Flexibilidad: Diferentes prompts para diferentes casos de uso
 *
 * USO EN ESTE PROYECTO:
 * - useGeminiAPI: Usa generateAnalysisPrompt para análisis
 * - GeminiConfig: Usa generateTestPrompt para validar API key
 * - AIAnalysisPanel: Usa generateAnalysisPrompt para análisis de hoy/completo
 *
 * FUTURO: Mejoras posibles:
 * - Añadir más tipos de prompts (comparación períodos, etc.)
 * - Añadir prompts para entrenar respuestas consistentes
 * - Añadir plantillas de prompts que el usuario pueda personalizar
 * - Considerar añadir sistema de versionado de prompts
 */