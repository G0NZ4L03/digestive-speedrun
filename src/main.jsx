import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ============================================================================
// MAIN.JSX - PUNTO DE ENTRADA DE LA APLICACIÓN
// ============================================================================

/**
 * Este es el archivo que se ejecuta primero cuando la app carga.
 * Responsabilidades:
 * 1. Importar y montar el componente raíz (App)
 * 2. Registrar el Service Worker para funcionalidad PWA
 * 3. Renderizar la app en el DOM
 *
 * StrictMode es un wrapper de React que:
 * - Detecta side effects no seguros
 * - Doble-renderiza componentes en desarrollo para detectar problemas
 * - Advierte sobre uso de APIs legacy
 * NO afecta al comportamiento en producción.
 */

// Registro del Service Worker para PWA
// Solo se registra si el navegador lo soporta
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado:', registration.scope);
      })
      .catch((error) => {
        console.log('SW falló:', error);
      });
  });
}

// Montar la app en el DOM
// createRoot es la API moderna de React 18+ (reemplaza a ReactDOM.render)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
 * NOTA: El service worker se registra en 'load' para asegurar que
 * la página haya cargado completamente antes de intentar registrar.
 * Esto evita condiciones de carrera y problemas de rendimiento.
 *
 * FUTURO: Mejoras posibles:
 * - Añadir error boundary para capturar errores de renderizado
 * - Añadir tracking de errores (Sentry, etc.)
 * - Añadir precaching de assets estáticos en el SW
 */
