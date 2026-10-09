/**
 * Abstract observer for quest lifecycle events.
 * Subclasses must implement the hooks.
 */
export default class QuestObserver {
  /**
   * Invoked when a quest starts.
   * @param {object} quest - Quest metadata.
   * @throws {Error} when not implemented.
   */
  onStart(quest) {
    throw new Error('onStart(quest) must be implemented');
  }

  /**
   * Invoked when a quest completes.
   * @param {object} quest - Quest metadata.
   * @throws {Error} when not implemented.
   */
  onComplete(quest) {
    throw new Error('onComplete(quest) must be implemented');
  }
}
