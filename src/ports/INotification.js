/**
 * Contract for notification surfaces used by the UI.
 */
export default class INotification {
  /**
   * Display a status update to the player.
   * @param {string} message
   * @param {object} [options]
   */
  showNotification(message, options) {
    throw new Error('Method showNotification must be implemented by notification adapters.');
  }
}
