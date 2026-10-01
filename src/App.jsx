import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { Toggle } from './components/Toggle';
import { Slider } from './components/Slider';
import { GastricTimer } from './components/GastricTimer';
import { BristolScale } from './components/BristolScale';
import { Bell, Calendar, Save } from 'lucide-react';

const initialAdherence = {
  freshRice: false,
  softProtein: false,
  noSweeteners: false,
  noColdFood: false,
  fastingHours: 12,
};

const initialSymptoms = {
  phrenicPain: 0,
  bloating: 0,
  reflux: 0,
  bristolScale: 4,
};

function App() {
  const [adherence, setAdherence] = useLocalStorage('digestive-adherence', initialAdherence);
  const [symptoms, setSymptoms] = useLocalStorage('digestive-symptoms', initialSymptoms);
  const [notes, setNotes] = useLocalStorage('digestive-notes', '');
  const { permission, requestPermission, showNotification } = useNotifications();

  const handleTimerComplete = () => {
    showNotification('Vaciado Gástrico', {
      body: 'Vaciado gástrico inicial completado. Vía libre para infusión tibia.',
      requireInteraction: true,
    });
  };

  const requestNotificationPermission = async () => {
    await requestPermission();
  };

  const saveDailyLog = () => {
    const log = {
      date: new Date().toISOString(),
      adherence,
      symptoms,
      notes,
    };
    const existingLogs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    localStorage.setItem('digestive-logs', JSON.stringify([log, ...existingLogs]));
    showNotification('Registro Guardado', {
      body: 'Tu log diario ha sido guardado correctamente.',
    });
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-dark-success mb-1">
          Digestive SpeedRun
        </h1>
        <p className="text-gray-500 text-sm">
          Día {Math.floor((Date.now() - new Date('2026-10-01').getTime()) / (1000 * 60 * 60 * 24)) + 1} de 14
        </p>
      </header>

      {permission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full mb-4 p-3 bg-dark-alert text-white rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
          Activar Notificaciones
        </button>
      )}

      <section className="mb-6">
        <GastricTimer onTimerComplete={handleTimerComplete} />
      </section>

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

      <section className="mb-6">
        <h2 className="text-lg font-medium text-gray-100 mb-3">Notas</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones adicionales..."
          className="w-full p-4 bg-dark-surface text-gray-100 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-dark-success"
        />
      </section>

      <button
        onClick={saveDailyLog}
        className="w-full py-4 bg-dark-success text-white font-bold rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Guardar Registro Diario
      </button>
    </div>
  );
}

export default App;
