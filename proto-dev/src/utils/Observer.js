import NullLogger from '../core/logging/NullLogger.js';

class Observer {
  constructor(logger = null) {
    this.subscribers = [];
    this.logger = logger ?? new NullLogger();
  }

  /**
   * Subscribe to events.
   * @param {Function} handler - Handler function to invoke on emit.
   */
  subscribe(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    this.subscribers.push(handler);
  }

  /**
   * Unsubscribe a previously registered handler.
   * @param {Function} handler - Previously subscribed handler.
   */
  unsubscribe(handler) {
    const index = this.subscribers.indexOf(handler);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }

  /**
   * Emit an event to all subscribers.
   * @param {*} event - Event payload passed to handlers.
   */
  emit(event) {
    const snapshot = [...this.subscribers];
    for (const handler of snapshot) {
      try {
        handler(event);
      } catch (err) {
        this.logger.error(`Observer handler error: ${err?.message || err}`);
      }
    }
  }
}

export default Observer;
