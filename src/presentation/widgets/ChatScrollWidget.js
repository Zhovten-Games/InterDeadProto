import NullEventBus from '../../core/events/NullEventBus.js';
import { CHAT_SCROLL_UP, CHAT_SCROLL_DOWN, CHAT_LOAD_OLDER } from '../../core/events/constants.js';
import config from '../../config/index.js';

/**
 * Handles chat scrolling through EventBus events and mouse wheel
 * interaction. When the top of the container is reached it requests
 * older messages to be loaded.
 */
export default class ChatScrollWidget {
  /**
   * @param {HTMLElement|string} selector Target container or selector.
   * @param {import('../../ports/IEventBus.js').default} bus Event bus instance.
   */
  constructor(selector = '[data-js="dialog-list"]', bus = new NullEventBus()) {
    this.selector = selector;
    this.bus = bus;
    this.step = config.chatScrollStep;
    this._container = null;
    this._handler = evt => this._handle(evt);
    this._screenHandler = evt => {
      if (evt.type !== 'SCREEN_CHANGE') return;
      if (evt.screen === 'messenger') {
        const raf = typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : fn => setTimeout(fn, 0);
        raf(() => this._bind());
      } else {
        this._unbind();
      }
    };
    this._scrollListener = () => {
      if (!this._container) return;
      const { scrollTop } = this._container;
      if (scrollTop <= 0) {
        this.bus.emit({ type: CHAT_LOAD_OLDER });
      }
    };
    this._observer = null;
  }

  /** Resolve the scrolling container. */
  _resolve() {
    if (typeof document === 'undefined') return null;
    return typeof this.selector === 'string'
      ? document.querySelector(this.selector)
      : this.selector;
  }

  /** Attach scroll listener to current container if available. */
  _bind() {
    this._unbind();
    const container = this._resolve();
    if (container) {
      container.addEventListener('scroll', this._scrollListener);
      this._container = container;
    } else {
      this._observer = new MutationObserver(() => {
        const el = this._resolve();
        if (el) {
          this._observer?.disconnect();
          this._observer = null;
          el.addEventListener('scroll', this._scrollListener);
          this._container = el;
        }
      });
      this._observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  /** Remove scroll listener from previous container. */
  _unbind() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    if (this._container) {
      this._container.removeEventListener('scroll', this._scrollListener);
      this._container = null;
    }
  }

  /** Start listening to scroll events. */
  boot() {
    this.bus.subscribe(this._handler);
    this.bus.subscribe(this._screenHandler);
    this._bind();
  }

  /** Stop listening to scroll events. */
  dispose() {
    this.bus.unsubscribe(this._handler);
    this.bus.unsubscribe(this._screenHandler);
    this._unbind();
  }

  _handle(evt) {
    const container = this._container || this._resolve();
    if (!container) return;
    if (evt.type === CHAT_SCROLL_UP) {
      container.scrollBy(0, -this.step);
      if (container.scrollTop <= 0) {
        this.bus.emit({ type: CHAT_LOAD_OLDER });
      }
    } else if (evt.type === CHAT_SCROLL_DOWN) {
      container.scrollBy(0, this.step);
    }
  }
}
