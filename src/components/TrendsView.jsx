import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  CheckCircle2,
  Info,
  Sparkles,
  ArrowRight,
  Flame,
  ShieldCheck,
} from 'lucide-react';

// ============================================================================
// TRENDS VIEW - EVOLUCIÓN TEMPORAL Y GRÁFICAS CLÍNICAS
// ============================================================================

/**
 * Visualizador interactivo de evolución temporal para el protocolo de 14 días.
 *
 * CARACTERÍSTICAS:
 * 1. Gráficas vectoriales SVG interactivas (sin dependencias pesadas):
 *    - Curvas de Síntomas: Dolor Frénico, Distensión/Hinchazón y Reflujo.
 *    - Curva de Adherencia: % de cumplimiento de reglas innegociables.
 *    - Escala Bristol: Consistencia con franja terapéutica óptima (Tipos 3-4).
 * 2. Agrupación temporal:
 *    - Por Día de Protocolo (Días 1 a 14 normalizados con promedios diarios).
 *    - Por Registro Individual (cronología detallada comida a comida).
 * 3. Insights clínicos automáticos:
 *    - Comparación de severidad entre primera y segunda mitad del protocolo.
 *    - Correlación adherencia vs. dolor abdominal.
 * 4. Puntos interactivos táctiles: detalle inmediato al pulsar cualquier punto.
 * 5. Modo demostración con datos de ejemplo cuando no hay logs suficientes.
 */

// Datos de demostración simulando una evolución típica de recuperación intestinal
const DEMO_LOGS = [
  {
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    mealType: 'soft',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: false, fastingHours: 12 },
    symptoms: { phrenicPain: 7, bloating: 8, reflux: 6, bristolScale: 2 },
    notes: 'Primer día: dolor punzante y distensión tras comer.',
  },
  {
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    mealType: 'soft',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 13 },
    symptoms: { phrenicPain: 6, bloating: 7, reflux: 5, bristolScale: 2 },
    notes: 'Mejor digestión con arroz recién hecho baboso.',
  },
  {
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    mealType: 'solid',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 14 },
    symptoms: { phrenicPain: 5, bloating: 6, reflux: 4, bristolScale: 3 },
    notes: 'Hinchazón reducida sensiblemente por la tarde.',
  },
  {
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    mealType: 'solid',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 14 },
    symptoms: { phrenicPain: 4, bloating: 5, reflux: 3, bristolScale: 3 },
    notes: 'Vaciado gástrico en 45 min sin reflujo.',
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    mealType: 'solid',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 13 },
    symptoms: { phrenicPain: 3, bloating: 4, reflux: 2, bristolScale: 4 },
    notes: 'Deposición tipo 4 ideal. Energía estable.',
  },
  {
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    mealType: 'solid',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 14 },
    symptoms: { phrenicPain: 2, bloating: 3, reflux: 1, bristolScale: 4 },
    notes: 'Dolor frénico prácticamente ausente.',
  },
  {
    date: new Date().toISOString(),
    mealType: 'solid',
    adherence: { freshRice: true, softProtein: true, noSweeteners: true, noColdFood: true, fastingHours: 14 },
    symptoms: { phrenicPain: 1, bloating: 2, reflux: 1, bristolScale: 4 },
    notes: 'Excelente tolerancia digestiva.',
  },
];

// Cálculo de porcentaje de adherencia de un log
function getLogAdherencePercent(adherence = {}) {
  const rules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
  const completed = rules.filter((rule) => adherence[rule]).length;
  return Math.round((completed / rules.length) * 100);
}

