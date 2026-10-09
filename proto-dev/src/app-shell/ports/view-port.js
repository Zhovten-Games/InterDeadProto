/**
 * Contract for view-layer adapters reacting to event bus changes.
 */
export default class IView {
  /**
   * Start observing state changes and wiring event handlers.
   */
  boot() {
    throw new Error('Method boot must be implemented by view adapters.');
  }

  /**
   * Remove observers and restore initial state.
   */
  dispose() {
    throw new Error('Method dispose must be implemented by view adapters.');
  }
}
