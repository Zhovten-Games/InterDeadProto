/**
 * Contract for symmetric encryption adapters.
 */
export default class IEncryption {
  /**
   * Encrypt an arbitrary JSON-serialisable object.
   * @param {object} payload Data to encrypt.
   * @param {string} password Secret used to derive the key.
   * @returns {Promise<Uint8Array>} Binary ciphertext.
   */
  async encrypt(payload, password) {
    throw new Error('Method encrypt must be implemented by encryption adapters.');
  }

  /**
   * Decrypt binary payloads produced by {@link encrypt}.
   * @param {Uint8Array} data Encrypted bytes.
   * @param {string} password Password or key used during encryption.
   * @returns {Promise<object>} Decrypted object structure.
   */
  async decrypt(data, password) {
    throw new Error('Method decrypt must be implemented by encryption adapters.');
  }
}
