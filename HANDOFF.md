# HANDOFF: Digestive SpeedRun Tracker

Documento de transferencia y análisis técnico del estado actual del repositorio.

**Versión:** v1.1 (Completada y desplegada)
**Estado:** Producción en GitHub Pages
**Fecha finalización:** Enero 2025

**Próxima versión:** v1.2 - Integración con Gemini API
**Plan detallado:** Ver `docs/v1.2-plan.md`

---

## 1. Objetivo de la app

- **Finalidad clínica**: Tracker personal y MVP para monitorizar un protocolo de rehabilitación intestinal intensivo de 14 días ("Speed Run").
- **Patologías objetivo**: Diseñado específicamente para pacientes con disbiosis intestinal, sobrecrecimiento bacteriano (SIBO/FODMAPs), obstrucción/gas en el ángulo hepático y dolor referido en el nervio frénico (clavícula derecha).
- **Mecanismos clave**:
  - Registro de adherencia a reglas estrictas (arroz recién cocinado sin almidón resistente, proteína blanda/escalfada, exclusión de edulcorantes artificiales, exclusión de comidas frías y horas de ayuno nocturno).
  - Monitorización de síntomas diarios (dolor frénico, distensión abdominal, reflujo y consistencia de heces con la Escala de Bristol de 1 a 7).
  - Temporizador gástrico de 45 minutos para controlar el vaciado inicial post comida sólida y avisar cuándo tomar infusiones tibias para estimular el Complejo Motor Migratorio (CMM).
- **Generación de reportes**: Creación de prompts estructurados para análisis clínico mediante LLMs (Gemini) o envío al médico.
- *[Suposición]*: Uso unipersonal/doméstico por parte del paciente como PWA en dispositivo móvil antes de una hipotética evolución a plataforma clínica multiusuario.

---

## 2. Stack y dependencias principales

- **Core & Runtime**:
  - `react@^19.2.8` y `react-dom@^19.2.8`: Framework UI y renderizado DOM.
- **Build & Dev Tooling**:
  - `vite@^8.3.0` (`v8.3.2` instalado): Bundler y servidor de desarrollo.
  - `@vitejs/plugin-react@^6.1.1`: Plugin oficial de React para Vite.
  - `oxlint@^1.81.0`: Linter estático de alto rendimiento.
- **Estilos & UI**:
  - `tailwindcss@^4.3.3` + `@tailwindcss/postcss@^4.3.3` + `postcss@^8.5.28` + `autoprefixer@^10.6.1`: Utilidades CSS con configuración Tailwind v4 (`@theme`).
  - `lucide-react@^1.49.0`: Librería de iconos vectoriales.
- **Scripts auxiliares**:
  - `sharp@^0.35.5`: Generación de iconos PWA a partir de SVG.
- **Despliegue & Hosting**:
  - `gh-pages@^6.3.0` (script `npm run deploy`).
  - `vercel@^62.1.0` (en `devDependencies`).
- **Persistencia & Plataforma**:
  - Almacenamiento local mediante `localStorage` (arquitectura 100% cliente, sin backend).
  - Service Worker nativo (`sw.js`) y Web App Manifest (`manifest.json`) para PWA offline.
  - Web Notifications API para alertas del temporizador y confirmaciones.

---

## 3. Estructura de carpetas y archivos clave

- `public/`: Assets estáticos y archivos de servicio servidos en la raíz.
  - `public/manifest.json`: Configuración PWA para instalación en homescreen móvil/escritorio.
  - `public/sw.js`: Service worker con estrategia de caché básica (Cache-First).
  - `public/icon.svg` / `icon-*.png`: Iconografía de la app generada para la PWA.
- `scripts/`: Scripts de utilidad en tiempo de desarrollo.
  - `scripts/generate-icons.js`: Script con Sharp para compilar PNGs (192x192 y 512x512) desde `icon.svg`.
