# Digestive SpeedRun Tracker - Guía de Desarrollo

Este documento contiene información útil para desarrolladores que trabajen en este proyecto.

## 🚀 Comandos de Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```
Inicia Vite en modo hot-reload. Por defecto en http://localhost:5173

### Compilar para producción
```bash
npm run build
```
Genera build optimizado en `dist/`. Minifica CSS, JS y optimiza assets.

### Previsualizar build de producción
```bash
npm run preview
```
Sirve el build de producción localmente para testing antes de deploy.

### Linting
```bash
npm run lint
```
Ejecuta oxlint para análisis de código. Oxlint es ultra rápido comparado con ESLint.

## 🧪 Verificación

Antes de hacer commit o deploy, ejecuta:

```bash
# 1. Linting
npm run lint

# 2. Build (verifica que compile)
npm run build

# 3. Verificar que el servidor de desarrollo funcione
npm run dev
```

## 📦 Dependencias Clave

### Runtime
- `react@19.2.8`: Framework UI
- `react-dom@19.2.8`: Renderizado en DOM
- `lucide-react@1.49.0`: Iconos

### DevDependencies
- `vite@8.3.0`: Build tool
- `@vitejs/plugin-react@6.1.1`: Plugin React para Vite
- `tailwindcss@4.3.3`: Framework CSS (última versión)
- `@tailwindcss/postcss@4.3.3`: Plugin PostCSS para Tailwind v4
- `postcss@8.5.28`: Procesador CSS
- `autoprefixer@10.6.1`: Prefijos automáticos (incluido en @tailwindcss/postcss)
- `oxlint@1.81.0`: Linter ultra rápido

## 🔧 Configuración

### Tailwind CSS v4
Este proyecto usa Tailwind CSS v4, que es diferente a v3:

- No usa `@tailwind` directives, usa `@import "tailwindcss"`
- Los colores personalizados se definen en CSS con `@theme`, no en `tailwind.config.js`
- El plugin PostCSS es `@tailwindcss/postcss`, no `tailwindcss` directamente

### PWA
El proyecto está configurado como PWA:

- `public/manifest.json`: Configuración de instalación
- `public/sw.js`: Service Worker para offline
- `src/main.jsx`: Registro del Service Worker

### LocalStorage Keys
- `digestive-adherence`: Estado de adherencia diaria
- `digestive-symptoms`: Estado de síntomas diarios
- `digestive-notes`: Notas libres
- `digestive-logs`: Array de logs históricos
- `digestive-protocol-start`: Fecha de inicio del protocolo (YYYY-MM-DD)
- `digestive-timer-state`: Estado del timer de vaciado gástrico (persistente)
- `digestive-gemini-key`: API key de Gemini (encriptada con Web Crypto API)
- `digestive-gemini-model`: Modelo seleccionado (default: 'gemini-1.5-pro')
- `digestive-gemini-requests`: Contador de requests en última hora (rate limiting)
- `digestive-gemini-tokens`: Contador de tokens usados hoy
- `digestive-first-run-seen`: Flag si wizard de introducción a IA se mostró
- `digestive-last-analysis`: Último análisis de IA guardado

## 🐛 Debugging

### Ver localStorage en navegador
Abre DevTools → Application → Local Storage → http://localhost:5173

### Ver Service Worker
Abre DevTools → Application → Service Workers

### Ver notificaciones
Abre DevTools → Application → Notifications

### Ver build stats
Después de `npm run build`, revisa el output para ver tamaños de bundles y gzip.

## 📱 Testing en Móvil

### Local Network
Para testear en móvil conectado a la misma red:

```bash
npm run dev -- --host
```

Luego accede desde el móvil usando la IP de tu máquina.

### PWA Installation
1. Abre la app en Chrome/Safari móvil
2. Toca "Add to Home Screen" o "Instalar"
3. Verifica que funcione offline (desconecta WiFi y recarga)

## 🔄 Git Workflow

### Mensajes de commit
Usa formato convencional:
```
feat: añadir módulo de medicación
fix: corregir error en timer de vaciado gástrico
docs: actualizar README con nuevas instrucciones
refactor: simplificar hook useLocalStorage
```

### Branches
- `main`: Rama principal (producción)
- `feature/*`: Nuevas características
- `fix/*`: Correcciones de bugs
- `docs/*`: Documentación