export function TrendsView({ startDate, onNavigateToDashboard }) {
  const [storedLogs, setStoredLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    } catch {
      return [];
    }
  });

  const [useDemoData, setUseDemoData] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms'); // 'symptoms' | 'adherence' | 'bristol' | 'insights'
  const [aggregationMode, setAggregationMode] = useState('daily'); // 'daily' | 'records'
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  // Escuchar cambios reactivos en los logs
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const updated = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
        setStoredLogs(updated);
      } catch (err) {
        console.error('Error reading digestive-logs in TrendsView:', err);
      }
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('digestive-logs-updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('digestive-logs-updated', handleUpdate);
    };
  }, []);

  // Determinar logs efectivos (reales o demo)
  const isUsingDemo = useDemoData || storedLogs.length === 0;
  const effectiveLogs = useMemo(() => {
    return isUsingDemo ? DEMO_LOGS : storedLogs;
  }, [isUsingDemo, storedLogs]);

  // Fecha de inicio del protocolo
  const protocolStartDate = startDate || '2026-01-01';

  // Procesamiento y ordenamiento cronológico de datos
  const processedData = useMemo(() => {
    if (!effectiveLogs || effectiveLogs.length === 0) return [];

    // Ordenar cronológicamente (más antiguo al más reciente)
    const sorted = [...effectiveLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (aggregationMode === 'records') {
      return sorted.map((log, index) => {
        const dateObj = new Date(log.date);
        const adherencePct = getLogAdherencePercent(log.adherence);
        return {
          id: `rec-${index}`,
          label: dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          subLabel: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          dateStr: dateObj.toLocaleString('es-ES'),
          phrenicPain: log.symptoms?.phrenicPain ?? 0,
          bloating: log.symptoms?.bloating ?? 0,
          reflux: log.symptoms?.reflux ?? 0,
          bristolScale: log.symptoms?.bristolScale ?? 4,
          adherencePct,
          mealType: log.mealType || 'solid',
          notes: log.notes || '',
          count: 1,
        };
      });
    }

    // Modo diario: agrupar por fecha local YYYY-MM-DD
    const start = new Date(protocolStartDate);
    start.setHours(0, 0, 0, 0);

    const dayGroups = new Map();

    sorted.forEach((log) => {
      const logDate = new Date(log.date);
      const localDateKey = logDate.toLocaleDateString('es-ES');

      const logMidnight = new Date(log.date);
      logMidnight.setHours(0, 0, 0, 0);
      const diffMs = logMidnight - start;
      const protocolDay = Math.max(1, Math.min(14, Math.floor(diffMs / 86400000) + 1));

      if (!dayGroups.has(localDateKey)) {
        dayGroups.set(localDateKey, {
          protocolDay,
          localDateKey,
          items: [],
        });
      }
      dayGroups.get(localDateKey).items.push(log);
    });

    const dailyPoints = [];
    dayGroups.forEach((group) => {
      const { protocolDay, localDateKey, items } = group;
      const count = items.length;

      const avgPain = items.reduce((acc, curr) => acc + (curr.symptoms?.phrenicPain ?? 0), 0) / count;
      const avgBloating = items.reduce((acc, curr) => acc + (curr.symptoms?.bloating ?? 0), 0) / count;
      const avgReflux = items.reduce((acc, curr) => acc + (curr.symptoms?.reflux ?? 0), 0) / count;
      const avgBristol = items.reduce((acc, curr) => acc + (curr.symptoms?.bristolScale ?? 4), 0) / count;
      const avgAdherence = items.reduce((acc, curr) => acc + getLogAdherencePercent(curr.adherence), 0) / count;

      dailyPoints.push({
        id: localDateKey,
        label: `Día ${protocolDay}`,
        subLabel: localDateKey,
        dateStr: localDateKey,
        phrenicPain: Math.round(avgPain * 10) / 10,
        bloating: Math.round(avgBloating * 10) / 10,
        reflux: Math.round(avgReflux * 10) / 10,
        bristolScale: Math.round(avgBristol * 10) / 10,
        adherencePct: Math.round(avgAdherence),
        count,
        notes: items.map((i) => i.notes).filter(Boolean).join(' | '),
      });
    });

    return dailyPoints;
  }, [effectiveLogs, aggregationMode, protocolStartDate]);

  // Selección automática o manual de punto
  const selectedPoint = useMemo(() => {
    if (processedData.length === 0) return null;
    if (selectedPointIndex !== null && processedData[selectedPointIndex]) {
      return processedData[selectedPointIndex];
    }
    return processedData[processedData.length - 1]; // Último por defecto
  }, [processedData, selectedPointIndex]);

  // KPIs y Análisis Clínico
  const clinicalSummary = useMemo(() => {
    if (processedData.length === 0) return null;

    const totalPoints = processedData.length;
    const avgAdherenceOverall = Math.round(
      processedData.reduce((acc, p) => acc + p.adherencePct, 0) / totalPoints
    );

    const avgPainOverall = Math.round(
      (processedData.reduce((acc, p) => acc + p.phrenicPain, 0) / totalPoints) * 10
    ) / 10;

    const avgBloatingOverall = Math.round(
      (processedData.reduce((acc, p) => acc + p.bloating, 0) / totalPoints) * 10
    ) / 10;

    // Comparar primera mitad vs segunda mitad para calcular tendencia
    const half = Math.max(1, Math.floor(totalPoints / 2));
    const firstHalf = processedData.slice(0, half);
    const secondHalf = processedData.slice(half);

    const painStart = firstHalf.reduce((acc, p) => acc + p.phrenicPain, 0) / firstHalf.length;
    const painEnd = secondHalf.length > 0
      ? secondHalf.reduce((acc, p) => acc + p.phrenicPain, 0) / secondHalf.length
      : painStart;

    const painDiff = Math.round((painEnd - painStart) * 10) / 10;
    const painImproved = painDiff < -0.3;
    const painWorsened = painDiff > 0.3;

    // Días en rango ideal Bristol (3 o 4)
    const idealBristolCount = processedData.filter(
      (p) => p.bristolScale >= 3 && p.bristolScale <= 4.5
    ).length;
    const idealBristolPct = Math.round((idealBristolCount / totalPoints) * 100);

    return {
      avgAdherenceOverall,
      avgPainOverall,
      avgBloatingOverall,
      painDiff,
      painImproved,
      painWorsened,
      idealBristolPct,
      totalEntries: processedData.length,
    };
  }, [processedData]);

  // Dimensiones del gráfico SVG
  const chartWidth = 560;
  const chartHeight = 220;
  const padding = { top: 25, right: 20, bottom: 40, left: 40 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Función auxiliar para mapear coordenadas
  const getCoordinates = (index, value, maxVal = 10, minVal = 0) => {
    const n = Math.max(1, processedData.length - 1);
    const x = padding.left + (index / n) * graphWidth;
    const range = maxVal - minVal || 1;
    const clamped = Math.max(minVal, Math.min(maxVal, value));
    const normalizedY = (clamped - minVal) / range;
    const y = padding.top + (1 - normalizedY) * graphHeight;
    return { x, y };
  };

  // Generador de caminos SVG (Línea + Área inferior sombreada)
  const generatePaths = (metricKey, maxVal = 10, minVal = 0) => {
    if (processedData.length === 0) return { linePath: '', areaPath: '', points: [] };

    const points = processedData.map((d, i) => getCoordinates(i, d[metricKey], maxVal, minVal));

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y}`,
        areaPath: `M ${p.x - 10} ${chartHeight - padding.bottom} L ${p.x - 10} ${p.y} L ${p.x + 10} ${p.y} L ${p.x + 10} ${chartHeight - padding.bottom} Z`,
        points,
      };
    }

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    const baselineY = chartHeight - padding.bottom;
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return { linePath, areaPath, points };
  };

  const painData = generatePaths('phrenicPain', 10, 0);
  const bloatingData = generatePaths('bloating', 10, 0);
  const refluxData = generatePaths('reflux', 10, 0);
  const adherenceData = generatePaths('adherencePct', 100, 0);
  const bristolData = generatePaths('bristolScale', 7, 1);

  return (
    <div className="space-y-6">
      {/* Banner de aviso cuando se usa modo demostración */}
      {isUsingDemo && (
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              {storedLogs.length === 0
                ? 'Visualizando datos de ejemplo del protocolo (aún no tienes logs guardados).'
                : 'Modo demostración activado.'}
            </span>
          </div>
          {storedLogs.length > 0 && (
            <button
              onClick={() => setUseDemoData(false)}
              className="px-2.5 py-1 bg-blue-700/80 hover:bg-blue-600 rounded text-white font-medium"
            >
              Ver mis logs ({storedLogs.length})
            </button>
          )}
        </div>
      )}

      {/* Selector de Pestañas de Métricas */}
      <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('symptoms')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
            activeTab === 'symptoms'
              ? 'bg-gray-800 text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-red-400" />
          Síntomas
        </button>
        <button
          onClick={() => setActiveTab('adherence')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
            activeTab === 'adherence'
              ? 'bg-gray-800 text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Adherencia
        </button>
        <button
          onClick={() => setActiveTab('bristol')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
            activeTab === 'bristol'
              ? 'bg-gray-800 text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-blue-400" />
          Bristol
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation ${
            activeTab === 'insights'
              ? 'bg-gray-800 text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Insights
        </button>
      </div>

      {/* Controles de Granularidad (Día a Día vs Registros Individuales) */}
      {activeTab !== 'insights' && (
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-gray-400">Agrupación temporal:</span>
          <div className="flex gap-1.5 bg-gray-900/80 p-0.5 rounded-lg border border-gray-800">
            <button
              onClick={() => {
                setAggregationMode('daily');
                setSelectedPointIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                aggregationMode === 'daily'
                  ? 'bg-gray-800 text-gray-100 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Por Día (1-14)
            </button>
            <button
              onClick={() => {
                setAggregationMode('records');
                setSelectedPointIndex(null);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                aggregationMode === 'records'
                  ? 'bg-gray-800 text-gray-100 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Comida a Comida
            </button>
          </div>
        </div>
      )}

      {/* Tarjeta del Gráfico Principal */}
      {activeTab !== 'insights' && (
        <div className="bg-dark-surface p-4 rounded-xl border border-gray-800 shadow-md">
          {/* Cabecera y leyenda del gráfico */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-800/60">
            <div>
              <h3 className="text-sm font-semibold text-gray-200">
                {activeTab === 'symptoms' && 'Tendencia de Síntomas Digestivos'}
                {activeTab === 'adherence' && 'Cumplimiento de Reglas Innegociables'}
                {activeTab === 'bristol' && 'Consistencia Fecal (Escala Bristol)'}
              </h3>
              <p className="text-[11px] text-gray-500">
                Toca cualquier punto del gráfico para ver los detalles
              </p>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-3 text-[11px]">
              {activeTab === 'symptoms' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-gray-300">Dolor Frénico</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-gray-300">Distensión</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-gray-300">Reflujo</span>
                  </div>
                </>
              )}
              {activeTab === 'adherence' && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-300">Adherencia (%)</span>
                </div>
              )}
              {activeTab === 'bristol' && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-300">Bristol (1-7)</span>
                  <span className="inline-block px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded text-[10px]">
                    Zona óptima: 3-4
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico Vectorial SVG */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none overflow-visible"
            >
              <defs>
                {/* Gradiente Dolor */}
                <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradiente Distensión */}
                <linearGradient id="bloatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradiente Adherencia */}
                <linearGradient id="adhGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>

                {/* Gradiente Bristol */}
                <linearGradient id="bristolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Cuadrícula horizontal y etiquetas eje Y */}
              {activeTab === 'symptoms' &&
                [0, 2.5, 5, 7.5, 10].map((val) => {
                  const y = padding.top + (1 - val / 10) * graphHeight;
                  return (
                    <g key={`y-sym-${val}`}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#374151"
                        strokeDasharray={val === 0 || val === 10 ? 'none' : '3 3'}
                        strokeOpacity={val === 0 || val === 10 ? 0.6 : 0.3}
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3.5}
                        fill="#9CA3AF"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

              {activeTab === 'adherence' &&
                [0, 25, 50, 75, 100].map((val) => {
                  const y = padding.top + (1 - val / 100) * graphHeight;
                  return (
                    <g key={`y-adh-${val}`}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#374151"
                        strokeDasharray={val === 0 || val === 100 ? 'none' : '3 3'}
                        strokeOpacity={val === 0 || val === 100 ? 0.6 : 0.3}
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3.5}
                        fill="#9CA3AF"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

              {activeTab === 'bristol' && (
                <>
                  {/* Zona de confort terapéutico sombreada (Tipos 3 y 4) */}
                  {(() => {
                    const topY = padding.top + (1 - (4 - 1) / 6) * graphHeight;
                    const bottomY = padding.top + (1 - (3 - 1) / 6) * graphHeight;
                    return (
                      <rect
                        x={padding.left}
                        y={topY}
                        width={graphWidth}
                        height={bottomY - topY}
                        fill="#10B981"
                        fillOpacity="0.12"
                      />
                    );
                  })()}

                  {[1, 2, 3, 4, 5, 6, 7].map((val) => {
                    const y = padding.top + (1 - (val - 1) / 6) * graphHeight;
                    return (
                      <g key={`y-bristol-${val}`}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#374151"
                          strokeDasharray={val === 1 || val === 7 ? 'none' : '2 3'}
                          strokeOpacity={0.3}
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3.5}
                          fill={val === 3 || val === 4 ? '#34D399' : '#9CA3AF'}
                          fontSize="9"
                          fontWeight={val === 3 || val === 4 ? 'bold' : 'normal'}
                          textAnchor="end"
                        >
                          T{val}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

              {/* Curvas y áreas según la pestaña activa */}
              {activeTab === 'symptoms' && (
                <>
                  {/* Área y línea Dolor Frénico */}
                  <path d={painData.areaPath} fill="url(#painGrad)" />
                  <path
                    d={painData.linePath}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Área y línea Distensión */}
                  <path d={bloatingData.areaPath} fill="url(#bloatGrad)" />
                  <path
                    d={bloatingData.linePath}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Línea Reflujo */}
                  <path
                    d={refluxData.linePath}
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {activeTab === 'adherence' && (
                <>
                  <path d={adherenceData.areaPath} fill="url(#adhGrad)" />
                  <path
                    d={adherenceData.linePath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {activeTab === 'bristol' && (
                <>
                  <path d={bristolData.areaPath} fill="url(#bristolGrad)" />
                  <path
                    d={bristolData.linePath}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Puntos interactivos con objetivo táctil amplio */}
              {processedData.map((d, index) => {
                let primaryY;
                let color;
                if (activeTab === 'symptoms') {
                  primaryY = painData.points[index]?.y;
                  color = '#EF4444';
                } else if (activeTab === 'adherence') {
                  primaryY = adherenceData.points[index]?.y;
                  color = '#10B981';
                } else {
                  primaryY = bristolData.points[index]?.y;
                  color = '#3B82F6';
                }

                const posX = painData.points[index]?.x || padding.left;
                const isSelected = selectedPoint && selectedPoint.id === d.id;

                return (
                  <g
                    key={d.id}
                    onClick={() => setSelectedPointIndex(index)}
                    className="cursor-pointer touch-manipulation group"
                  >
                    {/* Línea vertical de guía para punto seleccionado */}
                    {isSelected && (
                      <line
                        x1={posX}
                        y1={padding.top}
                        x2={posX}
                        y2={chartHeight - padding.bottom}
                        stroke="#6B7280"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}

                    {/* Halo de selección */}
                    {isSelected && (
                      <circle
                        cx={posX}
                        cy={primaryY}
                        r="8"
                        fill={color}
                        fillOpacity="0.25"
                      />
                    )}

                    {/* Círculo central */}
                    <circle
                      cx={posX}
                      cy={primaryY}
                      r={isSelected ? '4.5' : '3.5'}
                      fill={color}
                      stroke="#1E1E1E"
                      strokeWidth="1.5"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Área invisible grande para facilitar el toque táctil */}
                    <rect
                      x={posX - 16}
                      y={padding.top}
                      width={32}
                      height={graphHeight}
                      fill="transparent"
                    />

                    {/* Etiqueta Eje X debajo del punto */}
                    <text
                      x={posX}
                      y={chartHeight - 16}
                      fill={isSelected ? '#F3F4F6' : '#9CA3AF'}
                      fontSize={isSelected ? '10' : '9'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tarjeta de detalle del punto seleccionado */}
          {selectedPoint && (
            <div className="mt-3 p-3 bg-gray-900/90 rounded-lg border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-200">
                    {selectedPoint.label} ({selectedPoint.subLabel})
                  </span>
                  {selectedPoint.count > 1 && (
                    <span className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px]">
                      {selectedPoint.count} comidas promedio
                    </span>
                  )}
                </div>
                {selectedPoint.notes ? (
                  <p className="text-gray-400 italic text-[11px] line-clamp-2">
                    &ldquo;{selectedPoint.notes}&rdquo;
                  </p>
                ) : (
                  <p className="text-gray-500 text-[11px]">Sin notas adicionales</p>
                )}
              </div>

              {/* Valores del punto */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-2 py-1 bg-gray-800/80 rounded border border-gray-700/50">
                  <div className="text-[10px] text-gray-400">Dolor</div>
                  <div className="font-bold text-red-400">{selectedPoint.phrenicPain} / 10</div>
                </div>
                <div className="text-center px-2 py-1 bg-gray-800/80 rounded border border-gray-700/50">
                  <div className="text-[10px] text-gray-400">Hinchazón</div>
                  <div className="font-bold text-amber-400">{selectedPoint.bloating} / 10</div>
                </div>
                <div className="text-center px-2 py-1 bg-gray-800/80 rounded border border-gray-700/50">
                  <div className="text-[10px] text-gray-400">Adherencia</div>
                  <div className="font-bold text-emerald-400">{selectedPoint.adherencePct}%</div>
                </div>
                <div className="text-center px-2 py-1 bg-gray-800/80 rounded border border-gray-700/50">
                  <div className="text-[10px] text-gray-400">Bristol</div>
                  <div className="font-bold text-blue-400">T{selectedPoint.bristolScale}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista de Insights y Resumen Clínico */}
      {(activeTab === 'insights' || activeTab === 'symptoms') && clinicalSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tarjeta de Tendencia de Dolor */}
          <div className="p-3.5 bg-dark-surface rounded-xl border border-gray-800 flex items-start gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                clinicalSummary.painImproved
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                  : clinicalSummary.painWorsened
                  ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {clinicalSummary.painImproved ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <TrendingUp className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-xs text-gray-200">
                {clinicalSummary.painImproved
                  ? 'Evolución Positiva del Dolor'
                  : clinicalSummary.painWorsened
                  ? 'Incremento Reciente de Síntomas'
                  : 'Dolor Estable'}
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                {clinicalSummary.painImproved
                  ? `El dolor frénico se redujo en ${Math.abs(clinicalSummary.painDiff)} puntos promedio entre la primera y última etapa registrada.`
                  : clinicalSummary.painWorsened
                  ? `Se observa una elevación de ${clinicalSummary.painDiff} puntos en el dolor. Revisa posible almidón resistente o transgresiones.`
                  : 'Los niveles de dolor se mantienen constantes. Mantén la regularidad en el ayuno y las temperaturas.'}
              </p>
            </div>
          </div>

          {/* Tarjeta de Consistencia Fecal Bristol */}
          <div className="p-3.5 bg-dark-surface rounded-xl border border-gray-800 flex items-start gap-3">
            <div className="p-2 bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-gray-200">
                Consistencia Bristol Óptima
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                El <strong className="text-blue-300">{clinicalSummary.idealBristolPct}%</strong> de
                los registros se encuentran en el rango fisiológico ideal (Tipos 3 y 4).
              </p>
            </div>
          </div>

          {/* Tarjeta de Adherencia Media */}
          <div className="p-3.5 bg-dark-surface rounded-xl border border-gray-800 flex items-start gap-3">
            <div className="p-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-gray-200">
                Adherencia Protocolar Global: {clinicalSummary.avgAdherenceOverall}%
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                {clinicalSummary.avgAdherenceOverall >= 80
                  ? 'Nivel de disciplina excelente. Facilita la reversión de disbiosis y el vaciado gástrico adecuado.'
                  : 'Procura reforzar el arroz recién hecho y evitar el almidón resistente para optimizar resultados.'}
              </p>
            </div>
          </div>

          {/* Tarjeta de Distensión Abdominal Media */}
          <div className="p-3.5 bg-dark-surface rounded-xl border border-gray-800 flex items-start gap-3">
            <div className="p-2 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded-lg shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-gray-200">
                Distensión Media: {clinicalSummary.avgBloatingOverall} / 10
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Dolor frénico promedio de {clinicalSummary.avgPainOverall}/10 en los {clinicalSummary.totalEntries} periodos analizados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de alternancia para modo demo si el usuario tiene registros */}
      {storedLogs.length > 0 && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setUseDemoData(!useDemoData)}
            className="text-xs text-gray-400 hover:text-gray-300 underline underline-offset-4"
          >
            {useDemoData ? 'Volver a mis datos reales' : 'Previsualizar curva de recuperación de ejemplo'}
          </button>
        </div>
      )}

      {/* Si no hay registros guardados y está en modo dashboard */}
      {storedLogs.length === 0 && onNavigateToDashboard && (
        <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 text-center">
          <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-200">Comienza a registrar tu protocolo</h4>
          <p className="text-xs text-gray-400 mt-1 mb-3">
            Cada vez que guardas un registro en el Dashboard, tus síntomas y adherencia se graficarán automáticamente aquí.
          </p>
          <button
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-dark-success hover:bg-emerald-600 text-white rounded-lg text-xs font-medium"
          >
            Ir al Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
