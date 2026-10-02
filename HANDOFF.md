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
- **Histórico de logs**: Listado cronológico en `HistoryView` con visualización expandible, badges de severidad por colores y eliminación individual o colectiva.
- **Exportación de datos**: Descarga directa en JSON, CSV completo y CSV resumido (con cabecera UTF-8 BOM para compatibilidad con Microsoft Excel).
- **Generador de prompts para LLM**: Función en `HistoryView` que formatea el historial o el día actual en Markdown estructurado y lo copia al portapapeles para análisis en Gemini.
- **PWA base**: Manifiesto e instalación básica con Service Worker funcional para caché inicial.
- **Reset de protocolo**: Purgado completo de datos con doble confirmación de seguridad.

---

## 6. Qué está a medias o incompleto

- **Desconexión de `useFieldConfig` en el Dashboard**: Aunque existe `FieldConfig.jsx` y `useFieldConfig.js` con soporte para campos avanzados (`supplements`, `energy`, `sleep`, `stress`, `mealTime`, `mealLocation`), en `App.jsx` los campos del dashboard están codificados fijos en JSX y no utilizan `isFieldActive` ni `getActiveFields`.
- **Código muerto / duplicado de `generateGeminiPrompt`**: Existe una implementación completa de `generateGeminiPrompt` en `App.jsx` (líneas 183-246) que nunca se ejecuta ni se vincula a ningún botón; la que se utiliza realmente es la de `HistoryView.jsx`.
- **Reactividad rota en `useDailySummary`**: El hook escucha únicamente el evento `window.onstorage`, el cual según la especificación web **solo se dispara en otras pestañas**. Al guardar un registro diario en la pestaña actual, el contador de logs y porcentaje de adherencia en el header no se actualizan hasta refrescar manualmente.
- **Service Worker incompleto**: `public/sw.js` solo tiene en caché `['/']`. No realiza precacheo de los bundles `assets/*.js` o `assets/*.css`, ni implementa el evento `activate` para limpiar versiones antiguas de caché (`digestive-sr-v1`).
- **Inconsistencia en exportación CSV**: `exportData.js` no incluye la columna `mealType` (sólida/pastosa/líquida) en el CSV a pesar de que se captura y almacena en cada registro.
- **Navegación sin enrutador**: La alternancia de vistas se gestiona mediante un estado local `currentView` sin URLs ni soporte para el botón de retroceso nativo del navegador móvil.
- **Roadmap clínico pendiente (especificado en README.md)**:
  - Módulo de suplementación y medicación activa.
  - Recordatorios periódicos programados (ej. infusiones cada 4 horas).
  - Gráficas visuales de evolución temporal de síntomas.
  - Importador de datos (para restaurar backups JSON).

---

## 7. Bugs y riesgos detectados

- **Incompatibilidad de rutas absolutas con `base: '/digestive-speedrun/'`**:
  - En `vite.config.js` se define `base: '/digestive-speedrun/'` para GitHub Pages. Sin embargo:
    - En `main.jsx`: `navigator.serviceWorker.register('/sw.js')` busca en la raíz del dominio (`/sw.js`), provocando error 404 en GitHub Pages.
    - En `index.html`: `<link rel="manifest" href="/manifest.json" />` y `<link rel="icon" ... href="/icon.svg" />` están con ruta absoluta a la raíz.
    - En `public/manifest.json`: `"start_url": "/"` y las rutas de iconos no contemplan el subdirectorio.
- **Fallo de `new Notification()` en navegadores móviles (iOS PWA / Chrome Android)**:
  - En `useNotifications.js`, instanciar `new Notification()` en el contexto de ventana suele fallar o arrojar excepción (`TypeError: Illegal constructor`) en navegadores móviles donde se exige `ServiceWorkerRegistration.showNotification()`.
- **Cálculo defectuoso de fechas en `useProtocolDate`**:
  - Utiliza `Math.abs(now - start)`. Si el usuario ingresa por error una fecha futura, el cálculo arroja días positivos en lugar de bloquearse o indicar día 0.
  - Comparar `new Date("YYYY-MM-DD")` (interpretado en UTC) contra `new Date()` (hora local) genera discrepancias de un día en función de la zona horaria del usuario.
- **Refresco forzado destructivo con `window.location.reload()`**:
  - Tanto `deleteLog` y `deleteAllLogs` en `HistoryView` como `resetProtocol` fuerzan una recarga completa de la ventana para sincronizarse con `localStorage`, reiniciando cualquier temporizador o estado volátil en curso.
- **Riesgo crítico de pérdida de datos por dependencia exclusiva de `localStorage`**:
  - Si el usuario borra datos del navegador o el sistema operativo móvil purga almacenamiento por falta de espacio (comportamiento documentado en WebKit/iOS), se pierde todo el historial sin posibilidad de recuperación.
- **14 advertencias en `npm run lint` (`oxlint`)**:
  - Acceso a variable durante inicialización (`getInitialConfig` en `useFieldConfig.js`).
  - Variables e imports no utilizados (`useEffect` en `useLocalStorage` y `useFieldConfig`; `Copy`, `avgPain`, `getActiveFields`, `isFieldActive` en `App.jsx`).
  - Llamadas a funciones impuras durante el render (`new Date()` en `useDailySummary.js` y `HistoryView.jsx`).
  - Actualización síncrona de estado dentro de `useEffect` (`useNotifications.js`).

---

## 8. Siguientes 10 pasos recomendados

1. **Corregir rutas PWA y Service Worker para subpath**: Adaptar el registro de `sw.js`, el link al manifiesto e iconos para utilizar rutas relativas o acordes a `import.meta.env.BASE_URL`.
2. **Actualizar API de notificaciones para móvil**: Reemplazar `new Notification` en `useNotifications.js` por `navigator.serviceWorker.ready.then(reg => reg.showNotification(...))` con manejo de errores `try/catch`.
3. **Conectar o simplificar `useFieldConfig`**: Conectar los campos del Dashboard en `App.jsx` con `isFieldActive` para que el usuario pueda realmente ocultar/mostrar métricas, o eliminar la funcionalidad para reducir complejidad.
4. **Subsanar reactividad en `useDailySummary`**: Disparar un evento personalizado (ej. `window.dispatchEvent(new Event('digestive-log-updated'))`) al guardar logs para actualizar el resumen de adherencia inmediatamente sin recargar.
5. **Eliminar `window.location.reload()`**: Reemplazar los refrescos de ventana en `HistoryView.jsx` y `ResetProtocol.jsx` por gestión de estado reactivo mediante setters de React.
6. **Robustecer cálculo de días en `useProtocolDate`**: Evitar `Math.abs`, homogeneizar el uso de fechas en hora local y limitar el rango entre día 1 y 14.
7. **Incluir `mealType` en exportación CSV**: Agregar la columna de tipo de comida en `exportToCSV` dentro de `src/utils/exportData.js`.
8. **Limpiar código muerto y resolver lints**: Unificar `generateGeminiPrompt` en un único utilitario, eliminar imports huérfanos y solventar las 14 advertencias de `oxlint`.
9. **Implementar función de importación JSON**: Crear una utilidad de restauración de backup (`importFromJSON`) en la vista de configuración para mitigar el riesgo de pérdida de `localStorage`.
10. **Completar ciclo de vida del Service Worker**: Añadir evento `activate` para purgar cachés obsoletas y definir estrategia de caché adecuada (`stale-while-revalidate` o `network-first`) para los assets compilados.
