import { BUTTON_VISIBILITY_UPDATED } from '../../core/events/constants.js';
import NullLogger from '../../core/logging/NullLogger.js';

export default class ButtonVisibilityService {
  /**
   * @param {object} eventBus - Publishes visibility change events.
   * @param {object} persistence - Persists visibility flags.
   * @param {import('../../ports/ILogging.js').default|null} logger - Centralized logger used instead of direct console calls.
   */
  constructor(eventBus, persistence, logger = null, screenService = null) {
    this.bus = eventBus;
    this.store = persistence;
    this.logger = logger ?? new NullLogger();
    this.screenService = screenService;
    this.visibility = {};
    this.ready = false;
    this._handler = (evt) => {
      if (evt.type === 'SCREEN_CHANGE') {
        this._emitPolicyDefaultsForScreen(evt.screen);
        this._applyStored(evt.screen);
      }
    };
    this.bus?.subscribe?.(this._handler);
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
    this.ready = true;
    const current = this.screenService?.getActive?.();
    if (current) {
      this._emitPolicyDefaultsForScreen(current);
      this._applyStored(current);
    }
  }

  // IMPORTANT:
  // Clears runtime visibility overrides only.
  // UI must be re-synced via SCREEN_CHANGE after reset.
  clearRuntimeVisibility({ clearPersisted = false } = {}) {
    this.visibility = {};
    if (clearPersisted) {
      this.store?.remove?.('buttonVisibility');
    }
  }

  // Backward-compatibility wrapper for the unified reset contract.
  // Keep legacy direct-call API until an explicit deprecation policy is introduced.
  clearUserRuntimeContext({ clearPersisted = false } = {}) {
    this.clearRuntimeVisibility({ clearPersisted });
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
      screen,
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

  // IMPORTANT:
  // Policy defaults are allowed only for minimal non-scenario visibility fallback
  // and initial event-based synchronization.
  // Do NOT move panel composition or scenario flow logic into this table.
  // See docs/runtime-reset-boundaries.md
  _getDefaultVisibility(screen, name) {
    const key = screen ? `${screen}:${name}` : name;
    switch (key) {
      case 'messenger:toggle-camera':
      case 'messenger:post':
        return true;
      case 'camera:toggle-messenger':
      case 'camera:capture-btn':
        return false;
      default:
        return null;
    }
  }

  _emitPolicyDefaultsForScreen(screen) {
    const candidates = [
      ['messenger', 'toggle-camera'],
      ['messenger', 'post'],
      ['camera', 'toggle-messenger'],
      ['camera', 'capture-btn'],
    ];

    candidates.forEach(([scr, name]) => {
      if (scr !== screen) return;

      const key = `${scr}:${name}`;
      if (key in this.visibility) return;

      const value = this._getDefaultVisibility(scr, name);
      if (typeof value !== 'boolean') return;

      this.bus?.emit({
        type: BUTTON_VISIBILITY_UPDATED,
        button: name,
        visible: value,
        screen: scr,
      });
    });
  }

  _applyStored(screen) {
    const states = this.getVisibilityForScreen(screen);
    for (const [name, visible] of Object.entries(states)) {
      this.bus?.emit({
        type: BUTTON_VISIBILITY_UPDATED,
        button: name,
        visible,
        screen,
      });
    }
  }

  isVisible(name, screen) {
    if (typeof this.visibility !== 'object' || this.visibility === null) {
      this.logger.warn('Button visibility is corrupted, assuming visible.');
      return true;
    }
    const key = screen ? `${screen}:${name}` : name;
    if (key in this.visibility) return !!this.visibility[key];
    if (name in this.visibility) return !!this.visibility[name];
    const policyDefault = this._getDefaultVisibility(screen, name);
    if (typeof policyDefault === 'boolean') return policyDefault;
    return true;
  }

  isReady() {
    return this.ready;
  }
}
