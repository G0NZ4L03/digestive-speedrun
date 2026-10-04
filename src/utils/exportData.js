// ============================================================================
// UTIL: exportData
// ============================================================================

/**
 * Utilidad para exportar datos del tracker a diferentes formatos.
 *
 * PROBLEMA QUE RESUELVE:
 * - Los usuarios necesitan compartir sus datos con médicos
 * - localStorage es difícil de acceder para no técnicos
 * - Necesitamos formatos estándar (CSV, JSON) para análisis externos

 * FUNCIONAMIENTO:
 * - Lee logs de localStorage
 * - Convierte a formato solicitado (CSV o JSON)
 * - Descarga archivo con trigger de descarga del navegador
 */

/**
 * Exporta logs a formato JSON
 * @param {string} filename - Nombre del archivo a descargar
 */
export function exportToJSON(filename = 'digestive-logs.json') {
  try {
    const logs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    alert('Error al exportar datos. Revisa la consola para más detalles.');
  }
}

/**
 * Exporta logs a formato CSV
 * @param {string} filename - Nombre del archivo a descargar
 */
export function exportToCSV(filename = 'digestive-logs.csv') {
  try {
    const logs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    
    if (logs.length === 0) {
      alert('No hay logs para exportar.');
      return;
    }

    // Mapeo amigable para el tipo de ingesta
    const mealTypeMap = {
      solid: 'Sólida',
      soft: 'Pastosa',
      liquid: 'Líquida'
    };

    // Header del CSV
    const headers = [
      'Fecha',
      'Tipo de Ingesta',
      'Arroz Fresco',
      'Proteína Blanda',
      'Sin Edulcorantes',
      'Sin Frío',
      'Ayuno (h)',
      'Dolor Frénico',
      'Distensión',
      'Reflujo',
      'Bristol',
      'Notas'
    ];

    // Convertir cada log a fila CSV
    const rows = logs.map(log => [
      log.date,
      mealTypeMap[log.mealType] || log.mealType || 'No especificado',
      log.adherence.freshRice ? 'Sí' : 'No',
      log.adherence.softProtein ? 'Sí' : 'No',
      log.adherence.noSweeteners ? 'Sí' : 'No',
      log.adherence.noColdFood ? 'Sí' : 'No',
      log.adherence.fastingHours,
      log.symptoms.phrenicPain,
      log.symptoms.bloating,
      log.symptoms.reflux,
      log.symptoms.bristolScale,
      `"${(log.notes || '').replace(/"/g, '""')}"` // Escapar comillas en notas
    ]);

    // Combinar header y filas
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Añadir BOM para Excel reconozca UTF-8
    const BOM = '\uFEFF';
    const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Error al exportar datos. Revisa la consola para más detalles.');
  }
}

/**
 * Exporta logs a formato CSV simplificado (solo métricas clave)
 * Útil para análisis rápido en Excel
 */
export function exportToSimpleCSV(filename = 'digestive-logs-simple.csv') {
  try {
    const logs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
    
    if (logs.length === 0) {
      alert('No hay logs para exportar.');
      return;
    }

    const mealTypeMap = {
      solid: 'Sólida',
      soft: 'Pastosa',
      liquid: 'Líquida'
    };

    const headers = ['Fecha', 'Tipo de Ingesta', 'Adherencia %', 'Dolor Promedio', 'Notas'];
    
    const rows = logs.map(log => {
      const adherenceRules = ['freshRice', 'softProtein', 'noSweeteners', 'noColdFood'];
      const adherence = adherenceRules.filter(r => log.adherence[r]).length;
      const adherencePercent = Math.round((adherence / adherenceRules.length) * 100);
      const avgPain = Math.round((log.symptoms.phrenicPain + log.symptoms.bloating + log.symptoms.reflux) / 3);
      
      return [
        log.date,
        mealTypeMap[log.mealType] || log.mealType || 'No especificado',
        adherencePercent,
        avgPain,
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to simple CSV:', error);
    alert('Error al exportar datos. Revisa la consola para más detalles.');
  }
}

/**
 * Importa y valida logs desde un archivo JSON para restaurar backup
 * @param {File} file - Archivo JSON cargado por el usuario
 * @returns {Promise<{ success: boolean, count?: number, newCount?: number, totalCount?: number, error?: string }>}
 */
export async function importFromJSON(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, error: 'No se seleccionó ningún archivo.' });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      resolve({ success: false, error: 'El archivo debe tener formato .json válido.' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') {
          resolve({ success: false, error: 'El archivo está vacío o es ilegible.' });
          return;
        }

        const parsed = JSON.parse(text);
        // Soporta array directo de logs o un objeto { logs: [...] }
        const importedLogs = Array.isArray(parsed) ? parsed : parsed?.logs;

        if (!Array.isArray(importedLogs) || importedLogs.length === 0) {
          resolve({ success: false, error: 'El archivo no contiene una lista de registros.' });
          return;
        }

        // Validar que los elementos tengan la estructura mínima de un log
        const isValid = importedLogs.every(
          (item) => item && typeof item === 'object' && item.date && (item.adherence || item.symptoms)
        );

        if (!isValid) {
          resolve({
            success: false,
            error: 'La estructura de los registros no coincide con el formato del protocolo.',
          });
          return;
        }

        // Obtener logs actuales para fusionar sin duplicar fechas exactas
        const existingLogs = JSON.parse(localStorage.getItem('digestive-logs') || '[]');
        const existingDates = new Set(existingLogs.map((l) => l.date));

        const newLogs = importedLogs.filter((l) => !existingDates.has(l.date));
        const merged = [...newLogs, ...existingLogs].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        localStorage.setItem('digestive-logs', JSON.stringify(merged));
        window.dispatchEvent(new Event('digestive-logs-updated'));

        resolve({
          success: true,
          count: importedLogs.length,
          newCount: newLogs.length,
          totalCount: merged.length,
        });
      } catch (err) {
        console.error('Error parseando JSON de backup:', err);
        resolve({ success: false, error: 'El archivo JSON está dañado o no tiene formato válido.' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Error al leer el archivo desde el dispositivo.' });
    };

    reader.readAsText(file);
  });
}

/*
 * RAZÓN DE ESTA UTILIDAD:
 * - Portabilidad: Datos en formatos estándar intercambiables
 * - Análisis: CSV puede abrirse en Excel, Google Sheets, etc.
 * - Backup: JSON permite restaurar datos si se pierden
 * - Compartir: Fácil enviar por email a médico
 *
 * USO EN ESTE PROYECTO:
 * - Componente HistoryView: Botones de exportación
 * - Panel de configuración: Opción de backup
 *
 * FUTURO: Mejoras posibles:
 * - Añadir import de JSON (para restaurar backup)
 * - Añadir selección de rango de fechas
 * - Añadir generación de reporte PDF
 * - Añadir gráficos pre-generados en el export
 */