/**
 * Routes error events from the EventBus to the logger.
 */
export default class ErrorManager {
  constructor(bus, logger) {
    this.bus = bus;
    this.logger = logger;
    this._handler = evt => this._onEvent(evt);
  }

  /** Start listening for error events. */
  boot() {
    this.bus?.subscribe(this._handler);
  }

  /** Stop listening for error events. */
  dispose() {
    this.bus?.unsubscribe(this._handler);
  }

  _onEvent(evt) {
    if (!evt || evt.type !== 'error') return;
    const msg = evt.error?.message || evt.message || String(evt.error || evt);
    this.logger?.error(msg);
  }
}
