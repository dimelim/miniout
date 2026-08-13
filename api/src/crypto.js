import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { config } from './config.js';

const PREFIJO = 'v1';
const ALGORITMO = 'aes-256-gcm';
const IV_BYTES = 12;

export function encrypt(plain) {
  if (plain === null || plain === undefined) return plain;

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITMO, config.dataKey, iv);
  const cifrado = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);

  return [
    PREFIJO,
    iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    cifrado.toString('base64'),
  ].join('.');
}

export function decrypt(value) {
  if (value === null || value === undefined) return value;

  const texto = String(value);
  const partes = texto.split('.');

  if (partes[0] !== PREFIJO || partes.length !== 4) {
    return texto;
  }

  try {
    const decipher = createDecipheriv(ALGORITMO, config.dataKey, Buffer.from(partes[1], 'base64'));
    decipher.setAuthTag(Buffer.from(partes[2], 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(partes[3], 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return texto;
  }
}

export function encryptBuffer(buffer) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITMO, config.dataKey, iv);
  const cifrado = Buffer.concat([cipher.update(buffer), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), cifrado]);
}

export function decryptBuffer(buffer) {
  const iv = buffer.subarray(0, IV_BYTES);
  const tag = buffer.subarray(IV_BYTES, IV_BYTES + 16);
  const decipher = createDecipheriv(ALGORITMO, config.dataKey, iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(buffer.subarray(IV_BYTES + 16)), decipher.final()]);
}

export function encryptJson(value) {
  return encrypt(JSON.stringify(value ?? []));
}

export function decryptJson(value) {
  if (value === null || value === undefined) return [];

  const texto = decrypt(typeof value === 'string' ? value : JSON.stringify(value));

  try {
    const parsed = JSON.parse(texto);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
