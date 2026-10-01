import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { useProtocolDate } from './hooks/useProtocolDate';
import { Toggle } from './components/Toggle';
import { Slider } from './components/Slider';
import { GastricTimer } from './components/GastricTimer';
import { BristolScale } from './components/BristolScale';
import { ProtocolSettings } from './components/ProtocolSettings';
import { HistoryView } from './components/HistoryView';
import { Bell, Calendar, Save, Settings, History as HistoryIcon } from 'lucide-react';

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
};

// ============================================================================
// ESTADO INICIAL - SÍNTOMAS
// ============================================================================
const initialSymptoms = {
  phrenicPain: 0,             // Dolor/pinzamiento nervio frénico (0-10)
  bloating: 0,                // Distensión abdominal / gas (0-10)
  reflux: 0,                  // Reflujo / acidez (0-10)
  bristolScale: 4,            // Escala de Bristol (1-7, 4 = ideal)
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

  // Estado para la vista actual (dashboard vs histórico vs settings)
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'history' | 'settings'

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
    await requestPermission();
  };

  // Guarda el log diario en localStorage
  const saveDailyLog = () => {
    const log = {
      date: new Date().toISOString(), // Timestamp ISO para ordenamiento
      adherence,
      symptoms,
      notes,
    };
    // Lee logs existentes, añade el nuevo al principio (más reciente primero)
    const existingLogs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    localStorage.setItem('digestive-logs', JSON.stringify([log, ...existingLogs]));
    // Confirma con notificación
    showNotification('Registro Guardado', {
      body: 'Tu log diario ha sido guardado correctamente.',
    });
  };

  // ============================================================================
  // RENDERIZADO - UI
  // ============================================================================
  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header: Título + contador de días + navegación */}
      <header className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-dark-success mb-1">
              Digestive SpeedRun
            </h1>
            <p className="text-gray-500 text-sm">
              Día {currentDay} de 14
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('history')}
              className={`p-2 rounded-lg touch-manipulation ${
                currentView === 'history' ? 'bg-dark-success text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-lg touch-manipulation ${
                currentView === 'settings' ? 'bg-dark-success text-white' : 'bg-gray-800 text-gray-400'
              }`}
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
          Activar Notificaciones
        </button>
      )}

      {/* Vista: Dashboard principal */}
      {currentView === 'dashboard' && (
        <>
          {/* Módulo 1: Timer de vaciado gástrico */}
          <section className="mb-6">
            <GastricTimer onTimerComplete={handleTimerComplete} />
          </section>

          {/* Módulo 2: Adherencia diaria */}
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-100 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Adherencia Diaria
            </h2>
            <div className="space-y-3">
              <Toggle
                label="Arroz recién hecho y baboso"
                description="Evitar almidón resistente"
                value={adherence.freshRice}
                onChange={(val) => setAdherence({ ...adherence, freshRice: val })}
              />
              <Toggle
                label="Proteína escalfada/blanda"
                description="Muy blanda, escalfada"
                value={adherence.softProtein}
                onChange={(val) => setAdherence({ ...adherence, softProtein: val })}
              />
              <Toggle
                label="Cero edulcorantes artificiales"
                description="Sin sucralosa ni similares"
                value={adherence.noSweeteners}
                onChange={(val) => setAdherence({ ...adherence, noSweeteners: val })}
              />
              <Toggle
                label="Cero alimentos/bebidas frías"
                description="Todo tibi o caliente"
                value={adherence.noColdFood}
                onChange={(val) => setAdherence({ ...adherence, noColdFood: val })}
              />
              <Slider
                label="Horas de ayuno nocturno"
                description="Objetivo: >12h"
                value={adherence.fastingHours}
                onChange={(val) => setAdherence({ ...adherence, fastingHours: val })}
                min={0}
                max={16}
              />
            </div>
          </section>

          {/* Módulo 3: Síntomas */}
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-100 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Síntomas
            </h2>
            <div className="space-y-3">
              <Slider
                label="Dolor Nervio Frénico"
                description="Pinzamiento clavícula derecha"
                value={symptoms.phrenicPain}
                onChange={(val) => setSymptoms({ ...symptoms, phrenicPain: val })}
              />
              <Slider
                label="Distensión Abdominal / Gas"
                description="Sensación de hinchazón"
                value={symptoms.bloating}
                onChange={(val) => setSymptoms({ ...symptoms, bloating: val })}
              />
              <Slider
                label="Reflujo / Acidez"
                description="Sensación de ardor"
                value={symptoms.reflux}
                onChange={(val) => setSymptoms({ ...symptoms, reflux: val })}
              />
              <BristolScale
                value={symptoms.bristolScale}
                onChange={(val) => setSymptoms({ ...symptoms, bristolScale: val })}
              />
            </div>
          </section>

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
      )}

      {/* Vista: Histórico */}
      {currentView === 'history' && (
        <HistoryView />
      )}

      {/* Vista: Configuración */}
      {currentView === 'settings' && (
        <ProtocolSettings
          startDate={startDate}
          currentDay={currentDay}
          onDateChange={setStartDate}
        />
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
