import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// ============================================================================
// CONFIGURACIÓN DE VITE - DIGESTIVE SPEEDRUN TRACKER
// ============================================================================

/**
 * Vite es nuestro build tool y servidor de desarrollo.
 * Se caracteriza por ser extremadamente rápido gracias a ESM nativo.
 *
 * El plugin @vitejs/plugin-react añade soporte para:
 * - JSX/TSX (transformación de React)
 * - Fast Refresh (hot module replacement sin perder estado)
 * - Optimización automática de dependencias
 *
 * NOTA: Esta configuración es mínima pero suficiente para el MVP.
 * Para producción podríamos añadir:
 * - build.rollupOptions para optimización avanzada
 * - server.proxy para API calls
 * - define para variables de entorno
 */

export default defineConfig({
  plugins: [react()],
  base: '/digestive-speedrun/',
})

/*
 * FUTURO: Configuraciones a considerar cuando crezca el proyecto:
 * - build.target: 'es2015' o superior para navegadores modernos
 * - build.sourcemap: true para debugging en producción
 * - server.port: puerto fijo para consistencia
 * - preview.port: puerto fijo para preview de producción
 */
