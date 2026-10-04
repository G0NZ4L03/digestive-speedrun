# Digestive SpeedRun Tracker

Tracker clínico MVP para seguimiento de protocolo de recuperación intestinal de 14 días. Diseñado para monitorear adherencia y síntomas en pacientes con disbiosis intestinal, SIBO/FODMAPs y dolor en nervio frénico.

## 🎯 Objetivo Clínico

Este tracker fue diseñado para ejecutar un estricto protocolo de recuperación ("Speed Run") de 14 días para revertir:

- **Disbiosis intestinal** y sobrecrecimiento bacteriano (SIBO/FODMAPs)
- **Obstrucción mecánica** que genera acumulación de gas en el ángulo hepático
- **Dolor en nervio frénico** (clavícula derecha) debido a presión gaseosa

El protocolo se basa en:
- Vaciado gástrico ultrarrápido
- Evitación de fermentación (carbohidratos como almidón hidrolizado/gelatinizado)
- Proteína escalfada muy blanda
- Cero edulcorantes artificiales (sucralosa)
- Máxima activación del Complejo Motor Migratorio (CMM)

## 🚀 Stack Tecnológico

- **Frontend**: React 19.2.8 + Vite 8.3.0
- **Estilos**: Tailwind CSS v4.3.3 (última versión)
- **Persistencia**: localStorage (sin backend por ahora)
- **PWA**: Service Worker + Manifest para instalación nativa
- **Iconos**: lucide-react (biblioteca ligera y moderna)
- **Build**: Vite con optimización automática
- **Lint**: oxlint (ultra rápido)

## 📦 Versiones

### v1.1 - Versión Actual ✅
*Estado: Completa y desplegada en GitHub Pages*

**Características implementadas:**
- ✅ Timer de vaciado gástrico (45 min con persistencia y background)
- ✅ Módulo de Adherencia (toggles + slider de ayuno 6-16h)
- ✅ Módulo de Síntomas (sliders + escala Bristol)
- ✅ Selector de tipo de comida (sólida/pastosa/líquida)
- ✅ Configuración de campos dinámica (usuario elige qué trackear)
- ✅ Campos opcionales (suplementos, horario, energía, sueño, estrés)
- ✅ Histórico con filtros y edición inline
- ✅ Exportación (JSON, CSV completo, CSV simple)
- ✅ Importación de backups JSON
- ✅ Gráficas de tendencias visuales
- ✅ Summary del día (adherencia %, tiempo último registro)
- ✅ Validación de datos
- ✅ Reset del protocolo sin recarga
- ✅ PWA con Service Worker robusto
- ✅ Notificaciones híbridas (SW + fallback)
- ✅ Sincronización reactiva entre pestañas
- ✅ Rutas correctas para GitHub Pages
- ✅ 0 errores/advertencias de linter

**Enlace:** https://g0nz4l03.github.io/digestive-speedrun/

### v1.2 - En Desarrollo 🚧
*Estado: Planificación completa, listo para implementar*

**Objetivo Principal:** Integración con Gemini API para análisis clínico automatizado

**Enfoque:** Opt-in, mínima fricción, privacidad por defecto

**Características planeadas:**
- [ ] Configuración de API key de Gemini (opt-in)
- [ ] Integración directa con Gemini API desde frontend
- [ ] Panel de análisis IA con resultados estructurados
- [ ] Prompts mejorados para análisis clínico profundo
- [ ] Fallback a modo local (copiar prompt) si falla IA
- [ ] Banner informativo en Dashboard
- [ ] Confirmación antes de enviar datos a IA
- [ ] Historial de análisis (últimos 3)

**Seguridad:**
- Privacidad por defecto (nada se comparte sin consentimiento)
- API key guardada en localStorage (en dispositivo del usuario)
- Usuario puede borrar API key en cualquier momento
- Datos que se envían: logs de adherencia/síntomas, notas, fecha/hora
- **NO** se envían: identificadores personales, ubicación, metadata

**Plan detallado:** Ver `docs/v1.2-plan.md`

## 📱 Características (v1.1)

### Módulo de Adherencia
- Toggles para reglas del protocolo:
  - Arroz recién hecho y baboso
  - Proteína escalfada/blanda
  - Cero edulcorantes artificiales
  - Cero alimentos/bebidas frías
- Slider de ayuno nocturno (6-16h, colores invertidos)
- Campos opcionales: suplementos, horario comida, lugar comida

### Módulo de Síntomas
- Sliders (0-10) para:
  - Dolor en nervio frénico
  - Distensión abdominal / gas
  - Reflujo / acidez
