import NullLogger from '../../runtime-diagnostics/null-logger.js';

class Observer {
  constructor(logger = null) {
    this.subscribers = [];
    this.pending = new Set();
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
        const result = handler(event);
        if (result?.then) {
          const task = Promise.resolve(result).catch((err) =>
            this.logger.error(`Observer handler error: ${err?.message || err}`),
          );
          this.pending.add(task);
          task.finally(() => this.pending.delete(task));
        }
      } catch (err) {
        this.logger.error(`Observer handler error: ${err?.message || err}`);
      }
    }
  }
  async settled() {
    while (this.pending.size) await Promise.all([...this.pending]);
  }
}

export default Observer;
