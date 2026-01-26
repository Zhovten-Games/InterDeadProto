import NullEventBus from '../../core/events/NullEventBus.js';
import CameraWidget from './CameraWidget.js';
import {
  BUTTON_STATE_UPDATED,
  DETECTION_DONE_EVENT,
  DETECTION_SEARCH,
  DETECTION_STOPPED
} from '../../core/events/constants.js';

/**
 * Extends CameraWidget with reactive UI updates based on EventBus events.
 * The widget stays mounted after a detection so the frozen frame and
 * retry control remain available to the user.
 */
export default class CameraStatusWidget extends CameraWidget {
  /**
   * @param {HTMLElement} container Root element for the widget.
   * @param {*} languageService Service for translations and i18n.
   * @param {*} bus Application-wide event bus.
   */
  constructor(container, languageService, bus = new NullEventBus()) {
    super(container);
    this.language = languageService;
    this.bus = bus;
    this._handler = async evt => {
      if (evt.type === DETECTION_SEARCH) {
        this._handleStatus('searching');
      }
      if (evt.type === 'CAMERA_STATUS') {
        this._handleStatus(evt.status);
        if (evt.status === 'paused') {
          this.bus.emit({ type: BUTTON_STATE_UPDATED, screen: 'camera' });
        }
      }
      if (evt.type === DETECTION_DONE_EVENT) {
        // Detection succeeded: keep widget visible with a frozen frame and
        // expose retry control so detection can be restarted.
        await this._onDetected(evt.target);
        this._handleStatus('paused');
        this.bus.emit({ type: BUTTON_STATE_UPDATED, screen: 'camera' });
      }
      if (evt.type === DETECTION_STOPPED) {
        this._handleStatus('hidden');
      }
    };
  }

  /** Subscribe to bus events and attach listeners. */
  boot() {
    this.bus.subscribe(this._handler);
    this._attachRetryHandler();
  }

  /** Unsubscribe from bus events and detach listeners. */
  dispose() {
    this.bus.unsubscribe(this._handler);
    this._detachRetryHandler();
  }

  _query(sel) {
    return this.container?.querySelector(sel);
  }

  _handleStatus(key) {
    const statusEl = this._query('[data-js="detection-status"]');
    if (!statusEl) return;
    if (key === 'hidden') {
      statusEl.classList.add('is-hidden');
      return;
    }
    if (key === 'checking' || key === 'searching' || key === 'not_found') {
      const map = {
        checking: 'checking',
        searching: 'searching',
        not_found: 'object_not_found'
      };
      statusEl.setAttribute('data-i18n', map[key] || key);
      this.language?.applyLanguage(statusEl);
      statusEl.classList.remove('is-hidden');
    }
    const retry = this._query('[data-js="retry-detection"]');
    if (key === 'searching' && retry) {
      // Hide play control while detection is active
      retry.classList.add('retry-detection--hidden');
    }
    if (key === 'paused' && retry) {
      // Stream is paused but video element remains, so offer restart control
      // while keeping the frozen frame visible.
      retry.classList.remove('retry-detection--hidden');
    }
  }

  async _onDetected(target) {
    const canvas = this.container?.querySelector('canvas') || document.querySelector('canvas');
    if (canvas) {
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = thumbCanvas.height = 100;
      thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, 100, 100);
      const thumb = this._query('[data-js="selfie-thumbnail"]');
      if (thumb) {
        thumb.src = thumbCanvas.toDataURL('image/jpeg');
        thumb.classList.add('selfie-thumbnail--visible');
      }
    }
    const status = this._query('[data-js="detection-status"]');
    if (status) {
      const msg = await this.language?.translate?.(`${target}_detected`);
      status.textContent = msg;
      status.classList.remove('is-hidden');
    }
  }

  _attachRetryHandler() {
    const retry = this._query('[data-js="retry-detection"]');
    if (retry) {
      this._retryListener = () => {
        retry.classList.add('retry-detection--hidden');
        this.bus.emit({ type: 'RETRY_DETECTION' });
      };
      retry.addEventListener('click', this._retryListener);
    }
  }

  _detachRetryHandler() {
    const retry = this._query('[data-js="retry-detection"]');
    if (retry && this._retryListener) {
      retry.removeEventListener('click', this._retryListener);
    }
  }
}
