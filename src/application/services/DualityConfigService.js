/**
 * Loads duality configuration files for spirits.
 */
import { AssetUrlMapper } from '../../config/assetsBaseUrl.js';

export default class DualityConfigService {
  /**
   * @param {import('../../ports/IConfigLoader.js').default} configLoader
   * @param {string} [basePath]
   * @param {AssetUrlMapper} [assetUrlMapper]
   */
  constructor(configLoader, basePath = 'src/config/spirits', assetUrlMapper = new AssetUrlMapper()) {
    if (!configLoader || typeof configLoader.load !== 'function') {
      throw new TypeError('DualityConfigService requires a config loader implementing IConfigLoader.');
    }
    this.configLoader = configLoader;
    this.basePath = basePath;
    this.assetUrlMapper = assetUrlMapper;
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
    return this.assetUrlMapper.mapConfig(json);
  }
}
