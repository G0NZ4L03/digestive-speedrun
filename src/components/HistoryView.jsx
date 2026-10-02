import { useState } from 'react';
import { History, ChevronDown, ChevronUp, Trash2, Download, Copy } from 'lucide-react';
import { exportToJSON, exportToCSV, exportToSimpleCSV } from '../utils/exportData';

// ============================================================================
// COMPONENTE: HistoryView
// ============================================================================

/**
 * Componente para visualizar el histórico de logs diarios.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan ver su evolución durante el protocolo
 * - Correlacionar adherencia con síntomas requiere revisión histórica
 * - localStorage guarda logs pero no hay UI para verlos

 * DISEÑO:
 * - Lista de logs ordenados por fecha (más reciente primero)
 * - Cada log es expandible para ver detalles
 * - Resumen visual de adherencia (porcentaje de reglas cumplidas)
 * - Indicadores de severidad de síntomas con colores semánticos

 * USO EN ESTE PROYECTO:
 * - Nueva sección en App: "Histórico"
 * - Permite revisar progreso y patrones

 * @returns {JSX.Element}
 */
export function HistoryView() {
  const [expandedLog, setExpandedLog] = useState(null);

  // Leer logs de localStorage
  const logs = (() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  })();

  // Calcular porcentaje de adherencia para un log
  const calculateAdherence = (adherence) => {
    const rules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
    const completed = rules.filter(rule => adherence[rule]).length;
    return Math.round((completed / rules.length) * 100);
  };

  // Formatear fecha para display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener color según severidad
  const getSeverityColor = (value) => {
    if (value <= 3) return 'text-dark-success';
    if (value <= 6) return 'text-yellow-500';
    return 'text-dark-alert';
  };

  // Generar prompt para Gemini
  const generateGeminiPrompt = () => {
    if (logs.length === 0) {
      alert('No hay registros para generar reporte');
      return;
    }

    // Agrupar logs por día
    const logsByDay = {};
    logs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString('es-ES');
      if (!logsByDay[date]) {
        logsByDay[date] = [];
      }
      logsByDay[date].push(log);
    });

    // Generar prompt estructurado
    let prompt = `=== DIGESTIVE SPEEDRUN TRACKER - REPORTE PARA ANÁLISIS CLÍNICO ===\n\n`;
    prompt += `Hola, soy un paciente siguiendo un protocolo de 14 días para recuperación intestinal (SIBO/FODMAPs, disbiosis, dolor en nervio frénico).\n\n`;
    prompt += `A continuación te presento mi registro detallado de adherencia y síntomas. Por favor, analiza los datos y proporciona:\n`;
    prompt += `1. Correlación entre adherencia al protocolo y mejora de síntomas\n`;
    prompt += `2. Patrones identificables (horarios, tipos de comida, etc.)\n`;
    prompt += `3. Recomendaciones específicas basadas en mis datos\n`;
    prompt += `4. Áreas de mejora en adherencia\n\n`;
    prompt += `=== REGISTRO DETALLADO ===\n\n`;

    Object.entries(logsByDay).forEach(([date, dayLogs]) => {
      prompt += `📅 ${date}\n`;
      prompt += `---\n`;
      dayLogs.forEach((log, index) => {
        const mealTypeLabel = log.mealType === 'solid' ? 'Sólida' : log.mealType === 'soft' ? 'Pastosa' : 'Líquida';
        const time = new Date(log.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        prompt += `🍽️ Registro ${index + 1} (${mealTypeLabel}) - ${time}\n`;
        prompt += `   Adherencia:\n`;
        prompt += `   - Arroz fresco: ${log.adherence.freshRice ? '✅' : '❌'}\n`;
        prompt += `   - Proteína blanda: ${log.adherence.softProtein ? '✅' : '❌'}\n`;
        prompt += `   - Sin edulcorantes: ${log.adherence.noSweeteners ? '✅' : '❌'}\n`;
        prompt += `   - Sin frío: ${log.adherence.noColdFood ? '✅' : '❌'}\n`;
        prompt += `   - Ayuno: ${log.adherence.fastingHours}h\n`;
        prompt += `   Síntomas:\n`;
        prompt += `   - Dolor frénico: ${log.symptoms.phrenicPain}/10\n`;
        prompt += `   - Distensión: ${log.symptoms.bloating}/10\n`;
        prompt += `   - Reflujo: ${log.symptoms.reflux}/10\n`;
        prompt += `   - Bristol: Tipo ${log.symptoms.bristolScale}\n`;
        if (log.notes) {
          prompt += `   Notas: ${log.notes}\n`;
        }
        prompt += `\n`;
      });
    });

    prompt += `=== FIN DEL REGISTRO ===\n\n`;
    prompt += `Por favor, proporciona tu análisis en un formato claro y estructurado.`;

    // Copiar al portapapeles
    navigator.clipboard.writeText(prompt).then(() => {
      alert('✅ Prompt copiado al portapapeles. Ahora puedes pegarlo en Gemini.');
    }).catch(() => {
      alert('❌ Error al copiar al portapapeles');
    });
  };

  // Borrar un log específico
  const deleteLog = (index) => {
    if (confirm('¿Estás seguro de borrar este log?')) {
      const newLogs = logs.filter((_, i) => i !== index);
      localStorage.setItem('digestive-logs', JSON.stringify(newLogs));
      // Forzar re-render
      window.location.reload();
    }
  };

  // Borrar todos los logs
  const deleteAllLogs = () => {
    if (confirm('¿Estás seguro de borrar TODOS los logs? Esta acción no se puede deshacer.')) {
      localStorage.setItem('digestive-logs', '[]');
      window.location.reload();
    }
  };

  if (logs.length === 0) {
    return (
      <div className="p-4 bg-dark-surface rounded-xl text-center">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No hay logs guardados aún</p>
        <p className="text-sm text-gray-500 mt-1">
          Guarda tu primer registro diario para ver el histórico
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Logs
        </h2>
        {logs.length > 0 && (
          <button
            onClick={deleteAllLogs}
            className="text-sm text-dark-alert hover:underline"
          >
            Borrar todos
          </button>
        )}
      </div>

      {/* Botones de exportación y análisis */}
      {logs.length > 0 && (
        <div className="space-y-2 mb-4">
          <button
            onClick={generateGeminiPrompt}
            className="w-full py-3 px-3 bg-dark-success text-white text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copiar Reporte para Gemini
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV()}
              className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportToSimpleCSV()}
              className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV Simple
            </button>
            <button
              onClick={() => exportToJSON()}
              className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>
      )}

      {logs.map((log, index) => {
        const adherence = calculateAdherence(log.adherence);
        const isExpanded = expandedLog === index;

        return (
          <div
            key={index}
            className="bg-dark-surface rounded-xl overflow-hidden"
          >
            {/* Header del log (siempre visible) */}
            <button
              onClick={() => setExpandedLog(isExpanded ? null : index)}
              className="w-full p-4 flex items-center justify-between touch-manipulation active:scale-[0.98] transition-transform"
            >
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-100">
                  {formatDate(log.date)}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-400">
                    {log.mealType === 'solid' ? '🍽️ Sólida' : log.mealType === 'soft' ? '🥣 Pastosa' : '🫖 Líquida'}
                  </span>
                  <span className={`text-sm ${adherence >= 75 ? 'text-dark-success' : adherence >= 50 ? 'text-yellow-500' : 'text-dark-alert'}`}>
                    Adherencia: {adherence}%
                  </span>
                  <span className={`text-sm ${getSeverityColor(log.symptoms.phrenicPain)}`}>
                    Dolor: {log.symptoms.phrenicPain}/10
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLog(index);
                  }}
                  className="p-2 text-gray-500 hover:text-dark-alert touch-manipulation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Detalles del log (expandible) */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-700">
                <div className="space-y-3">
                  {/* Adherencia */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Adherencia</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className={log.adherence.freshRice ? 'text-dark-success' : 'text-gray-500'}>
                        ✓ Arroz fresco
                      </span>
                      <span className={log.adherence.softProtein ? 'text-dark-success' : 'text-gray-500'}>
                        ✓ Proteína blanda
                      </span>
                      <span className={log.adherence.noSweeteners ? 'text-dark-success' : 'text-gray-500'}>
                        ✓ Sin edulcorantes
                      </span>
                      <span className={log.adherence.noColdFood ? 'text-dark-success' : 'text-gray-500'}>
                        ✓ Sin frío
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Ayuno: {log.adherence.fastingHours}h
                    </p>
                  </div>

                  {/* Síntomas */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Síntomas</p>
                    <div className="space-y-1 text-sm">
                      <p className={getSeverityColor(log.symptoms.phrenicPain)}>
                        Dolor frénico: {log.symptoms.phrenicPain}/10
                      </p>
                      <p className={getSeverityColor(log.symptoms.bloating)}>
                        Distensión: {log.symptoms.bloating}/10
                      </p>
                      <p className={getSeverityColor(log.symptoms.reflux)}>
                        Reflujo: {log.symptoms.reflux}/10
                      </p>
                      <p className="text-gray-400">
                        Bristol: Tipo {log.symptoms.bristolScale}
                      </p>
                    </div>
                  </div>

                  {/* Notas */}
                  {log.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Notas</p>
                      <p className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
                        {log.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/*
 * DECISIONES DE DISEÑO:
 * - Logs ordenados cronológicamente (más reciente primero)
 * - Expandible: Resumen visible, detalles al hacer tap
 * - Indicadores de color: Verde/amarillo/rojo para severidad
 * - Botón de borrar: Para corregir errores o eliminar datos de prueba
 *
 * FUTURO: Mejoras posibles:
 * - Añadir gráficos de evolución (Chart.js o similar)
 * - Añadir filtros por rango de fechas
 * - Añadir exportación a CSV/JSON
 * - Añadir comparación lado a lado de diferentes días
 * - Añadir estadísticas agregadas (promedio de síntomas, etc.)
 * - Añadir búsqueda en notas
 */