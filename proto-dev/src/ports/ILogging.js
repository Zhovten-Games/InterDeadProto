/**
 * Contract for logging adapters responsible for diagnostics.
 */
export default class ILogging {
  /**
   * Subscribe to global error sources.
   */
  boot() {
    throw new Error('Method boot must be implemented by logging adapters.');
  }

  /**
   * Remove subscriptions and listeners.
   */
  dispose() {
    throw new Error('Method dispose must be implemented by logging adapters.');
  }

  /**
   * Emit a debug level message.
   * @param {string} message
   */
  debug(message) {
    throw new Error('Method debug must be implemented by logging adapters.');
  }

  /**
   * Emit an informational message.
   * @param {string} message
   */
  info(message) {
    throw new Error('Method info must be implemented by logging adapters.');
  }

  /**
   * Emit a warning message.
   * @param {string} message
   */
  warn(message) {
    throw new Error('Method warn must be implemented by logging adapters.');
  }

  /**
   * Emit an error message.
   * @param {string} message
   */
  error(message) {
    throw new Error('Method error must be implemented by logging adapters.');
  }
}
