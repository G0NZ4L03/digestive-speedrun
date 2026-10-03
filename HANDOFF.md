# HANDOFF: Digestive SpeedRun Tracker

Documento de transferencia y análisis técnico del estado actual del repositorio.

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
- **Persistencia básica**: Guardado local reactivo de estado actual (`digestive-adherence`, `digestive-symptoms`, `digestive-notes`) y de registros acumulados (`digestive-logs`).
- **Histórico de logs**: Listado cronológico en `HistoryView` con visualización expandible, badges de severidad por colores y eliminación individual o colectiva. La lista es ahora **completamente reactiva** (sin recarga de página).
- **Exportación de datos completa**: Descarga directa en JSON, CSV completo y CSV resumido (con cabecera UTF-8 BOM para compatibilidad con Microsoft Excel), incluyendo la columna `Tipo de Ingesta` (Sólida/Pastosa/Líquida).
- **Generador de prompts para LLM**: Función en `HistoryView` que formatea el historial o el día actual en Markdown estructurado y lo copia al portapapeles para análisis en Gemini.
- **PWA con rutas correctas para GitHub Pages**: `main.jsx` usa `import.meta.env.BASE_URL` para registrar el SW; `index.html` usa `%BASE_URL%` para el icono y el manifest; `manifest.json` usa `./` en `start_url`, `scope` e iconos. El build de Vite resuelve todo correctamente bajo `/digestive-speedrun/`.
- **Notificaciones PWA híbridas y robustas**: `useNotifications.js` utiliza `registration.showNotification` con timeout de 2s vía `Promise.race` para evitar bloqueos si no hay SW, fallback automático a `new Notification` y solicitud de permisos exclusivamente bajo gesto del usuario.
- **Cálculo de fechas robusto**: `useProtocolDate.js` normaliza a medianoche local, evita `Math.abs`, acota estrictamente entre Día 1 y 14, y actualiza el día dinámicamente con listener de `visibilitychange`.
- **Reset de protocolo**: Purgado completo de datos con doble confirmación de seguridad y **sin recarga forzada** — preserva el temporizador gástrico en curso.
- **Sincronización reactiva de logs**: Bus de evento personalizado `digestive-logs-updated` que propaga cambios en `localStorage` a `useDailySummary` e `HistoryView` dentro de la misma pestaña sin depender de `window.onstorage`.

---

## 6. Qué está a medias o incompleto

- **Desconexión de `useFieldConfig` en el Dashboard**: Aunque existe `FieldConfig.jsx` y `useFieldConfig.js` con soporte para campos avanzados (`supplements`, `energy`, `sleep`, `stress`, `mealTime`, `mealLocation`), en `App.jsx` los campos del dashboard están codificados fijos en JSX y no utilizan `isFieldActive` ni `getActiveFields`.
- **Service Worker incompleto**: `public/sw.js` cachea `['./']` (corregido de `['/']`). No realiza precacheo de los bundles `assets/*.js` o `assets/*.css`, ni implementa el evento `activate` para limpiar versiones antiguas de caché (`digestive-sr-v1`).
- **Navegación sin enrutador**: La alternancia de vistas se gestiona mediante un estado local `currentView` sin URLs ni soporte para el botón de retroceso nativo del navegador móvil.
- **Roadmap clínico pendiente (especificado en README.md)**:
  - Módulo de suplementación y medicación activa.
  - Recordatorios periódicos programados (ej. infusiones cada 4 horas).
  - Gráficas visuales de evolución temporal de síntomas.
  - Importador de datos (para restaurar backups JSON).
  - Edición de registros guardados (para corregir errores sin borrar).
  - Filtros en histórico (por tipo de comida, por rango de fechas).

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
- ~~**Código muerto y advertencias de linter reducidas drásticamente**~~ ✅ **RESUELTO**:
  - Eliminado `generateGeminiPrompt` duplicado en `App.jsx`, purgados imports no usados (`Copy`, `useEffect`) y corregida inicialización en `useFieldConfig.js`. De 14 avisos iniciales se ha bajado a solo **3 avisos** en `oxlint`.
- **Riesgo crítico de pérdida de datos por dependencia exclusiva de `localStorage`**:
  - Si el usuario borra datos del navegador o el sistema operativo móvil purga almacenamiento por falta de espacio (comportamiento documentado en WebKit/iOS), se pierde todo el historial sin posibilidad de recuperación hasta implementar un importador de backups.
- **3 advertencias residuales en `npm run lint` (`oxlint`)**:
  - Variables no utilizadas aún pendientes de conectar en Dashboard (`getActiveFields`, `isFieldActive` en `App.jsx`).
  - Dependencia de efecto en `usePersistentTimer.js` (`handleVisibilityChange`).

---

## 8. Siguientes pasos recomendados

> Los pasos ya completados han sido tachados. El orden refleja prioridad actual.

1. ~~**Corregir rutas PWA y Service Worker para subpath**~~ ✅ commit `f80192e`
2. ~~**Subsanar reactividad en `useDailySummary` y eliminar `window.location.reload()`**~~ ✅ commit `521ea6f`
3. ~~**Actualizar API de notificaciones para móvil**~~ ✅ resuelto con SW registration y fallback
4. ~~**Robustecer cálculo de días en `useProtocolDate`**~~ ✅ resuelto con medianoche local y rango 1-14
5. ~~**Incluir `mealType` en exportación CSV**~~ ✅ resuelto en CSV completo y simple
6. ~~**Limpiar código muerto y resolver lints principales**~~ ✅ `generateGeminiPrompt` eliminado, lints de 14 a 3
7. **Conectar o simplificar `useFieldConfig`**: Usar `isFieldActive` en el Dashboard (`App.jsx`) para que la configuración de campos tenga efecto real.
8. **Implementar importación JSON**: Crear `importFromJSON` en la vista de configuración para restaurar backups y mitigar riesgo de pérdida de datos.
9. **Implementar edición de registros guardados**: Permitir corregir un log existente sin borrarlo (modal de edición inline en `HistoryView`).
10. **Añadir filtros al histórico**: Por tipo de comida (`solid`/`soft`/`liquid`) y por rango de fechas.
11. **Completar ciclo de vida del Service Worker**: Evento `activate` para purgar cachés obsoletas + precacheo de bundles de assets compilados.


