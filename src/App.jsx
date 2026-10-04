import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { useProtocolDate } from './hooks/useProtocolDate';
import { useFieldConfig } from './hooks/useFieldConfig';
import { useDailySummary } from './hooks/useDailySummary';
import { Toggle } from './components/Toggle';
import { Slider } from './components/Slider';
import { GastricTimer } from './components/GastricTimer';
import { BristolScale } from './components/BristolScale';
import { ProtocolSettings } from './components/ProtocolSettings';
import { HistoryView } from './components/HistoryView';
import { ProgressBar } from './components/ProgressBar';
import { ViewTransition } from './components/ViewTransition';
import { Toast } from './components/Toast';
import { MealTypeSelector } from './components/MealTypeSelector';
import { FieldConfig } from './components/FieldConfig';
import { ResetProtocol } from './components/ResetProtocol';
import { BackupRestore } from './components/BackupRestore';
import { Bell, Calendar, Save, Settings, History as HistoryIcon, Sliders, TrendingUp, Clock } from 'lucide-react';

// ============================================================================
// APP.JSX - COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Digestive SpeedRun Tracker - Dashboard principal
 *
 * OBJETIVO CLÍNICO:
 * - Tracking de protocolo de 14 días para reversión de disbiosis intestinal
 * - Monitoreo de adherencia a reglas innegociables
 * - Registro de síntomas para correlación causa-efecto
 * - Timer de vaciado gástrico para timing de infusiones

 * ARQUITECTURA:
 * - Estado global distribuido en localStorage (sin backend)
 * - Custom hooks para persistencia y notificaciones
 * - Componentes atómicos reutilizables (Toggle, Slider, etc.)
 * - Diseño mobile-first optimizado para uso con una mano

 * MÓDULOS:
 * 1. Header: Título + contador de días del protocolo
 * 2. Timer: Cuenta atrás de 45 min para vaciado gástrico
 * 3. Adherencia: Toggles de reglas diarias + slider de ayuno
 * 4. Síntomas: Sliders de dolor + escala Bristol
 * 5. Notas: Campo libre para observaciones
 * 6. Guardar: Persiste el log diario en localStorage

 * PERSISTENCIA:
 * - Estado reactivo se guarda automáticamente en localStorage
 * - Logs históricos en 'digestive-logs' (array de objetos)
 * - Survive refresh del navegador
 */

// ============================================================================
// ESTADO INICIAL - ADHERENCIA
// ============================================================================
const initialAdherence = {
  freshRice: false,           // Arroz recién hecho y baboso (evitar almidón resistente)
  softProtein: false,         // Proteína escalfada/blanda
  noSweeteners: false,        // Cero edulcorantes artificiales (sucralosa)
  noColdFood: false,          // Cero alimentos/bebidas frías
  fastingHours: 12,           // Horas de ayuno nocturno (objetivo >12h)
  supplements: false,         // Suplementos activos (enzimas, probióticos)
  mealTime: '',               // Horario de comida
  mealLocation: 'home',       // Lugar comida (casa, trabajo, restaurante)
};

// ============================================================================
// ESTADO INICIAL - SÍNTOMAS
// ============================================================================
const initialSymptoms = {
  phrenicPain: 0,             // Dolor/pinzamiento nervio frénico (0-10)
  bloating: 0,                // Distensión abdominal / gas (0-10)
  reflux: 0,                  // Reflujo / acidez (0-10)
  bristolScale: 4,            // Escala de Bristol (1-7, 4 = ideal)
  energy: 5,                  // Nivel de energía (0-10)
  sleep: 5,                   // Calidad de sueño (0-10)
  stress: 3,                  // Nivel de estrés (0-10)
  bowelMovements: 1,          // Movimientos intestinales / deposiciones al día
};