- Escala de Bristol (1-7)
- Campos opcionales: energía, sueño, estrés, movimientos intestinales

### Timer de Vaciado Gástrico
- Cuenta atrás de 45 minutos
- Persistencia en localStorage
- Funciona en background (Page Visibility API)
- Alerta visual y Web Notification al completar
- Mensaje: "Vaciado gástrico inicial completado. Vía libre para infusión tibia"

### Configuración
- Fecha de inicio del protocolo configurable
- Cálculo automático del día actual (1-14)
- Campos configurables (usuario elige qué trackear)
- Presets de configuración (futuro)

### Histórico
- Logs expandibles con detalles
- Indicadores de adherencia (%) con colores semánticos
- Indicadores de severidad de síntomas con colores
- **Filtros avanzados:**
  - Por tipo de comida (sólida/pastosa/líquida)
  - Por alertas clínicas (síntomas > 5, adherencia < 75%)
- **Edición inline** de registros
- **Exportación de datos:**
  - CSV completo (todas las métricas)
  - CSV simplificado (solo métricas clave)
  - JSON (para backup o análisis técnico)
- **Importación de backups JSON**
- **Generación de prompts para Gemini** (hoy vs completo)

### Gráficas de Tendencias
- Visualización SVG interactiva
- Curvas de dolor, distensión, reflujo
- Adherencia % y Escala Bristol
- Agrupación por día o por comida
- Insights clínicos (mejora vs empeoramiento)
- Modo demo con datos de ejemplo

### Otros
- Summary del día (adherencia %, último registro hace X min)
- Validación de datos (requiere al menos un campo de adherencia)
- Reset del protocolo con doble confirmación
- PWA instalable en móvil
- Modo offline completo
- Notificaciones híbridas (Service Worker + fallback)
- Sincronización reactiva entre pestañas
- Toast notifications para feedback visual

## 🎨 Diseño UI/UX

