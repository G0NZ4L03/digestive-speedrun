import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const INITIAL_TIME = 45 * 60; // 45 minutos en segundos

export function GastricTimer({ onTimerComplete }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimerComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimerComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimeLeft(INITIAL_TIME);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(null);
    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-dark-surface rounded-xl text-center">
      <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center justify-center gap-2">
        <Clock className="w-5 h-5" />
        Vaciado Gástrico
      </h3>

      {timeLeft === null ? (
        <button
          onClick={startTimer}
          className="w-full py-4 bg-dark-success text-white font-bold rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Play className="w-6 h-6" />
          Fin Comida Sólida
        </button>
      ) : (
        <>
          <div className="text-5xl font-bold text-gray-100 mb-4 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-xl touch-manipulation active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Reanudar
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-3 bg-dark-alert text-white font-medium rounded-xl touch-manipulation active:scale-[0.98] transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
