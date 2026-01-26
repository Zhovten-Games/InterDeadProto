import NullEventBus from '../../core/events/NullEventBus.js';
import { STATUS_SHOW } from '../../core/events/constants.js';

/**
 * Displays status messages inside the application UI.
 */
export default class StatusWidget {
  /**
   * @param {HTMLElement|string|null} selector Optional container or selector.
   * @param {import('../../ports/IEventBus.js').default} bus Event bus instance.
   */
  constructor(selector = null, bus = new NullEventBus()) {
    this.selector = selector;
    this.bus = bus;
    this.container = null;
    this._handler = evt => this._handle(evt);
  }

  /** Subscribe to the event bus. */
  boot() {
    this.container = this._ensureContainer();
    this.bus.subscribe(this._handler);
  }

  /** Unsubscribe from the event bus. */
  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  _ensureContainer() {
    if (this.selector) {
      const el = typeof this.selector === 'string' ? document.querySelector(this.selector) : this.selector;
      if (el) return el;
    }
    let el = document.querySelector('[data-js="status-display"]');
    if (!el) {
      el = document.createElement('div');
      el.setAttribute('data-js', 'status-display');
      const host = document.querySelector('[data-js="global-content"]') || document.body;
      host.appendChild(el);
    }
    return el;
  }

  _handle(evt) {
    if (!evt || evt.type !== STATUS_SHOW) return;
    this.container = this.container || this._ensureContainer();
    this.container.textContent = evt.message || '';
    this.bus.emit({
      type: 'log',
      level: 'info',
      message: `StatusWidget: rendering message ${evt.message || ''}`
    });
  }
}
