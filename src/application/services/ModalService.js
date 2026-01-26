import NullEventBus from '../../core/events/NullEventBus.js';
import { MODAL_SHOW, MODAL_HIDE, OVERLAY_SHOW } from '../../core/events/constants.js';

/**
 * Global modal service emitting events to render and hide modal overlays.
 * Listens for OVERLAY_SHOW requests to display canvases or images.
 */
export default class ModalService {
  constructor(bus = new NullEventBus()) {
    this.bus = bus;
    this._handler = evt => {
      if (evt.type === OVERLAY_SHOW) {
        if (evt.node) {
          this.show(evt.node);
        } else if (evt.src) {
          this.showFromDataURL(evt.src, evt.revoke);
        }
      }
    };
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  /**
   * Emit event to show provided node in modal.
   * @param {HTMLElement} node
   */
  show(node) {
    this.bus.emit({ type: MODAL_SHOW, node });
  }

  /**
   * Recreate an image from data URL and show it in modal.
   * Adds a messenger CTA so players can jump back into chat
   * after reviewing the generated overlay.
   * @param {string} src data URL
   * @param {Function} [revoke] optional callback to release object URLs once loaded
   */
  showFromDataURL(src, revoke = null) {
    const img = new Image();
    img.className = 'modal__image';
    if (typeof revoke === 'function') {
      const cleanup = () => revoke();
      img.addEventListener('load', cleanup, { once: true });
      img.addEventListener('error', cleanup, { once: true });
    }
    img.onload = () => this.show(this._wrapWithActions(img));
    img.src = src;
  }

  /**
   * Emit event to hide modal.
   */
  hide() {
    this.bus.emit({ type: MODAL_HIDE });
  }

  _wrapWithActions(node) {
    const body = document.createElement('div');
    body.className = 'modal__viewer';

    const media = document.createElement('div');
    media.className = 'modal__media';
    if (node) media.appendChild(node);

    const actions = document.createElement('div');
    actions.className = 'modal__actions';

    const messengerButton = document.createElement('button');
    messengerButton.type = 'button';
    messengerButton.className = 'modal__button modal__button--primary';
    messengerButton.setAttribute('data-i18n', 'open_messenger');
    messengerButton.addEventListener('click', () => {
      this.hide();
      this.bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    });

    actions.appendChild(messengerButton);
    body.appendChild(media);
    body.appendChild(actions);
    return body;
  }
}
