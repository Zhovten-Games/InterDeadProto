const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function deriveKey(password, salt, usages) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  );
}

export async function encrypt(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data),
  );
  const result = new Uint8Array(salt.length + iv.length + ciphertext.length);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(ciphertext, salt.length + iv.length);
  return result;
}

export async function decrypt(encryptedData, password) {
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const data = encryptedData.slice(28);
  const key = await deriveKey(password, salt, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new Uint8Array(plain);
}

import IEncryption from '../../ports/IEncryption.js';

export default class BrowserCryptoAdapter extends IEncryption {
  constructor(logger) {
    super();
    this.logger = logger;
  }

  async encrypt(obj, password) {
    try {
      const data = textEncoder.encode(JSON.stringify(obj));
      return await encrypt(data, password);
    } catch (err) {
      this.logger?.error(`Encryption failed: ${err.message}`);
      throw err;
    }
  }

  async decrypt(bytes, password) {
    try {
      const decoded = await decrypt(bytes, password);
      return JSON.parse(textDecoder.decode(decoded));
    } catch (err) {
      this.logger?.error(`Decryption failed: ${err.message}`);
      throw err;
    }
  }
}