- **Tema**: Dark Mode nativo (#121212 fondo, #1E1E1E superficies)
- **Interacción**: Fricción cero - todo basado en Toggles y Sliders
- **Optimizado para móvil**: Uso con una sola mano, fatiga visual cero
- **Colores semánticos**:
  - Verde esmeralda (#10B981): Éxito/Adherencia
  - Rojo suave (#EF4444): Alertas/Síntomas severos
  - Azul (#3B82F6): Información secundaria

## 🛠️ Instalación y Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/G0NZ4L03/digestive-speedrun.git
cd digestive-speedrun

# Instalar dependencias
npm install

# Generar iconos PWA (opcional, ya están generados)
npm run generate-icons

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Deploy a GitHub Pages
npm run deploy
```

## 📂 Estructura del Proyecto

```
digestive-speedrun/
├── public/
│   ├── manifest.json      # Configuración PWA
│   ├── sw.js              # Service Worker para offline
│   ├── icon.svg           # Icono SVG personalizado
│   └── icon-*.png         # Iconos PWA (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── Toggle.jsx          # Interruptor booleano SÍ/NO
│   │   ├── Slider.jsx          # Deslizador numérico 0-10
│   │   ├── GastricTimer.jsx    # Timer de 45 min
│   │   ├── BristolScale.jsx    # Selector Escala Bristol
│   │   ├── MealTypeSelector.jsx # Tipo de comida
│   │   ├── ProtocolSettings.jsx # Configuración protocolo
│   │   ├── HistoryView.jsx     # Histórico con filtros
│   │   ├── ProgressBar.jsx     # Barra de progreso
│   │   ├── ViewTransition.jsx  # Transiciones suaves
│   │   ├── Toast.jsx           # Notificaciones visuales
│   │   ├── FieldConfig.jsx     # Configuración de campos
│   │   ├── ResetProtocol.jsx   # Reset completo
│   │   ├── BackupRestore.jsx   # Backup/restore
│   │   └── TrendsView.jsx      # Gráficas de tendencias
│   ├── hooks/
│   │   ├── useLocalStorage.js      # Persistencia en localStorage
│   │   ├── useNotifications.js    # Web Push Notifications
│   │   ├── usePersistentTimer.js  # Timer con persistencia
│   │   ├── useProtocolDate.js    # Fecha inicio protocolo
│   │   ├── useDailySummary.js    # Summary del día
│   │   └── useFieldConfig.js     # Configuración de campos
│   ├── utils/
│   │   └── exportData.js         # Exportación/importación
│   ├── App.jsx                # Componente principal (Dashboard)
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales + Tailwind
├── docs/
│   └── v1.2-plan.md           # Plan de desarrollo v1.2
├── index.html                 # HTML entry point
├── package.json               # Dependencias y scripts
├── vite.config.js             # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind
├── postcss.config.js          # Configuración de PostCSS
├── HANDOFF.md                 # Documento de transferencia técnica
├── AGENTS.md                  # Manual para desarrolladores
├── CHANGELOG.md               # Historial de versiones
└── README.md                  # Este archivo
```

## 💾 Persistencia de Datos

La app usa **localStorage** para persistencia local sin backend:

- `digestive-logs`: Array de logs históricos (con timestamp)
- `digestive-adherence`: Estado de adherencia diaria
- `digestive-symptoms`: Estado de síntomas diarios
- `digestive-notes`: Notas libres del usuario
- `digestive-protocol-start`: Fecha de inicio del protocolo
- `digestive-timer-state`: Estado del timer (persistente)
- `digestive-field-config`: Configuración de campos activos

Los datos sobreviven a refresh del navegador pero no se sincronizan entre dispositivos.

## 🔔 Notificaciones

La app solicita permiso para Web Push Notifications para:
- Alerta cuando el timer de vaciado gástrico completa (45 min)
- Confirmación de guardado exitoso del log diario

Las notificaciones funcionan tanto en foreground como en background (cuando la app está instalada como PWA). Usa Service Worker con fallback a `new Notification()`.

## 🌐 PWA Installation

La app está configurada como Progressive Web App y puede instalarse:

1. Abre la app en Chrome/Safari en móvil
2. Toca el botón "Add to Home Screen" o "Instalar"
3. La app aparecerá como app nativa con icono propio
4. Funciona offline gracias al Service Worker

## Roadmap

### v1.2 - En Desarrollo 🚧
**Objetivo:** Integración con Gemini API para análisis clínico automatizado

**Enfoque:** Opt-in, mínima fricción, privacidad por defecto

**Características:**
- [ ] Configuración de API key de Gemini (opt-in)
- [ ] Integración directa con Gemini API desde frontend
- [ ] Panel de análisis IA con resultados estructurados
- [ ] Prompts mejorados para análisis clínico profundo
- [ ] Fallback a modo local (copiar prompt) si falla IA
- [ ] Banner informativo en Dashboard
- [ ] Confirmación antes de enviar datos a IA
- [ ] Historial de análisis (últimos 3)

**Plan detallado:** Ver `docs/v1.2-plan.md`

### v1.3 - Futuro
**Comodidad:**
- [ ] Recordatorios programados (infusiones cada 4h)
- [ ] Modo quick-entry (registro rápido sin cambiar de vista)
- [ ] Gestión de suplementos/medicación
- [ ] Presets de configuración (básico, intermedio, avanzado)

**Seguridad:**
- [ ] Backup automático periódico
- [ ] Exportación programada (diario/semanal)
- [ ] Pin/biometría para abrir la app (PWA)

**Atajos:**
- [ ] Quick actions en header (botón rápido para guardar)
- [ ] Swipe gestures en móvil (swipe para borrar/editar)
- [ ] Atajos de teclado en desktop

**Integraciones:**
- [ ] FatSecret API (automatizar tracking de comida)
- [ ] Más campos configurables (temperatura corporal, peso, etc.)
- [ ] Custom presets de configuración
- [ ] Múltiples protocolos (protocolo A, B, C)

**UX/UI:**
- [ ] Modo compacto para visualización rápida
- [ ] Dark mode más refinado con más contrastes
- [ ] Celebraciones cuando se cumplen objetivos
- [ ] Animaciones de carga más suaves
- [ ] Feedback háptico en móvil (vibración al guardar)
- [ ] Accesibilidad mejorada (VoiceOver, TalkBack)

### v1.4 - Futuro Lejano
- [ ] Navegación con enrutador formal (React Router)
- [ ] Gamificación (streaks, achievements)
- [ ] Migración a IndexedDB
- [ ] Modo multiusuario (familia, caregivers)

## 🧪 Testing

```bash
# Ejecutar linter
npm run lint
```

## 📝 Licencia

Este proyecto es de uso personal para seguimiento clínico. No destinado a uso médico profesional.

## 🤝 Contribuciones

Este es un proyecto personal. Si encuentras bugs o tienes sugerencias, abre un issue en el repositorio.

---

**Nota**: Este tracker es una herramienta de apoyo y no sustituye el consejo médico profesional. Siempre consulta con tu especialista digestivo.
