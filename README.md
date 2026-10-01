# Digestive SpeedRun Tracker

MVP clínico para seguimiento de protocolo de recuperación intestinal de 14 días. Diseñado para monitorear adherencia y síntomas en pacientes con disbiosis intestinal, SIBO/FODMAPs y dolor en nervio frénico.

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

## 📱 Características

### Módulo de Adherencia (Acciones - Toggles booleanos)
Registro diario rápido de las reglas innegociables:
- ¿Arroz/carbohidrato recién hecho y baboso? (Evitar almidón resistente)
- ¿Proteína escalfada/blanda?
- ¿Cero edulcorantes artificiales consumidos hoy?
- ¿Cero alimentos o bebidas frías?
- Registro de horas de ayuno nocturno (Slider numérico, objetivo >12h)

### Módulo de Síntomas (Checklist Clínico - Sliders)
Registro al final del día para cruzar acciones con respuesta fisiológica:
- Dolor/Pinzamiento Nervio Frénico (0-10)
- Distensión Abdominal / Gas (0-10)
- Reflujo / Acidez (0-10)
- Escala de Bristol (1-7, selector visual descriptivo)

### Timer de Vaciado Gástrico
- Botón prominente: "Fin Comida Sólida"
- Cuenta atrás de 45 minutos
- **Persistencia**: El timer continúa contando aunque cierres la app
- Alerta visual + Web Push Notification al completar
- Mensaje: "Vaciado gástrico inicial completado. Vía libre para infusión tibia"

### Configuración del Protocolo
- Fecha de inicio configurable
- Cálculo automático del día actual del protocolo
- Persistencia de la configuración

### Histórico de Logs
- Visualización de todos los logs guardados
- Logs expandibles para ver detalles completos
- Indicadores de adherencia (porcentaje) con colores semánticos
- Indicadores de severidad de síntomas con colores semánticos
- Funcionalidad de borrar logs individuales o todos
- **Exportación de datos**:
  - CSV completo (todas las métricas)
  - CSV simplificado (solo métricas clave)
  - JSON (para backup o análisis técnico)

## 🎨 Diseño UI/UX

- **Tema**: Dark Mode nativo (#121212 fondo, #1E1E1E superficies)
- **Interacción**: Fricción cero - todo basado en Toggles y Sliders
- **Optimizado para móvil**: Uso con una sola mano, fatiga visual cero
- **Colores semánticos**:
  - Verde esmeralda (#10B981): Éxito/Adherencia
  - Rojo suave (#EF4444): Alertas/Síntomas severos

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
```

## 📂 Estructura del Proyecto

```
digestive-speedrun/
├── public/
│   ├── manifest.json      # Configuración PWA
│   ├── sw.js              # Service Worker para offline
│   └── icon-*.png         # Iconos PWA (placeholders)
├── src/
│   ├── components/
│   │   ├── Toggle.jsx     # Interruptor booleano SÍ/NO
│   │   ├── Slider.jsx     # Deslizador numérico 0-10
│   │   ├── GastricTimer.jsx # Timer de 45 min
│   │   └── BristolScale.jsx # Selector Escala Bristol
│   ├── hooks/
│   │   ├── useLocalStorage.js  # Persistencia en localStorage
│   │   └── useNotifications.js # Web Push Notifications
│   ├── App.jsx            # Componente principal (Dashboard)
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales + Tailwind
├── index.html             # HTML entry point
├── package.json           # Dependencias y scripts
├── vite.config.js         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind
└── postcss.config.js      # Configuración de PostCSS
```

## 💾 Persistencia de Datos

El MVP usa **localStorage** para persistencia local sin backend:

- `digestive-adherence`: Estado de adherencia diaria
- `digestive-symptoms`: Estado de síntomas diarios
- `digestive-notes`: Notas libres del usuario
- `digestive-logs`: Array de logs históricos (con timestamp)

Los datos sobreviven a refresh del navegador pero no se sincronizan entre dispositivos.

## 🔔 Notificaciones

La app solicita permiso para Web Push Notifications para:
- Alerta cuando el timer de vaciado gástrico completa (45 min)
- Confirmación de guardado exitoso del log diario

Las notificaciones funcionan tanto en foreground como en background (cuando la app está instalada como PWA).

## 🌐 PWA Installation

La app está configurada como Progressive Web App y puede instalarse:

1. Abre la app en Chrome/Safari en móvil
2. Toca el botón "Add to Home Screen" o "Instalar"
3. La app aparecerá como app nativa con icono propio
4. Funciona offline gracias al Service Worker

## 📊 Roadmap (Mejoras Futuras)

- [x] Vista de histórico de logs con gráficos de evolución
- [x] Exportación de datos (CSV, JSON) para compartir con médico
- [x] Configuración de fecha de inicio del protocolo
- [x] Persistencia del timer de vaciado gástrico
- [ ] Módulo de medicación/suplementos
- [ ] Recordatorios programados (ej: cada 4h infusión)
- [ ] Migración a IndexedDB para datos más grandes
- [ ] Iconos PWA reales (actuales son placeholders)
- [ ] Modo claro/oscuro
- [ ] Animaciones de transición entre secciones
- [ ] Análisis de correlación adherencia-síntomas
- [ ] Gráficos de evolución en el histórico
- [ ] Importación de datos (para restaurar backups)

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
