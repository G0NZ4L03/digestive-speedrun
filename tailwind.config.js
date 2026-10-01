/** @type {import('tailwindcss').Config} */

// ============================================================================
// CONFIGURACIÓN DE TAILWIND CSS V4 - DIGESTIVE SPEEDRUN TRACKER
// ============================================================================

/**
 * Tailwind CSS v4 es la última versión que usa @import en lugar de @tailwind directives.
 * Esta configuración es mínima porque la mayor parte de la configuración
 * se hace directamente en src/index.css usando @theme.
 *
 * La propiedad 'content' indica a Tailwind dónde buscar clases para generar el CSS final.
 * Usamos glob patterns para incluir:
 * - index.html (archivo HTML principal)
 * - Todos los archivos JS/TS/JSX/TSX en src/ (componentes React)
 *
 * NOTA: En Tailwind v4, los colores personalizados se definen en el CSS con @theme,
 * no aquí. Esto permite una configuración más cohesiva y tipo CSS nativo.
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}

/*
 * RAZÓN DE ESTA CONFIGURACIÓN:
 * - Minimalista: Solo lo necesario para que Tailwind escanee los archivos
 * - Escalable: Si añadimos más directorios, solo hay que actualizar este array
 * - Performance: Tailwind solo incluye las clases que realmente usamos (tree-shaking)
 *
 * FUTURO: Si el proyecto crece, podríamos añadir:
 * - safelist: para clases dinámicas que no detecta el escaneo
 * - theme.extend: para utilidades personalizadas
 * - plugins: para extensiones específicas
 */