function App() {
  // ============================================================================
  // ESTADO LOCAL - PERSISTENCIA AUTOMÁTICA
  // ============================================================================
  const [adherence, setAdherence] = useLocalStorage('digestive-adherence', initialAdherence);
  const [symptoms, setSymptoms] = useLocalStorage('digestive-symptoms', initialSymptoms);
  const [notes, setNotes] = useLocalStorage('digestive-notes', '');

  // Hook para notificaciones push
  const { permission, requestPermission, showNotification } = useNotifications();

  // Hook para fecha de inicio del protocolo
  const { startDate, currentDay, setStartDate } = useProtocolDate();

  // Hook para configuración de campos
  const { config, toggleField, getActiveFields, isFieldActive, AVAILABLE_FIELDS } = useFieldConfig();

  // Hook para summary del día
  const { adherence: dailyAdherence, timeAgo, hasLogsToday, logCount } = useDailySummary();

  // Estado para la vista actual (dashboard vs histórico vs settings)
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'history' | 'settings'
  
  // Estado para notificaciones toast (feedback visual)
  const [toast, setToast] = useState(null); // { message, type } | null
  
  // Estado para tipo de comida del registro actual
  const [mealType, setMealType] = useState('solid'); // 'solid' | 'soft' | 'liquid'

  // ============================================================================
  // HANDLERS - LÓGICA DE NEGOCIO
  // ============================================================================

  // Callback cuando el timer de vaciado gástrico completa
  const handleTimerComplete = () => {
    showNotification('Vaciado Gástrico', {
      body: 'Vaciado gástrico inicial completado. Vía libre para infusión tibia.',
      requireInteraction: true, // Notificación persistente hasta interacción
    });
  };

  // Solicita permiso de notificaciones al usuario
  const requestNotificationPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setToast({ message: '✅ Notificaciones activadas', type: 'success' });
    } else if (result === 'denied') {
      setToast({ message: '❌ Notificaciones bloqueadas', type: 'error' });
    }
    // Auto-hide toast después de 3 segundos
    setTimeout(() => setToast(null), 3000);
  };

  // Muestra un toast temporal
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Guarda el log diario en localStorage
  const saveDailyLog = () => {
    // Validación básica: al menos un campo de adherencia rellenado
    const hasAdherence = Object.values(adherence).some(v => v !== false && v !== 0);
    if (!hasAdherence) {
      showToast('⚠️ Rellena al menos un campo de adherencia', 'error');
      return;
    }

    const log = {
      date: new Date().toISOString(), // Timestamp ISO para ordenamiento
      mealType, // Tipo de comida (solid/soft/liquid)
      adherence,
      symptoms,
      notes,
    };
    // Lee logs existentes, añade el nuevo al principio (más reciente primero)
    const existingLogs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    localStorage.setItem('digestive-logs', JSON.stringify([log, ...existingLogs]));
    // Notifica a los observadores (useDailySummary, HistoryView)
    window.dispatchEvent(new Event('digestive-logs-updated'));
    // Confirma con notificación y toast
    showNotification('Registro Guardado', {
      body: 'Tu log diario ha sido guardado correctamente.',
    });
    showToast('✅ Registro guardado correctamente', 'success');
  };

  // Reset completo del protocolo sin recarga forzada para preservar timers en curso
  const resetProtocol = () => {
    try {
      if (typeof window !== 'undefined') {
        // Borrar datos almacenados (preservando el timer en curso)
        localStorage.removeItem('digestive-logs');
        localStorage.removeItem('digestive-field-config');

        // Actualizar estados reactivos a sus valores iniciales
        setAdherence(initialAdherence);
        setSymptoms(initialSymptoms);
        setNotes('');
        setStartDate(new Date().toISOString().split('T')[0]);

        // Notificar a observadores que los logs fueron limpiados
        window.dispatchEvent(new Event('digestive-logs-updated'));

        showToast('✅ Protocolo reseteado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error resetting protocol:', error);
      showToast('❌ Error al resetear protocolo', 'error');
    }
  };



  // ============================================================================
  // RENDERIZADO - UI
  // ============================================================================
  return (
    <div className="min-h-screen p-4 pb-24 relative">
      {/* Header: Título + contador de días + navegación */}
      <header className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {currentView !== 'dashboard' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-sm text-gray-400 hover:text-gray-300 mb-2 flex items-center gap-1 touch-manipulation"
              >
                ← Volver al dashboard
              </button>
            )}
            <h1 className="text-2xl font-bold text-dark-success mb-1">
              Digestive SpeedRun
            </h1>
            <p className="text-gray-500 text-sm">
              Día {currentDay} de 14
            </p>
            <ProgressBar currentDay={currentDay} totalDays={14} />
            {hasLogsToday && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Resumen de hoy</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-dark-success" />
                    <span className="text-sm text-gray-300">Adherencia: {dailyAdherence}%</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {logCount} registro{logCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('history')}
              className={`p-2 rounded-lg touch-manipulation ${
                currentView === 'history' ? 'bg-dark-success text-white' : 'bg-gray-800 text-gray-400'
              }`}
              aria-label="Ver histórico"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-lg touch-manipulation ${
                currentView === 'settings' ? 'bg-dark-success text-white' : 'bg-gray-800 text-gray-400'
              }`}
              aria-label="Configuración"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Banner de activación de notificaciones (solo si no hay permiso) */}
      {permission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full mb-4 p-3 bg-dark-alert text-white rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
          Activar alertas del timer
        </button>
      )}
      {permission === 'denied' && (
        <div className="w-full mb-4 p-3 bg-gray-800 text-gray-400 rounded-xl text-sm text-center">
          <Bell className="w-5 h-5 mx-auto mb-2 opacity-50" />
          <p>Las alertas están bloqueadas en tu dispositivo</p>
          <p className="text-xs mt-1 opacity-70">Actívalas en Ajustes del sistema para usarlas</p>
        </div>
      )}

      {/* Vista: Dashboard principal */}
      <ViewTransition isActive={currentView === 'dashboard'}>
        <>
          {/* Módulo 1: Timer de vaciado gástrico */}
          <section className="mb-6">
            <GastricTimer onTimerComplete={handleTimerComplete} />
          </section>

          {/* Módulo 0: Tipo de comida */}
          <section className="mb-6">
            <MealTypeSelector value={mealType} onChange={setMealType} />
          </section>

          {/* Módulo 2: Adherencia diaria */}
          {getActiveFields('adherence').length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-medium text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Adherencia Diaria
              </h2>
              <div className="space-y-3">
                {isFieldActive('adherence', 'freshRice') && (
                  <Toggle
                    label="Arroz recién hecho y baboso"
                    description="Evitar almidón resistente"
                    value={adherence.freshRice}
                    onChange={(val) => setAdherence({ ...adherence, freshRice: val })}
                  />
                )}
                {isFieldActive('adherence', 'softProtein') && (
                  <Toggle
                    label="Proteína escalfada/blanda"
                    description="Muy blanda, escalfada"
                    value={adherence.softProtein}
                    onChange={(val) => setAdherence({ ...adherence, softProtein: val })}
                  />
                )}
                {isFieldActive('adherence', 'noSweeteners') && (
                  <Toggle
                    label="Cero edulcorantes artificiales"
                    description="Sin sucralosa ni similares"
                    value={adherence.noSweeteners}
                    onChange={(val) => setAdherence({ ...adherence, noSweeteners: val })}
                  />
                )}
                {isFieldActive('adherence', 'noColdFood') && (
                  <Toggle
                    label="Cero alimentos/bebidas frías"
                    description="Todo tibio o caliente"
                    value={adherence.noColdFood}
                    onChange={(val) => setAdherence({ ...adherence, noColdFood: val })}
                  />
                )}
                {isFieldActive('adherence', 'fastingHours') && (
                  <Slider
                    label="Horas de ayuno nocturno"
                    description="Objetivo: >12h (más horas = mejor)"
                    value={adherence.fastingHours}
                    onChange={(val) => setAdherence({ ...adherence, fastingHours: val })}
                    min={6}
                    max={16}
                    reverseColor={true}
                  />
                )}
                {isFieldActive('adherence', 'supplements') && (
                  <Toggle
                    label="Suplementos / Enzimas"
                    description="Tomas según pauta clínica"
                    value={adherence.supplements || false}
                    onChange={(val) => setAdherence({ ...adherence, supplements: val })}
                  />
                )}
                {isFieldActive('adherence', 'mealTime') && (
                  <div className="p-4 bg-dark-surface rounded-xl">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Horario de la comida
                    </label>
                    <input
                      type="time"
                      value={adherence.mealTime || ''}
                      onChange={(e) => setAdherence({ ...adherence, mealTime: e.target.value })}
                      className="w-full p-2.5 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-success"
                    />
                  </div>
                )}
                {isFieldActive('adherence', 'mealLocation') && (
                  <div className="p-4 bg-dark-surface rounded-xl">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Lugar de la comida
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'home', label: 'Casa' },
                        { id: 'work', label: 'Trabajo' },
                        { id: 'outside', label: 'Fuera' },
                      ].map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setAdherence({ ...adherence, mealLocation: loc.id })}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            (adherence.mealLocation || 'home') === loc.id
                              ? 'bg-dark-success text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Módulo 3: Síntomas */}
          {getActiveFields('symptoms').length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-medium text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Síntomas
              </h2>
              <div className="space-y-3">
                {isFieldActive('symptoms', 'phrenicPain') && (
                  <Slider
                    label="Dolor Nervio Frénico"
                    description="Pinzamiento clavícula derecha"
                    value={symptoms.phrenicPain}
                    onChange={(val) => setSymptoms({ ...symptoms, phrenicPain: val })}
                  />
                )}
                {isFieldActive('symptoms', 'bloating') && (
                  <Slider
                    label="Distensión Abdominal / Gas"
                    description="Sensación de hinchazón"
                    value={symptoms.bloating}
                    onChange={(val) => setSymptoms({ ...symptoms, bloating: val })}
                  />
                )}
                {isFieldActive('symptoms', 'reflux') && (
                  <Slider
                    label="Reflujo / Acidez"
                    description="Sensación de ardor"
                    value={symptoms.reflux}
                    onChange={(val) => setSymptoms({ ...symptoms, reflux: val })}
                  />
                )}
                {isFieldActive('symptoms', 'bristolScale') && (
                  <BristolScale
                    value={symptoms.bristolScale}
                    onChange={(val) => setSymptoms({ ...symptoms, bristolScale: val })}
                  />
                )}
                {isFieldActive('symptoms', 'energy') && (
                  <Slider
                    label="Nivel de Energía"
                    description="Vitalidad percibida (0 = agotado, 10 = excelente)"
                    value={symptoms.energy ?? 5}
                    onChange={(val) => setSymptoms({ ...symptoms, energy: val })}
                    reverseColor={true}
                  />
                )}
                {isFieldActive('symptoms', 'sleep') && (
                  <Slider
                    label="Calidad de Sueño"
                    description="Descanso nocturno (0 = pésimo, 10 = reparador)"
                    value={symptoms.sleep ?? 5}
                    onChange={(val) => setSymptoms({ ...symptoms, sleep: val })}
                    reverseColor={true}
                  />
                )}
                {isFieldActive('symptoms', 'stress') && (
                  <Slider
                    label="Nivel de Estrés"
                    description="Tensión o carga percibida (0 = relajado, 10 = estrés agudo)"
                    value={symptoms.stress ?? 3}
                    onChange={(val) => setSymptoms({ ...symptoms, stress: val })}
                  />
                )}
                {isFieldActive('symptoms', 'bowelMovements') && (
                  <Slider
                    label="Deposiciones al día"
                    description="Frecuencia de evacuaciones de hoy"
                    value={symptoms.bowelMovements ?? 1}
                    onChange={(val) => setSymptoms({ ...symptoms, bowelMovements: val })}
                    min={0}
                    max={8}
                  />
                )}
              </div>
            </section>
          )}

          {/* Módulo 4: Notas libres */}
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-100 mb-3">Notas</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales..."
              className="w-full p-4 bg-dark-surface text-gray-100 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-dark-success"
            />
          </section>

          {/* Botón de guardado del log diario */}
          <button
            onClick={saveDailyLog}
            className="w-full py-4 bg-dark-success text-white font-bold rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Registro Diario
          </button>
        </>
      </ViewTransition>

      {/* Vista: Histórico */}
      <ViewTransition isActive={currentView === 'history'}>
        <HistoryView />
      </ViewTransition>

      {/* Vista: Configuración */}
      <ViewTransition isActive={currentView === 'settings'}>
        <ProtocolSettings
          startDate={startDate}
          currentDay={currentDay}
          onDateChange={setStartDate}
        >
          <div className="p-4 bg-dark-surface rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-100">Configuración de Campos</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Personaliza qué datos quieres trackear. Activa solo los campos que necesitas.
            </p>
            <FieldConfig
              config={config}
              onToggle={toggleField}
              availableFields={AVAILABLE_FIELDS}
            />
          </div>
        </ProtocolSettings>

        <div className="mt-4">
          <BackupRestore onToast={showToast} />
        </div>
        
        <div className="mt-6">
          <ResetProtocol onReset={resetProtocol} />
        </div>
      </ViewTransition>

      {/* Toast notifications */}
      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  );
}

export default App;

/*
 * DECISIONES DE DISEÑO:
 * - Estado distribuido: Cada módulo tiene su propio key en localStorage
 * - Auto-save: No hay botón de guardar individual (excepto log diario)
 * - Contador de días: Calculado dinámicamente desde fecha configurable
 * - Banner de notificaciones: Solo aparece si no hay permiso
 * - Navegación por vistas: Dashboard, Histórico, Configuración
 * - pb-24: Padding bottom para no ocultar contenido detrás de controles móviles
 *
 * CAMBIOS RECIENTES:
 * - Añadido hook useProtocolDate para gestión de fecha de inicio
 * - Añadido componente ProtocolSettings para configuración
 * - Añadido componente HistoryView para visualización de logs
 * - Añadido navegación entre vistas (dashboard/history/settings)
 * - Día del protocolo ahora es configurable y persistente
 *
 * FUTURO: Mejoras posibles:
 * - Exportación de datos (CSV, JSON) para compartir con médico
 * - Añadir más tipos de síntomas según evolución
 * - Añadir módulo de medicación/suplementos
 * - Añadir recordatorios programados (ej: cada 4h infusión)
 * - Considerar migrar a IndexedDB para datos más grandes
 * - Añadir modo oscuro/claro (actualmente solo dark)
 * - Añadir animaciones de transición entre secciones
 * - Añadir gráficos de evolución en el histórico
 */