- `src/`: Código fuente de la aplicación React.
  - `src/main.jsx`: Punto de entrada, montaje en `#root` y registro del Service Worker.
  - `src/App.jsx`: Componente orquestador del dashboard, vistas, estado principal y persistencia.
  - `src/index.css`: Import de Tailwind v4, tokens `@theme` dark mode y keyframes de animación.
  - `src/components/`: Componentes modulares de interfaz:
    - `src/components/Toggle.jsx`: Botón táctil binario SÍ/NO con estado visual y animaciones.
    - `src/components/Slider.jsx`: Deslizador 0-10 con gradiente dinámico y colores semánticos.
    - `src/components/BristolScale.jsx`: Selector visual de la escala de heces de Bristol (tipos 1 a 7).
    - `src/components/GastricTimer.jsx`: Temporizador visual de 45 min con botones de inicio, pausa y reset.
    - `src/components/MealTypeSelector.jsx`: Selector del tipo de comida (sólida, pastosa, líquida).
    - `src/components/ProgressBar.jsx`: Barra de progreso porcentual del protocolo de 14 días.
    - `src/components/ProtocolSettings.jsx`: Formulario para definir la fecha de inicio del protocolo.
    - `src/components/FieldConfig.jsx`: Panel de configuración para activar/desactivar campos de tracking.
    - `src/components/HistoryView.jsx`: Histórico de registros, detalle expandible, borrado y exportación.
    - `src/components/ResetProtocol.jsx`: Zona de peligro con doble confirmación para purgar datos.
    - `src/components/Toast.jsx`: Notificación flotante temporal (3s) para feedback en pantalla.
    - `src/components/ViewTransition.jsx`: Transición de opacidad/desplazamiento entre pestañas.
  - `src/hooks/`: Hooks de lógica de negocio y persistencia:
    - `src/hooks/useLocalStorage.js`: Sincronización reactiva bidireccional con `localStorage`.
    - `src/hooks/useNotifications.js`: Gestión de permisos y disparo de Web Push Notifications.
    - `src/hooks/usePersistentTimer.js`: Temporizador con marcas de tiempo y Visibility API para background.
    - `src/hooks/useProtocolDate.js`: Cálculo dinámico del día actual del protocolo.
    - `src/hooks/useDailySummary.js`: Cálculo de adherencia y dolor medio en el día actual.
    - `src/hooks/useFieldConfig.js`: Catálogo y persistencia de campos habilitados/deshabilitados.
  - `src/utils/`: Utilidades generales:
    - `src/utils/exportData.js`: Generación y descarga de archivos JSON, CSV completo y CSV simple.
- `index.html`: Shell HTML con metadatos PWA y viewport no escalable para móvil.
- `vite.config.js`: Configuración de Vite con base path `/digestive-speedrun/` para GitHub Pages.
- `package.json`: Scripts y dependencias del proyecto.
- `AGENTS.md`: Manual operativo para desarrolladores y agentes IA.
- `README.md`: Documentación de especificación clínica y uso de la aplicación.

---

## 4. Cómo arrancar el proyecto

### Requisitos previos
- Node.js (v18+ recomendado) y npm.

### Comandos
```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo con Hot Reload (por defecto en http://localhost:5173)
npm run dev

# 2.1 Servidor accesible desde móvil en la misma red Wi-Fi
npm run dev -- --host

# 3. Validar código con linter (oxlint)
npm run lint

# 4. Compilar bundle de producción (genera carpeta dist/)
npm run build

# 5. Previsualizar bundle de producción localmente
npm run preview

# 6. Re-generar iconos PWA (opcional)
npm run generate-icons
```

### Variables de entorno
- **Ninguna**: El proyecto es puramente cliente (SPA estática) y no requiere ningún archivo `.env` ni credenciales secretas.

---

## 5. Qué está terminado y funcionando

