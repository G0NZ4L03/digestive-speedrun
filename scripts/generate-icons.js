import sharp from 'sharp';
import fs from 'fs';

// ============================================================================
// SCRIPT: Generate PWA Icons
// ============================================================================

/**
 * Este script genera iconos PNG para PWA desde el SVG.
 * Crea iconos de 192x192 y 512x512 píxeles.
 */

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync('./public/icon.svg');

    // Generar icono 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('./public/icon-192.png');
    console.log('✅ Icono 192x192 generado');

    // Generar icono 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('./public/icon-512.png');
    console.log('✅ Icono 512x512 generado');

    console.log('🎉 Todos los iconos PWA generados exitosamente');
  } catch (error) {
    console.error('❌ Error generando iconos:', error);
    process.exit(1);
  }
}

generateIcons();
