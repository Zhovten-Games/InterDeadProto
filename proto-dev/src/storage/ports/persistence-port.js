/**
 * Contract for simple key/value persistence stores.
 */
export default class IPersistence {
  /**
   * Retrieve a previously stored value.
   * @param {string} key Identifier used when saving the value.
   * @returns {*}
   */
  load(key) {
    throw new Error('Method load must be implemented by persistence adapters.');
  }

  /**
   * Persist a value under the provided key.
   * @param {string} key Storage key.
   * @param {*} value Serializable value to store.
   */
  save(key, value) {
    throw new Error('Method save must be implemented by persistence adapters.');
  }

  /**
   * Remove the stored value for the given key.
   * @param {string} key Storage key to remove.
   */
  remove(key) {
    throw new Error('Method remove must be implemented by persistence adapters.');
  }

  /**
   * Clear all stored values maintained by the adapter.
   */
  clear() {
    throw new Error('Method clear must be implemented by persistence adapters.');
  }
}