- **Timer de vaciado gástrico**: Cuenta atrás de 45 minutos (`GastricTimer` + `usePersistentTimer`), resistente al cierre de app o cambio de pestaña gracias a Page Visibility API y cálculo diferencial por timestamps (`lastTick`).
- **Módulo de Adherencia y Síntomas**: Registro completo con componentes táctiles (`Toggle`, `Slider`, `BristolScale`) y selector de consistencia de ingesta (`MealTypeSelector`).
- **Configuración dinámica de campos (`useFieldConfig`)**: El Dashboard en `App.jsx` respeta fielmente la activación/desactivación de campos de `FieldConfig`, ocultando secciones si no hay métricas activas y renderizando campos opcionales (`supplements`, `mealTime`, `mealLocation`, `energy`, `sleep`, `stress`, `bowelMovements`).
- **Persistencia básica**: Guardado local reactivo de estado actual (`digestive-adherence`, `digestive-symptoms`, `digestive-notes`) y de registros acumulados (`digestive-logs`).
- **Histórico con filtrado avanzado y edición en línea**: Listado cronológico en `HistoryView` con visualización expandible, badges de severidad por colores, eliminación individual o colectiva, y ahora **filtros interactivos** (por tipo de comida: Sólida/Pastosa/Líquida; por alertas clínicas: Síntomas > 5, Adherencia < 75%) y **edición inline completa** de registros pasados (tipo de comida, adherencia, síntomas, escala Bristol y notas) sincronizado de forma reactiva sin recarga de página.
- **Exportación de datos completa**: Descarga directa en JSON, CSV completo y CSV resumido (con cabecera UTF-8 BOM para compatibilidad con Microsoft Excel), incluyendo la columna `Tipo de Ingesta` (Sólida/Pastosa/Líquida).
- **Copia de seguridad y restauración (`BackupRestore`)**: Importador robusto `importFromJSON` en `src/utils/exportData.js` y componente visual en Ajustes para restaurar copias de seguridad de logs, validando formato, evitando duplicados por fecha y sincronizando reactivamente.
- **Generador de prompts para LLM**: Función en `HistoryView` que formatea el historial o el día actual en Markdown estructurado y lo copia al portapapeles para análisis en Gemini.
- **PWA con rutas correctas para GitHub Pages**: `main.jsx` usa `import.meta.env.BASE_URL` para registrar el SW; `index.html` usa `%BASE_URL%` para el icono y el manifest; `manifest.json` usa `./` en `start_url`, `scope` e iconos. El build de Vite resuelve todo correctamente bajo `/digestive-speedrun/`.
- **Notificaciones PWA híbridas y robustas**: `useNotifications.js` utiliza `registration.showNotification` con timeout de 2s vía `Promise.race` para evitar bloqueos si no hay SW, fallback automático a `new Notification` y solicitud de permisos exclusivamente bajo gesto del usuario.
- **Cálculo de fechas robusto**: `useProtocolDate.js` normaliza a medianoche local, evita `Math.abs`, acota estrictamente entre Día 1 y 14, y actualiza el día dinámicamente con listener de `visibilitychange`.
- **Ciclo de vida y caché del Service Worker (`sw.js`)**: Versión `digestive-sr-v2` con precacheo de recursos críticos de arranque (`./`, `index.html`, `manifest.json`, iconos), purga automática de versiones previas de caché en el evento `activate` con `clients.claim()`, activación inmediata con `skipWaiting()`, y estrategia híbrida: *Network-First* con fallback a caché para navegación (HTML) y *Cache-First* con guardado dinámico para recursos estáticos (JS, CSS, imágenes).
- **Gráficas visuales de evolución temporal y tendencias (`TrendsView`)**: Visualizador interactivo vectorial SVG con curvas y áreas sombreadas para Síntomas (Dolor Frénico, Distensión Abdominal, Reflujo), Adherencia (% de reglas) y Escala Bristol (con zona óptima 3-4 destacada). Permite alternar entre agrupación diaria (Día 1 a 14) y por comida individual, selección táctil de puntos con tarjeta de detalle contextual, resumen clínico con detección de tendencia (mejora vs empeoramiento) y modo demostración interactivo con datos de ejemplo. Accesible desde la barra de navegación superior y desde el Histórico.
- **Reset de protocolo**: Purgado completo de datos con doble confirmación de seguridad y **sin recarga forzada** — preserva el temporizador gástrico en curso.
- **Sincronización reactiva de logs**: Bus de evento personalizado `digestive-logs-updated` que propaga cambios en `localStorage` a `useDailySummary` e `HistoryView` dentro de la misma pestaña sin depender de `window.onstorage`.

---

## 6. Qué está a medias o incompleto

- **Navegación sin enrutador**: La alternancia de vistas se gestiona mediante un estado local `currentView` sin URLs ni soporte para el botón de retroceso nativo del navegador móvil.
- **Roadmap clínico pendiente (especificado en README.md)**:
  - Módulo de suplementación y medicación activa.
  - Recordatorios periódicos programados (ej. infusiones cada 4 horas).

---

## 7. Bugs y riesgos detectados

- ~~**Incompatibilidad de rutas absolutas con `base: '/digestive-speedrun/'`**~~ ✅ **RESUELTO** (commit `f80192e`):
  - `main.jsx` usa `import.meta.env.BASE_URL` para registrar el SW.
  - `index.html` usa `%BASE_URL%icon.svg` y `%BASE_URL%manifest.json`.
  - `manifest.json` usa `"./"` en `start_url` y `scope`; iconos con rutas relativas.
  - `sw.js` usa `['./']` en `urlsToCache`.
- ~~**Refresco forzado destructivo con `window.location.reload()`**~~ ✅ **RESUELTO** (commit `521ea6f`):
  - `deleteLog`, `deleteAllLogs` en `HistoryView.jsx`: actualizan estado local + dispatch de `digestive-logs-updated`.
  - `resetProtocol` en `App.jsx`: reset reactivo de `adherence`, `symptoms`, `notes`, `startDate` sin recarga. Preserva el temporizador gástrico.
