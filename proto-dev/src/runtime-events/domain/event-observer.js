/**
 * Abstract observer for game events.
 * Concrete subclasses should override lifecycle hooks.
 */
export default class EventObserver {
  /**
   * Called when an event starts.
   * @param {object} event - Event metadata.
   * @throws {Error} when not implemented.
   */
  onStart(event) {
    throw new Error('onStart(event) must be implemented');
  }

  /**
   * Called when an event completes.
   * @param {object} event - Event metadata.
   * @throws {Error} when not implemented.
   */
  onComplete(event) {
    throw new Error('onComplete(event) must be implemented');
  }
}
