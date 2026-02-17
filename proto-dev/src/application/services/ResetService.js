import NullEventBus from '../../core/events/NullEventBus.js';
import { APP_RESET_REQUESTED, APP_RESET_COMPLETED } from '../../core/events/constants.js';

export default class ResetService {
  constructor(config, database, persistence, bus = new NullEventBus(), logger = console) {
    this.config = config || {};
    this.database = database;
    this.persistence = persistence;
    this.bus = bus;
    this.logger = logger;
    this._handler = this._handleEvent.bind(this);
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  async _handleEvent(evt) {
    if (evt?.type !== APP_RESET_REQUESTED) return;
    await this._performReset(evt.payload || {});
  }

  async _performReset(payload) {
    const defaults = this.config.reset || {};
    const options = { ...defaults, ...(payload.options || {}) };

    try {
      if (options.clearDatabase !== false) {
        await this.database?.clearAll?.();
      }
      if (options.clearStorage !== false) {
        this.persistence?.clear?.();
      }
      this.bus.emit({ type: APP_RESET_COMPLETED, payload: { options } });
      const nextScreen = options.initialScreen || 'welcome';
      if (nextScreen) {
        this.bus.emit({ type: 'SCREEN_CHANGE', screen: nextScreen, options: { force: true } });
      }
    } catch (err) {
      this.logger?.error?.(`ResetService: reset failed - ${err?.message || err}`);
    }
  }
}

