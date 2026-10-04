import { useRef, useState } from 'react';
import { Upload, Download, HardDrive } from 'lucide-react';
import { exportToJSON, importFromJSON } from '../utils/exportData';

/**
 * Componente para gestión de copias de seguridad (Backup y Restauración)
 * Permite exportar datos a JSON o restaurar un historial previo en localStorage.
 */
export function BackupRestore({ onToast }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await importFromJSON(file);
      if (res.success) {
        onToast?.(
          `✅ Restaurados ${res.count} registros (${res.newCount} nuevos añadidos)`,
          'success'
        );
      } else {
        onToast?.(`❌ ${res.error || 'Error al importar datos'}`, 'error');
      }
    } catch (err) {
      console.error('Error importando backup:', err);
      onToast?.('❌ Error inesperado al procesar el archivo', 'error');
    } finally {
      setIsImporting(false);
      // Reset input para permitir volver a seleccionar el mismo archivo si se desea
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="w-5 h-5 text-gray-400" />
        <h3 className="font-medium text-gray-100">Copia de Seguridad y Restauración</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Guarda una copia de seguridad en tu dispositivo o restaura tus registros previos para prevenir pérdidas accidentales de datos.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Exportar JSON */}
        <button
          onClick={() => {
            exportToJSON();
            onToast?.('✅ Copia de seguridad JSON descargada', 'success');
          }}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-gray-700/50"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Exportar Backup JSON</span>
        </button>

        {/* Importar JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg touch-manipulation active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-gray-700/50 disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">
            {isImporting ? 'Procesando...' : 'Restaurar Backup JSON'}
          </span>
        </button>
      </div>
    </div>
  );
}
