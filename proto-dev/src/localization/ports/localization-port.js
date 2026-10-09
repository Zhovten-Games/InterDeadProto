/**
 * Contract for low-level localisation loaders.
 */
export default class ILocalization {
  /**
   * Set current language code.
   * @param {string} language
   */
  setLanguage(language) {
    throw new Error('Method setLanguage must be implemented by localisation adapters.');
  }

  /**
   * Translate a key for the active language.
   * @param {string} key
   * @param {string} [domain]
   * @returns {Promise<string>}
   */
  async translate(key, domain) {
    throw new Error('Method translate must be implemented by localisation adapters.');
  }
}