- ~~**Reactividad rota en `useDailySummary`**~~ ✅ **RESUELTO** (commit `521ea6f`):
  - `useDailySummary.js` ahora escucha `digestive-logs-updated` además de `storage`.
  - `HistoryView.jsx` tiene `logs` como estado reactivo que se actualiza con el mismo evento.
  - `saveDailyLog` en `App.jsx` dispara `digestive-logs-updated` tras escribir en localStorage.
- ~~**Fallo de `new Notification()` en navegadores móviles (iOS PWA / Chrome Android)**~~ ✅ **RESUELTO**:
  - `useNotifications.js` adaptado a `ServiceWorkerRegistration.showNotification()` con timeout de 2 segundos para prevenir bloqueos y fallback seguro con `try/catch`.
- ~~**Cálculo defectuoso de fechas en `useProtocolDate`**~~ ✅ **RESUELTO**:
  - Normalizado a fechas locales sin `Math.abs`, acotado estrictamente a rango 1-14 y refresco automático por `visibilitychange`.
- ~~**Inconsistencia de `mealType` en exportación CSV**~~ ✅ **RESUELTO**:
  - `exportData.js` incluye `Tipo de Ingesta` con mapeo a Sólida, Pastosa o Líquida en `exportToCSV` y `exportToSimpleCSV`.
- ~~**Desconexión de `useFieldConfig` en el Dashboard**~~ ✅ **RESUELTO**:
  - `isFieldActive` y `getActiveFields` conectados completamente en `App.jsx` tanto para adherencia como para síntomas, soportando campos opcionales y ocultación dinámica de bloques vacíos.
- ~~**Riesgo crítico de pérdida de datos por dependencia exclusiva de `localStorage`**~~ ✅ **RESUELTO**:
  - Implementada utilidad `importFromJSON` y componente `BackupRestore` en la vista de Ajustes para restaurar copias de seguridad JSON previas.
- ~~**Advertencias en `npm run lint` (`oxlint`)**~~ ✅ **RESUELTO**:
  - De las 14 advertencias iniciales, se han solventado todas hasta alcanzar **0 advertencias y 0 errores** en todo el proyecto.

---

## 8. Siguientes pasos recomendados

> Los pasos ya completados han sido tachados. El orden refleja prioridad actual.

1. ~~**Corregir rutas PWA y Service Worker para subpath**~~ ✅ commit `f80192e`
2. ~~**Subsanar reactividad en `useDailySummary` y eliminar `window.location.reload()`**~~ ✅ commit `521ea6f`
3. ~~**Actualizar API de notificaciones para móvil**~~ ✅ commit `5445dd9`
4. ~~**Robustecer cálculo de días en `useProtocolDate`**~~ ✅ commit `5445dd9`
5. ~~**Incluir `mealType` en exportación CSV**~~ ✅ commit `5445dd9`
6. ~~**Limpiar código muerto y resolver lints principales**~~ ✅ commit `5445dd9`
7. ~~**Conectar `useFieldConfig` en el Dashboard**~~ ✅ resuelto dinámicamente en `App.jsx`
8. ~~**Implementar importación JSON y copias de seguridad**~~ ✅ `importFromJSON` + `BackupRestore.jsx`
9. ~~**Implementar edición de registros guardados**~~ ✅ Edición inline en `HistoryView` con guardado reactivo y soporte de campos estándar y opcionales
10. ~~**Añadir filtros al histórico**~~ ✅ Filtros interactivos por tipo de comida (sólida/pastosa/líquida) y alertas clínicas (síntomas > 5, adherencia < 75%)
11. ~~**Completar ciclo de vida del Service Worker**~~ ✅ Evento `activate` para purgar cachés obsoletas, `skipWaiting`, `clients.claim`, precacheo y estrategia híbrida network-first/cache-first
12. ~~**Gráficas visuales de evolución temporal de síntomas**~~ ✅ Visualizador interactivo vectorial `TrendsView` con curvas SVG de dolor, hinchazón, reflujo, adherencia y Bristol, agrupación día a día o comida a comida, e insights clínicos
13. **Módulo de suplementación y medicación activa**: Gestión de tomas diarias (enzimas, probióticos, antimicrobianos) sincronizado con el protocolo.
14. **Recordatorios periódicos programados**: Alarmas o notificaciones locales para tomas de infusiones cada 4 horas.



