# Changelog

Todas las versiones notables de Digestive SpeedRun Tracker.

## [v1.1.0] - 2025-01

### Añadido
- **Timer de vaciado gástrico** con persistencia y soporte background
- **Selector de tipo de comida** (sólida/pastosa/líquida)
- **Configuración de campos dinámica** - usuario elige qué trackear
- **Campos opcionales** (suplementos, horario, energía, sueño, estrés)
- **Filtros en histórico** (por tipo de comida y alertas clínicas)
- **Edición inline** de registros guardados
- **Importación de backups JSON**
- **Gráficas de tendencias visuales** (TrendsView)
- **Summary del día** (adherencia %, tiempo último registro)
- **Validación de datos** (requiere al menos un campo de adherencia)
- **Reset del protocolo** sin recarga forzada
- **Service Worker v2** con estrategia híbrida network-first/cache-first
- **Notificaciones híbridas** (Service Worker + fallback)
- **Sincronización reactiva** entre pestañas con evento custom
- **Rutas relativas** para GitHub Pages (`%BASE_URL%`, `./`)

### Mejorado
- Cálculo de fechas robusto (sin Math.abs, acotado 1-14)
- Exportación CSV con "Tipo de Ingesta"
- Refresco automático del día del protocolo tras medianoche
- Limpieza de cachés obsoletas en Service Worker
- 0 errores/advertencias de linter (oxlint)

### Corregido
- Timer se pausaba en background (Page Visibility API)
- Recargas forzadas destructivas (sustituidas por reactividad)
- Reactividad rota en useDailySummary
- Fallo de notificaciones en móvil iOS/Android
- Rutas absolutas incompatibles con subpath GitHub Pages

### Cambios técnicos
- Añadido evento custom `digestive-logs-updated` para sincronización
- Eliminado `window.location.reload()` en todas las operaciones
- Adaptado `useNotifications` para Service Worker con timeout
- Normalizado fechas en `useProtocolDate` a medianoche local
- Precacheo de recursos críticos en Service Worker

## [v1.0.0] - 2025-01

### Añadido
- MVP inicial del tracker
- Módulo de Adherencia (toggles + slider de ayuno)
- Módulo de Síntomas (sliders + escala Bristol)
- Timer de vaciado gástrico (45 min)
- Configuración de fecha de inicio
- Histórico de logs básico
- Exportación CSV/JSON
- Progress bar del protocolo
- Transiciones suaves entre vistas
- Toast notifications
- PWA básica (manifest + service worker)
- Deploy a GitHub Pages

---

## [v1.2.0] - Planificado

### Planeado
- Recordatorios programados
- Modo quick-entry
- Gestión de suplementos/medicación
- Backup automático
- Quick actions en header
- Swipe gestures
- Celebraciones de objetivos
- Animaciones mejoradas
- Modo compacto
