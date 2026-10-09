/**
 * Contract for loading configuration resources.
 * Implementations are responsible for retrieving JSON payloads
 * from a backing store (network, filesystem, etc.).
 */
export default class IConfigLoader {
  /**
   * Load configuration content from the provided location.
   * @param {string} path Resource identifier or URL.
   * @returns {Promise<object>} Parsed configuration object.
   */
  async load(path) {
    throw new Error('Method load must be implemented by config loader adapters.');
  }
}
