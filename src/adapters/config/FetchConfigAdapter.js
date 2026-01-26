import IConfigLoader from '../../ports/IConfigLoader.js';

/**
 * Adapter responsible for retrieving configuration data using fetch.
 */
export default class FetchConfigAdapter extends IConfigLoader {
  /**
   * @param {import('../logging/LoggingAdapter.js').default|null} logger Optional logger.
   * @param {Function} fetchFn Fetch implementation (default: global fetch).
   */
  constructor(logger = null, fetchFn = globalThis.fetch) {
    super();
    this.logger = logger;
    this.fetch = fetchFn;
  }

  /**
   * Load JSON configuration from a given URL.
   * @param {string} url - Resource location.
   * @returns {Promise<object>} Parsed JSON content.
   */
  async load(url) {
    try {
      const response = await this.fetch(url);
      if (!response.ok) {
        const err = new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        this.logger?.error(err.message);
        throw err;
      }
      return response.json();
    } catch (err) {
      this.logger?.error(err?.message || String(err));
      throw err;
    }
  }
}
