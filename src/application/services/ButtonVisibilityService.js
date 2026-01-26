import { BUTTON_VISIBILITY_UPDATED } from '../../core/events/constants.js';
import NullLogger from '../../core/logging/NullLogger.js';

export default class ButtonVisibilityService {
  /**
   * @param {object} eventBus - Publishes visibility change events.
   * @param {object} persistence - Persists visibility flags.
   * @param {import('../../ports/ILogging.js').default|null} logger - Centralized logger used instead of direct console calls.
   */
  constructor(eventBus, persistence, logger = null) {
    this.bus = eventBus;
    this.store = persistence;
    this.logger = logger ?? new NullLogger();
    this.visibility = {};
    this.ready = false;
  }

  boot() {
    let stored = this.store?.load?.('buttonVisibility');
    if (typeof stored === 'string') {
      try {
        stored = JSON.parse(stored);
      } catch {
        this.logger.warn('Legacy buttonVisibility detected, clearing entry.');
        this.store?.remove?.('buttonVisibility');
        stored = {};
      }
    }
    if (stored && (typeof stored !== 'object' || stored === null)) {
      this.logger.warn('Invalid buttonVisibility data, resetting to empty object.');
      stored = {};
    }
    this.visibility = stored || {};
    // Default visibility for messenger and camera screens
    if (!('messenger:toggle-camera' in this.visibility)) this.visibility['messenger:toggle-camera'] = true;
    if (!('camera:toggle-messenger' in this.visibility)) this.visibility['camera:toggle-messenger'] = false;
    if (!('messenger:post' in this.visibility)) this.visibility['messenger:post'] = true;
    if (!('camera:capture-btn' in this.visibility)) this.visibility['camera:capture-btn'] = false;
    this.ready = true;
  }

  setVisibility(name, visible, screen) {
    const key = screen ? `${screen}:${name}` : name;
    if (this.visibility[key] === visible) return;
    this.visibility[key] = visible;
    this.store?.save?.('buttonVisibility', this.visibility);
    this.bus?.emit({
      type: BUTTON_VISIBILITY_UPDATED,
      button: name,
      visible,
      screen
    });
  }

  setScreenVisibility(screen, button, visible) {
    this.setVisibility(button, visible, screen);
  }

  getVisibilityForScreen(screen) {
    const prefix = `${screen}:`;
    const result = {};
    for (const [key, val] of Object.entries(this.visibility)) {
      if (key.startsWith(prefix)) {
        const name = key.slice(prefix.length);
        result[name] = !!val;
      }
    }
    return result;
  }

  isVisible(name, screen) {
    if (typeof this.visibility !== 'object' || this.visibility === null) {
      this.logger.warn('Button visibility is corrupted, assuming visible.');
      return true;
    }
    const key = screen ? `${screen}:${name}` : name;
    if (key in this.visibility) return !!this.visibility[key];
    return name in this.visibility ? !!this.visibility[name] : true;
  }

  isReady() {
    return this.ready;
  }
}
