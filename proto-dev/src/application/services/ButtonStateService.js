import {
  BUTTON_STATE_UPDATED,
  DIALOG_AWAITING_INPUT_CHANGED,
} from '../../core/events/constants.js';
import NullLogger from '../../core/logging/NullLogger.js';

export default class ButtonStateService {
  /**
   * @param {object} eventBus - Publishes state change events.
   * @param {object} persistence - Persists button state.
   * @param {object} screenService - Provides active screen via getActive().
   * @param {import('../../ports/ILogging.js').default|null} logger - Centralized logger used instead of direct console calls.
   */
  constructor(eventBus, persistence, screenService, logger = null) {
    this.bus = eventBus;
    this.store = persistence;
    this.screenService = screenService;
    // Logger is injected to centralize warning output and enable test stubs.
    this.logger = logger ?? new NullLogger();
    this.state = {};
    this.ready = false;
    this.awaiting = { awaits: false };
    this._handler = (evt) => {
      if (evt.type === DIALOG_AWAITING_INPUT_CHANGED) {
        this.awaiting = evt;
        this._applyAwaiting();
      }
      if (evt.type === 'SCREEN_CHANGE') {
        // Re-apply initial defaults and stored overrides for the new screen.
        this._emitPolicyDefaultsForScreen(evt.screen);
        this._applyStored(evt.screen);
      }
    };
    this.bus.subscribe(this._handler);
  }

  boot() {
    // Attempt to load persisted button state. Data should be an object; legacy
    // deployments may have stored "[object Object]" strings. In that case try
    // to parse, otherwise reset the state.
    let stored = this.store?.load?.('buttonState');

    if (typeof stored === 'string') {
      try {
        stored = JSON.parse(stored);
      } catch {
        this.logger.warn('Legacy buttonState detected, clearing entry.');
        this.store?.remove?.('buttonState');
        stored = {};
      }
    }

    if (stored && (typeof stored !== 'object' || stored === null)) {
      this.logger.warn('Invalid buttonState data, resetting to empty object.');
      stored = {};
    }

    this.state = stored || {};
    this.ready = true;
    // Apply persisted state for the current screen on boot.
    const current = this.screenService?.getActive?.();
    if (current) {
      this._emitPolicyDefaultsForScreen(current);
      this._applyStored(current);
    }
  }

  // IMPORTANT:
  // This clears runtime overrides only.
  // Initial UI state must be re-emitted via SCREEN_CHANGE → policy defaults.
  // This method does NOT trigger UI updates directly.
  clearRuntimeState({ clearPersisted = false } = {}) {
    this.state = {};
    this.awaiting = { awaits: false };
    if (clearPersisted) {
      this.store?.remove?.('buttonState');
    }
  }

  clearUserRuntimeContext({ clearPersisted = false } = {}) {
    this.clearRuntimeState({ clearPersisted });
  }

  setState(name, active, screen) {
    const key = screen ? `${screen}:${name}` : name;
    this.state[key] = active;
    this.store?.save?.('buttonState', this.state);
    this.bus?.emit({
      type: BUTTON_STATE_UPDATED,
      button: name,
      active,
      screen,
    });
  }

  /**
   * Set state for a specific screen/action combination.
   *
   * @param {string} screen - Screen identifier.
   * @param {string} action - Action name.
   * @param {boolean} active - Whether the action is active.
   */
  setScreenState(screen, action, active) {
    this.setState(action, active, screen);
  }

  /**
   * Retrieve state map for a specific screen.
   *
   * @param {string} screen - Screen identifier.
   * @returns {object} Map of button names to boolean active states.
   */
  getStatesForScreen(screen) {
    const prefix = `${screen}:`;
    const result = {};
    for (const [key, val] of Object.entries(this.state)) {
      if (key.startsWith(prefix)) {
        const name = key.slice(prefix.length);
        result[name] = !!val;
      }
    }
    return result;
  }

  // IMPORTANT:
  // Policy defaults are used for minimal fallback and initial event-based synchronization.
  // They do not replace normal orchestration rules.
  // Do NOT move scenario progression or screen-flow logic into this table.
  // See docs/runtime-reset-boundaries.md
  _getDefaultState(screen, name) {
    const key = screen ? `${screen}:${name}` : name;
    switch (key) {
      case 'messenger:post':
        return true;
      case 'camera:capture-btn':
        return false;
      default:
        return null;
    }
  }

  // IMPORTANT:
  // Emits initial button state when no runtime override exists.
  // Required because UI relies on event-driven initialization,
  // not on lazy isActive() evaluation.
  _emitPolicyDefaultsForScreen(screen) {
    const candidates = [
      ['messenger', 'post'],
      ['camera', 'capture-btn'],
    ];

    candidates.forEach(([scr, name]) => {
      if (scr !== screen) return;

      const key = `${scr}:${name}`;
      if (key in this.state) return;

      const value = this._getDefaultState(scr, name);
      if (typeof value !== 'boolean') return;

      this.bus?.emit({
        type: BUTTON_STATE_UPDATED,
        button: name,
        active: value,
        screen: scr,
      });
    });
  }

  isActive(name, screen) {
    // Guard against corrupted state shapes; treat all buttons as active if
    // state is not an object.
    if (typeof this.state !== 'object' || this.state === null) {
      this.logger.warn('Button state is corrupted, assuming active.');
      return true;
    }
    const key = screen ? `${screen}:${name}` : name;
    if (key in this.state) return !!this.state[key];
    if (name in this.state) return !!this.state[name];
    const policyDefault = this._getDefaultState(screen, name);
    if (typeof policyDefault === 'boolean') return policyDefault;
    return true;
  }

  isReady() {
    return this.ready;
  }

  _applyAwaiting() {
    const current = this.screenService?.getActive?.();
    const { awaits, kind, targetScreen } = this.awaiting;
    const postActive = awaits && kind === 'user_text' && targetScreen === current;
    // Capture button is toggled by camera events after a successful detection.
    // When camera input is not awaited, ensure the button is disabled.
    if (!awaits || kind !== 'camera_capture' || targetScreen !== current) {
      this.setScreenState('camera', 'capture-btn', false);
    }
    this.setScreenState('messenger', 'post', !!postActive);
  }

  _applyStored(screen) {
    const states = this.getStatesForScreen(screen);
    for (const [name, active] of Object.entries(states)) {
      this.bus?.emit({
        type: BUTTON_STATE_UPDATED,
        button: name,
        active,
        screen,
      });
    }
  }
}
