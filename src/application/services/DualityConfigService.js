/**
 * Loads duality configuration files for spirits.
 */
export default class DualityConfigService {
  /**
   * @param {import('../../ports/IConfigLoader.js').default} configLoader
   * @param {string} [basePath]
   */
  constructor(configLoader, basePath = 'src/config/spirits') {
    if (!configLoader || typeof configLoader.load !== 'function') {
      throw new TypeError('DualityConfigService requires a config loader implementing IConfigLoader.');
    }
    this.configLoader = configLoader;
    this.basePath = basePath;
  }

  /**
   * Load configuration for a given spirit.
   * @param {string} name - spirit identifier
   * @returns {Promise<object>} parsed configuration
   */
  async load(name) {
    const json = await this.configLoader.load(`${this.basePath}/${name}.json`);
    if (!Array.isArray(json.stages)) {
      throw new Error('Stages array is required');
    }
    return json;
  }
}
