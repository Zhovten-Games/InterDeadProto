/**
 * Contract for the application event bus.
 * Implementations must provide pub/sub mechanics without exposing concrete adapters.
 */
export default class IEventBus {
  /**
   * Register a handler for future events.
   * @param {Function} handler Callback executed for every emitted event.
   */
  subscribe(handler) {
    throw new Error('Method subscribe must be implemented by event bus adapters.');
  }

  /**
   * Remove a previously registered handler.
   * @param {Function} handler Reference passed to {@link subscribe}.
   */
  unsubscribe(handler) {
    throw new Error('Method unsubscribe must be implemented by event bus adapters.');
  }

  /**
   * Emit an event to all subscribers.
   * @param {object} event Event payload dispatched to handlers.
   */
  emit(event) {
    throw new Error('Method emit must be implemented by event bus adapters.');
  }
}
