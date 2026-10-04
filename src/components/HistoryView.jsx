import { useState, useEffect } from 'react';
import {
  History,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Copy,
  Pencil,
  Check,
  X,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { exportToJSON, exportToCSV, exportToSimpleCSV } from '../utils/exportData';
import { Toggle } from './Toggle';
import { Slider } from './Slider';
import { BristolScale } from './BristolScale';
import { MealTypeSelector } from './MealTypeSelector';

// ============================================================================
// COMPONENTE: HistoryView
// ============================================================================

/**
 * Componente para visualizar y gestionar el histórico de logs diarios.
 * Incluye filtros avanzados (por comida y condición clínica) y edición completa de registros.
 *
 * @returns {JSX.Element}
 */
export function HistoryView() {
  const [expandedLog, setExpandedLog] = useState(null);
  const [editingDate, setEditingDate] = useState(null); // Fecha del log que se está editando
  const [editForm, setEditForm] = useState(null); // Estado temporal del log en edición

  // Estados de filtros
  const [mealFilter, setMealFilter] = useState('all'); // 'all' | 'solid' | 'soft' | 'liquid'
  const [conditionFilter, setConditionFilter] = useState('all'); // 'all' | 'alert' | 'low-adherence'

  // Leer logs de localStorage
  const readLogs = () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  };

  const [logs, setLogs] = useState(readLogs);

  // Sincronizar logs cuando cambian en la pestaña actual o en otras pestañas
  useEffect(() => {
    const handleUpdate = () => {
      setLogs(readLogs());
    };
    window.addEventListener('digestive-logs-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('digestive-logs-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Calcular porcentaje de adherencia para un log
  const calculateAdherence = (adherence = {}) => {
    const rules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
    const completed = rules.filter((rule) => adherence[rule]).length;
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
  const getSeverityColor = (value = 0) => {
    if (value <= 3) return 'text-dark-success';
    if (value <= 6) return 'text-yellow-500';
    return 'text-dark-alert';
  };

  // Generar prompt para Gemini
  const generateGeminiPrompt = (fullHistory = false) => {
    let logsToUse = logs;

    if (!fullHistory) {
      const today = new Date().toLocaleDateString('es-ES');
      logsToUse = logs.filter(
        (log) => new Date(log.date).toLocaleDateString('es-ES') === today
      );
    }

    if (logsToUse.length === 0) {
      alert(
        fullHistory
          ? 'No hay registros para generar reporte completo'
          : 'No hay registros de hoy para generar reporte'
      );
      return;
    }

    const logsByDay = {};
    logsToUse.forEach((log) => {
      const date = new Date(log.date).toLocaleDateString('es-ES');
      if (!logsByDay[date]) {
        logsByDay[date] = [];
      }
      logsByDay[date].push(log);
    });

    let prompt = `=== DIGESTIVE SPEEDRUN TRACKER - REPORTE PARA ANÁLISIS CLÍNICO ===\n\n`;
    prompt += `Hola, soy un paciente siguiendo un protocolo de 14 días para recuperación intestinal (SIBO/FODMAPs, disbiosis, dolor en nervio frénico).\n\n`;
    prompt += `A continuación te presento mi registro detallado de adherencia y síntomas${
      fullHistory ? ' desde el día 1 hasta hoy' : ' de hoy'
    }. Por favor, analiza los datos y proporciona:\n`;
    prompt += `1. Correlación entre adherencia al protocolo y mejora de síntomas\n`;
    prompt += `2. Patrones identificables (horarios, tipos de comida, etc.)\n`;
    prompt += `3. Recomendaciones específicas basadas en mis datos\n`;
    prompt += `4. Áreas de mejora en adherencia\n\n`;
    prompt += `=== REGISTRO DETALLADO ===\n\n`;

    Object.entries(logsByDay).forEach(([date, dayLogs]) => {
      prompt += `📅 ${date}\n`;
      prompt += `---\n`;
      dayLogs.forEach((log, index) => {
        const mealTypeLabel =
          log.mealType === 'solid'
            ? 'Sólida'
            : log.mealType === 'soft'
              ? 'Pastosa'
              : 'Líquida';
        const time = new Date(log.date).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });

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

    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        alert(
          fullHistory
            ? '✅ Reporte completo copiado al portapapeles'
            : '✅ Reporte de hoy copiado al portapapeles'
        );
      })
      .catch(() => {
        alert('❌ Error al copiar al portapapeles');
      });
  };

  // Iniciar edición de un registro
  const startEditing = (log) => {
    setEditingDate(log.date);
    setEditForm({
      date: log.date,
      mealType: log.mealType || 'solid',
      adherence: { ...log.adherence },
      symptoms: { ...log.symptoms },
      notes: log.notes || '',
    });
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingDate(null);
    setEditForm(null);
  };

  // Guardar cambios de edición
  const saveEditing = () => {
    if (!editForm || !editingDate) return;

    const newLogs = logs.map((log) => (log.date === editingDate ? editForm : log));
    localStorage.setItem('digestive-logs', JSON.stringify(newLogs));
    setLogs(newLogs);
    window.dispatchEvent(new Event('digestive-logs-updated'));

    setEditingDate(null);
    setEditForm(null);
  };

  // Borrar un log específico por fecha
  const deleteLogByDate = (date) => {
    if (confirm('¿Estás seguro de borrar este registro?')) {
      const newLogs = logs.filter((log) => log.date !== date);
      localStorage.setItem('digestive-logs', JSON.stringify(newLogs));
      setLogs(newLogs);
      window.dispatchEvent(new Event('digestive-logs-updated'));
      if (editingDate === date) {
        cancelEditing();
      }
    }
  };

  // Borrar todos los logs
  const deleteAllLogs = () => {
    if (confirm('¿Estás seguro de borrar TODOS los logs? Esta acción no se puede deshacer.')) {
      localStorage.setItem('digestive-logs', '[]');
      setLogs([]);
      window.dispatchEvent(new Event('digestive-logs-updated'));
      cancelEditing();
    }
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setMealFilter('all');
    setConditionFilter('all');
  };

  // Aplicar filtros
  const filteredLogs = logs.filter((log) => {
    // 1. Filtro por tipo de comida
    if (mealFilter !== 'all' && log.mealType !== mealFilter) {
      return false;
    }

    // 2. Filtro por condición clínica / alertas
    if (conditionFilter === 'alert') {
      const phrenic = log.symptoms?.phrenicPain || 0;
      const bloating = log.symptoms?.bloating || 0;
      const reflux = log.symptoms?.reflux || 0;
      if (phrenic <= 5 && bloating <= 5 && reflux <= 5) return false;
    } else if (conditionFilter === 'low-adherence') {
      const adherence = calculateAdherence(log.adherence);
      if (adherence >= 75) return false;
    }

    return true;
  });

  const isFiltered = mealFilter !== 'all' || conditionFilter !== 'all';

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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
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

      {/* Botones de exportación y análisis LLM */}
      <div className="space-y-2">
        <button
          onClick={() => generateGeminiPrompt(false)}
          className="w-full py-3 px-3 bg-dark-success text-white text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-medium"
        >
          <Copy className="w-4 h-4" />
          Copiar Reporte de Hoy
        </button>
        <button
          onClick={() => generateGeminiPrompt(true)}
          className="w-full py-3 px-3 bg-blue-600 text-white text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2 font-medium"
        >
          <Copy className="w-4 h-4" />
          Copiar Reporte Completo (Día 1 hasta hoy)
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV()}
            className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportToSimpleCSV()}
            className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            CSV Simple
          </button>
          <button
            onClick={() => exportToJSON()}
            className="flex-1 py-2 px-3 bg-gray-800 text-gray-300 text-sm rounded-lg touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Barra de filtros interactivos */}
      <div className="p-3 bg-dark-surface rounded-xl space-y-3 border border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filtros rápidos</span>
          </div>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filtro por tipo de ingesta */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'solid', label: '🍽️ Sólidas' },
            { id: 'soft', label: '🥣 Pastosas' },
            { id: 'liquid', label: '🫖 Líquidas' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMealFilter(item.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                mealFilter === item.id
                  ? 'bg-dark-success text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Filtro por condición clínica */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Cualquier estado' },
            { id: 'alert', label: '⚠️ Alertas (Síntomas > 5)' },
            { id: 'low-adherence', label: '📉 Adherencia < 75%' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setConditionFilter(item.id)}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                conditionFilter === item.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Resumen de conteo */}
        <div className="text-xs text-gray-400 pt-1 border-t border-gray-800 flex justify-between items-center">
          <span>
            Mostrando <strong className="text-gray-200">{filteredLogs.length}</strong> de {logs.length} registros
          </span>
          {isFiltered && (
            <span className="text-amber-400/90 font-medium">Filtro activo</span>
          )}
        </div>
      </div>

      {/* Lista de registros filtrados */}
      {filteredLogs.length === 0 ? (
        <div className="p-6 bg-dark-surface rounded-xl text-center space-y-2 border border-gray-800">
          <p className="text-gray-300 font-medium">No hay registros con los filtros seleccionados</p>
          <p className="text-xs text-gray-500">
            Prueba a cambiar el tipo de ingesta o borrar los filtros activos
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 text-xs py-1.5 px-3 bg-gray-800 text-emerald-400 rounded-lg hover:bg-gray-700 inline-block"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        filteredLogs.map((log) => {
          const adherence = calculateAdherence(log.adherence);
          const isExpanded = expandedLog === log.date;
          const isEditing = editingDate === log.date;

          return (
            <div
              key={log.date}
              className={`bg-dark-surface rounded-xl overflow-hidden border transition-all ${
                isEditing
                  ? 'border-blue-500/70 shadow-lg shadow-blue-500/10'
                  : 'border-transparent'
              }`}
            >
              {/* Header del log (siempre visible) */}
              <button
                onClick={() => {
                  if (isEditing) return;
                  setExpandedLog(isExpanded ? null : log.date);
                }}
                className="w-full p-4 flex items-center justify-between touch-manipulation active:scale-[0.99] transition-transform text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-100">{formatDate(log.date)}</p>
                    {isEditing && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 py-0.5 px-2 rounded-full font-medium">
                        En edición
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-sm text-gray-400">
                      {log.mealType === 'solid'
                        ? '🍽️ Sólida'
                        : log.mealType === 'soft'
                          ? '🥣 Pastosa'
                          : '🫖 Líquida'}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        adherence >= 75
                          ? 'text-dark-success'
                          : adherence >= 50
                            ? 'text-yellow-500'
                            : 'text-dark-alert'
                      }`}
                    >
                      Adherencia: {adherence}%
                    </span>
                    <span
                      className={`text-sm font-medium ${getSeverityColor(
                        log.symptoms?.phrenicPain
                      )}`}
                    >
                      Dolor: {log.symptoms?.phrenicPain ?? 0}/10
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  {!isEditing && (
                    <>
                      <button
                        title="Editar registro"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLog(log.date);
                          startEditing(log);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 touch-manipulation rounded-lg hover:bg-gray-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        title="Borrar registro"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLogByDate(log.date);
                        }}
                        className="p-2 text-gray-400 hover:text-dark-alert touch-manipulation rounded-lg hover:bg-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {!isEditing && (
                    <div className="p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Modo Edición Inline */}
              {isEditing && editForm && (
                <div className="p-4 border-t border-gray-700/60 bg-gray-900/60 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="text-sm font-medium text-blue-400 flex items-center gap-1.5">
                      <Pencil className="w-4 h-4" />
                      Modificar registro
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEditing}
                        className="py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancelar
                      </button>
                      <button
                        onClick={saveEditing}
                        className="py-1.5 px-3 bg-dark-success hover:bg-emerald-600 text-white text-xs font-medium rounded-lg flex items-center gap-1 shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Guardar cambios
                      </button>
                    </div>
                  </div>

                  {/* Consistencia de comida */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Tipo de Ingesta
                    </label>
                    <MealTypeSelector
                      value={editForm.mealType}
                      onChange={(val) => setEditForm({ ...editForm, mealType: val })}
                    />
                  </div>

                  {/* Adherencia */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-400">
                      Reglas de Adherencia
                    </label>
                    <div className="space-y-2">
                      <Toggle
                        label="Arroz recién hecho y baboso"
                        description="Evitar almidón resistente"
                        value={editForm.adherence.freshRice}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            adherence: { ...editForm.adherence, freshRice: val },
                          })
                        }
                      />
                      <Toggle
                        label="Proteína escalfada/blanda"
                        description="Muy blanda, escalfada"
                        value={editForm.adherence.softProtein}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            adherence: { ...editForm.adherence, softProtein: val },
                          })
                        }
                      />
                      <Toggle
                        label="Cero edulcorantes artificiales"
                        description="Sin sucralosa ni similares"
                        value={editForm.adherence.noSweeteners}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            adherence: { ...editForm.adherence, noSweeteners: val },
                          })
                        }
                      />
                      <Toggle
                        label="Cero alimentos/bebidas frías"
                        description="Todo tibio o caliente"
                        value={editForm.adherence.noColdFood}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            adherence: { ...editForm.adherence, noColdFood: val },
                          })
                        }
                      />
                      <Slider
                        label="Horas de ayuno nocturno"
                        description="Objetivo: >12h"
                        value={editForm.adherence.fastingHours}
                        onChange={(val) =>
                          setEditForm({
                            ...editForm,
                            adherence: { ...editForm.adherence, fastingHours: val },
                          })
                        }
                        min={6}
                        max={16}
                        reverseColor={true}
                      />
                    </div>
                  </div>

                  {/* Síntomas */}
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-gray-400">
                      Evaluación de Síntomas
                    </label>
                    <Slider
                      label="Dolor Nervio Frénico"
                      description="Pinzamiento clavícula derecha"
                      value={editForm.symptoms.phrenicPain}
                      onChange={(val) =>
                        setEditForm({
                          ...editForm,
                          symptoms: { ...editForm.symptoms, phrenicPain: val },
                        })
                      }
                    />
                    <Slider
                      label="Distensión Abdominal / Gas"
                      description="Sensación de hinchazón"
                      value={editForm.symptoms.bloating}
                      onChange={(val) =>
                        setEditForm({
                          ...editForm,
                          symptoms: { ...editForm.symptoms, bloating: val },
                        })
                      }
                    />
                    <Slider
                      label="Reflujo / Acidez"
                      description="Sensación de ardor"
                      value={editForm.symptoms.reflux}
                      onChange={(val) =>
                        setEditForm({
                          ...editForm,
                          symptoms: { ...editForm.symptoms, reflux: val },
                        })
                      }
                    />
                    <BristolScale
                      value={editForm.symptoms.bristolScale}
                      onChange={(val) =>
                        setEditForm({
                          ...editForm,
                          symptoms: { ...editForm.symptoms, bristolScale: val },
                        })
                      }
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Notas y Observaciones
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) =>
                        setEditForm({ ...editForm, notes: e.target.value })
                      }
                      placeholder="Observaciones de este registro..."
                      className="w-full p-3 bg-gray-800 text-gray-100 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-dark-success text-sm"
                    />
                  </div>

                  {/* Botones de acción inferiores */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 py-2.5 px-3 bg-gray-800 text-gray-300 font-medium rounded-lg text-sm touch-manipulation hover:bg-gray-700"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={saveEditing}
                      className="flex-1 py-2.5 px-3 bg-dark-success text-white font-bold rounded-lg text-sm touch-manipulation hover:bg-emerald-600 flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" />
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {/* Vista Detalle Expandible (Modo Lectura) */}
              {isExpanded && !isEditing && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                  {/* Adherencia */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Adherencia
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span
                        className={
                          log.adherence?.freshRice
                            ? 'text-dark-success font-medium'
                            : 'text-gray-500'
                        }
                      >
                        ✓ Arroz fresco
                      </span>
                      <span
                        className={
                          log.adherence?.softProtein
                            ? 'text-dark-success font-medium'
                            : 'text-gray-500'
                        }
                      >
                        ✓ Proteína blanda
                      </span>
                      <span
                        className={
                          log.adherence?.noSweeteners
                            ? 'text-dark-success font-medium'
                            : 'text-gray-500'
                        }
                      >
                        ✓ Sin edulcorantes
                      </span>
                      <span
                        className={
                          log.adherence?.noColdFood
                            ? 'text-dark-success font-medium'
                            : 'text-gray-500'
                        }
                      >
                        ✓ Sin frío
                      </span>
                      {log.adherence?.supplements !== undefined && (
                        <span
                          className={
                            log.adherence?.supplements
                              ? 'text-dark-success font-medium'
                              : 'text-gray-500'
                          }
                        >
                          ✓ Suplementos
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span>Ayuno: <strong className="text-gray-200">{log.adherence?.fastingHours ?? 12}h</strong></span>
                      {log.adherence?.mealTime && (
                        <span>Horario: <strong className="text-gray-200">{log.adherence.mealTime}</strong></span>
                      )}
                      {log.adherence?.mealLocation && (
                        <span>Lugar: <strong className="text-gray-200">{log.adherence.mealLocation === 'home' ? 'Casa' : log.adherence.mealLocation === 'work' ? 'Trabajo' : 'Fuera'}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Síntomas */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Síntomas
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className={getSeverityColor(log.symptoms?.phrenicPain)}>
                        Dolor frénico: <strong className="text-gray-100">{log.symptoms?.phrenicPain ?? 0}/10</strong>
                      </p>
                      <p className={getSeverityColor(log.symptoms?.bloating)}>
                        Distensión: <strong className="text-gray-100">{log.symptoms?.bloating ?? 0}/10</strong>
                      </p>
                      <p className={getSeverityColor(log.symptoms?.reflux)}>
                        Reflujo: <strong className="text-gray-100">{log.symptoms?.reflux ?? 0}/10</strong>
                      </p>
                      <p className="text-gray-300">
                        Bristol: <strong className="text-gray-100">Tipo {log.symptoms?.bristolScale ?? 4}</strong>
                      </p>
                      {log.symptoms?.energy !== undefined && (
                        <p className="text-gray-300">
                          Energía: <strong className="text-gray-100">{log.symptoms.energy}/10</strong>
                        </p>
                      )}
                      {log.symptoms?.stress !== undefined && (
                        <p className="text-gray-300">
                          Estrés: <strong className="text-gray-100">{log.symptoms.stress}/10</strong>
                        </p>
                      )}
                      {log.symptoms?.sleep !== undefined && (
                        <p className="text-gray-300">
                          Sueño: <strong className="text-gray-100">{log.symptoms.sleep}/10</strong>
                        </p>
                      )}
                      {log.symptoms?.bowelMovements !== undefined && (
                        <p className="text-gray-300">
                          Deposiciones: <strong className="text-gray-100">{log.symptoms.bowelMovements}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notas */}
                  {log.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Notas
                      </p>
                      <p className="text-sm text-gray-300 bg-gray-800/80 p-3 rounded-lg border border-gray-700/40">
                        {log.notes}
                      </p>
                    </div>
                  )}

                  {/* Botón para editar directamente desde la vista detallada */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => startEditing(log)}
                      className="py-1.5 px-3 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-gray-700/60"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar este registro
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
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