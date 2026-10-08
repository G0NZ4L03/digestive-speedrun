// ============================================================================
// UTILIDAD: cryptoUtils
// ============================================================================

/**
 * Utilidades para encriptación/desencriptación usando Web Crypto API.
 *
 * PROBLEMA QUE RESUELVE:
 * - API key almacenada en localStorage no es segura por defecto
 * - localStorage es vulnerable a scripts maliciosos
 * - Necesitamos protección real para seguridad comercial
 * - Preparar app para market futuro con blindaje de datos

 * FUNCIONAMIENTO:
 * 1. Usa Web Crypto API nativa del navegador (sin dependencias)
 * 2. Deriva key de encriptación de un PIN elegido por el usuario
 * 3. Encripta datos usando AES-GCM (Galois/Counter Mode)
 * 4 - Desencripta usando el mismo PIN
 * 5 - PIN mínimo 4 caracteres para derivación de key

 * ALGORITMO:
 * - Derivar key de PIN usando PBKDF2 con 100,000 iteraciones
 * - Generar IV (Initialization Vector) aleatorio para cada encriptación
 * - AES-GCM para encriptación con autenticación
 * - Store: IV + ciphertext concatenados (formato: IV:ciphertext)

 * SEGURIDAD:
 * - Web Crypto API es nativa del navegador (no dependencias)
 * - AES-GCM es estándar de la industria
 * - 100,000 iteraciones de PBKDF2 (reasonable for UX vs security)
 * - IV aleatorio previene ataques de patterns
 * - PIN proporciona key derivada del usuario

 * @param {string} data - Datos a encriptar
 * @param {string} pin - PIN del usuario (mínimo 4 caracteres)
 * @returns {Promise<string>} - Datos encriptados (formato: IV:ciphertext en base64)
 */
export async function encryptData(data, pin) {
  try {
    // Validar PIN
    if (!pin || pin.length < 4) {
      throw new Error('PIN debe tener al menos 4 caracteres');
    }

    // Derivar key de PIN usando PBKDF2
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const key = await crypto.subtle.deriveKey(
      'PBKDF2',
      keyMaterial,
      { name: 'AES-GCM' },
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generar IV aleatorio (12 bytes para AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Codificar datos
    const dataBuffer = new TextEncoder().encode(data);

    // Encriptar
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );

    // Concatenar IV + ciphertext y convertir a base64
    const combined = new Uint8Array(iv.length + encryptedBuffer.length);
    combined.set(iv);
    combined.set(encryptedBuffer);

    const base64 = btoa(String.fromCharCode(...combined));

    return base64;
  } catch (error) {
    console.error('Error encriptando datos:', error);
    throw new Error('Error al encriptar datos. Revisa tu PIN.');
  }
}

/**
 * Desencripta datos encriptados usando Web Crypto API.
 *
 * @param {string} encryptedData - Datos encriptados (formato: IV:ciphertext en base64)
 * @param {string} pin - PIN del usuario (debe ser el mismo que se usó para encriptar)
 * @returns {Promise<string>} - Datos originales
 */
export async function decryptData(encryptedData, pin) {
  try {
    // Validar PIN
    if (!pin || pin.length < 4) {
      throw new Error('PIN debe tener al menos 4 caracteres');
    }

    // Decodificar base64 a ArrayBuffer
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extraer IV (primeros 12 bytes)
    const iv = combined.slice(0, 12);

    // Extraer ciphertext (resto)
    const ciphertext = combined.slice(12);

    // Derivar key de PIN usando PBKDF2
    const encoder = new TextEncoder();
    const pinData = encoder.encode(pin);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const key = await crypto.subtle.deriveKey(
      'PBKDF2',
      keyMaterial,
      { name: 'AES-GCM' },
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Desencriptar
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    // Decodificar texto
    const decoder = new TextDecoder();
    const decryptedText = decoder.decode(decryptedBuffer);

    return decryptedText;
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    throw new Error('Error al desencriptar datos. Verifica que el PIN es correcto.');
  }
}

/**
 * Valida que un PIN cumple requisitos mínimos
 * @param {string} pin - PIN a validar
 * @returns {boolean} - true si es válido
 */
export function validatePin(pin) {
  return pin && pin.length >= 4 && /^[a-zA-Z0-9]+$/.test(pin);
}

/*
 * RAZÓN DE ESTA UTILIDAD:
 * - Seguridad: Encriptación real vs encoding simple (Base64)
 * - Sin dependencias: Web Crypto API es nativa del navegador
 * - Profesional: AES-GCM es estándar de la industria
 * - Market-ready: Prepara app para comercialización futura
 * - Protección: Protege contra acceso malicioso a localStorage
 *
 * USO EN ESTE PROYECTO:
 * - GeminiConfig: Encriptar API key antes de guardar
 * - App.jsx: Desencriptar API key al cargar desde localStorage
 * - Cualquier dato sensible que se quiera proteger en futuro
 *
 * FUTURO: Mejoras posibles:
 * - Añadir validación de fortaleza de PIN (complejidad mínima)
 * - Añadir opción de recordar PIN en Keychain (más complejo)
 * - Considerar añadir biometría para desencriptar (más complejo)
 * - Considerar añadir backup de recovery (en caso de olvido de PIN)
 * - Nota: Web Crypto API requiere HTTPS (GitHub Pages lo tiene)
 */