import NullEventBus from '../../../core/events/NullEventBus.js';
import { MODAL_SHOW, MODAL_HIDE } from '../../../core/events/constants.js';

/**
 * Presentation widget rendering global modal overlays.
 */
export default class ModalWidget {
  constructor(container = document.body, bus = new NullEventBus(), languageService = null) {
    this.root = typeof container === 'string' ? document.querySelector(container) : container;
    this.bus = bus;
    this.language = languageService;
    this.modal = null;
    this._handler = evt => {
      if (evt.type === MODAL_SHOW) {
        this.render(evt.node);
      }
      if (evt.type === MODAL_HIDE) {
        this.hide();
      }
    };
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this.hide();
  }

  render(node) {
    this.hide();
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    const content = document.createElement('div');
    content.className = 'modal__content';
    if (node) content.appendChild(node);
    this.modal.appendChild(content);
    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) {
        this.bus.emit({ type: MODAL_HIDE });
      }
    });
    this.root.appendChild(this.modal);
    this.language?.applyLanguage(this.modal);
  }

  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}
