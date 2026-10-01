// ============================================================================
// CONFIGURACIÓN DE POSTCSS - DIGESTIVE SPEEDRUN TRACKER
// ============================================================================

/**
 * PostCSS es un procesador CSS que transforma el CSS con plugins.
 * En este proyecto usamos @tailwindcss/postcss que es el plugin oficial
 * para Tailwind CSS v4.
 *
 * NOTA IMPORTANTE: En Tailwind v4, usamos @tailwindcss/postcss en lugar de
 * tailwindcss directamente. Esto es un cambio importante respecto a v3.
 *
 * Ya no necesitamos autoprefixer porque @tailwindcss/postcss lo incluye
 * automáticamente. Esto simplifica la configuración.
 */

export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

/*
 * RAZÓN DE ESTA CONFIGURACIÓN:
 * - Simplificada: Solo un plugin necesario
 * - Futuro-ready: Compatible con Tailwind CSS v4
 * - Automática: Prefijos de navegadores se manejan internamente
 *
 * FUTURO: Si necesitamos más transformaciones CSS, podríamos añadir:
 * - postcss-nested: para anidación tipo SASS
 * - postcss-preset-env: para características CSS futuras
 * - cssnano: para minificación adicional en producción
 */