## 🎨 Colores del Sistema

- `--color-dark-bg`: #121212 (fondo principal)
- `--color-dark-surface`: #1E1E1E (tarjetas/superficies)
- `--color-dark-success`: #10B981 (éxito/adherencia)
- `--color-dark-alert`: #EF4444 (alertas/síntomas severos)

## 📊 Arquitectura de Componentes

### Componentes Atómicos
- `Toggle`: Interruptor booleano (usado en adherencia)
- `Slider`: Deslizador numérico (usado en síntomas)
- `BristolScale`: Selector de escala Bristol
- `GastricTimer`: Timer de 45 min con controles

### Hooks Personalizados
- `useLocalStorage`: Sincroniza estado con localStorage
- `useNotifications`: Gestiona Web Push Notifications
- `useGeminiAPI`: Llamadas a Gemini API con error handling y timeout
- `useGeminiRateLimit`: Rate limiting y tracking de tokens (límite: 10/hora local, 1500/día Gemini)

### Utilidades
- `exportData`: Exportación/importación de datos (CSV, JSON)
- `geminiPrompts`: Generación de prompts optimizados para Gemini
- `cryptoUtils`: Encriptación/desencriptación con Web Crypto API (AES-GCM)

### Componente Principal
- `App`: Dashboard que orquesta todos los módulos

## 🔐 Seguridad

### Integración con Gemini API (v1.2)
- **Opt-in Model:** La IA es opt-in, no obligatoria. Privacidad por defecto.
- **API Key Storage:** Encriptada con Web Crypto API (AES-GCM) usando PIN del usuario
- **Encriptación:**
  - Algoritmo: AES-GCM (Galois/Counter Mode)
  - Key derivation: PBKDF2 con 100,000 iteraciones
  - IV: Random por cada encriptación
  - PIN mínimo: 4 caracteres
- **Rate Limiting:**
  - Límite local: 10 requests/hora (prevenir uso accidental)
  - Límite Gemini: 1500 requests/día (tier gratuito)
  - Política: NUNCA pagar, usar solo tier gratuito
- **Datos que se envían a Gemini:**
  - Logs de adherencia y síntomas
  - Tipo de comida
  - Notas
  - Fecha/hora de registros
- **Datos que NO se envían:**
  - Identificadores personales
  - Ubicación
  - Metadata
- **Flujo Opt-in:**
  1. First-run wizard explica feature de IA
  2. Usuario configura API key + PIN
  3. Usuario elige modelo (gemini-1.5-pro default, gemini-2.0-flash opcional)
  4. Confirmación antes de enviar datos
  5. Usuario puede borrar API key en cualquier momento

### Seguridad General
- No se almacenan credenciales ni datos sensibles sin encriptación
- localStorage es vulnerable a XSS (mitigado con encriptación para API key)
- Para producción con datos sensibles, considerar:
  - Migrar a backend con autenticación
  - Usar IndexedDB con encriptación
  - Implementar CSP headers

## 🚨 Errores Comunes

### Tailwind no funciona
- Verifica que `@import "tailwindcss"` esté en `index.css`
- Verifica que `@tailwindcss/postcss` esté en `postcss.config.js`
- Reinicia el servidor de desarrollo

### Service Worker no registra
- Verifica que `sw.js` esté en `public/`
- Verifica que el registro sea en `window.addEventListener('load')`
- Revisa consola para errores de HTTPS (SW requiere HTTPS o localhost)

### LocalStorage no persiste
- Verifica que el navegador no esté en modo privado
- Verifica que no haya cuota de localStorage llena
- Revisa la consola para errores de permisos

## 📈 Performance

### Bundle Size
El build actual produce:
- CSS: ~12 KB (gzip: ~3 KB)
- JS: ~233 KB (gzip: ~73 KB)

Esto es aceptable para MVP pero puede optimizarse:
- Code splitting por ruta
- Lazy loading de componentes
- Tree shaking de lucide-react (solo iconos usados)

### Runtime Performance
- React 19 con concurrent features
- Vite HMR para desarrollo rápido
- Service Worker para offline instantáneo

## 🎯 Próximos Pasos

1. Añadir iconos PWA reales
2. Implementar vista de histórico
3. Añadir gráficos de evolución
4. Exportación de datos
5. Migrar a TypeScript
6. Añadir tests (Vitest + React Testing Library)
