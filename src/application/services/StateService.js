import defaultConfig from '../../config/button-state.config.js';
import deepMerge from '../../utils/deepMerge.js';

export default class StateService {
  constructor(profile, geo, ghostService, eventBus, logger) {
    this.profile = profile;
    this.geo = geo;
    this.ghostService = ghostService;
    this.eventBus = eventBus;
    this.logger = logger;
    this.config = null;
    this.currentScreen = null;
    this.presence = {};
    this.captured = false;
    this._handler = null;
  }

  async boot() {
    this.config = { ...defaultConfig };
    const ghost = this.ghostService.getCurrentGhost();
    await this._loadGhostConfig(ghost.name);
    this._handler = async evt => {
      if (evt.type === 'GHOST_CHANGE') {
        this.config = { ...defaultConfig };
        await this._loadGhostConfig(evt.payload.name);
        this.eventBus.emit({
          type: 'BUTTON_STATE_UPDATED',
          screen: this.currentScreen
        });
      }
    };
    this.eventBus.subscribe(this._handler);
  }

  async _loadGhostConfig(name) {
    try {
      const mod = await import(
        new URL(`../../config/spirits/${name}.js`, import.meta.url)
      );
      this.config = deepMerge(this.config, mod.default);
    } catch (err) {
      this.logger?.warn?.(`No override for ghost: ${name}`);
    }
  }

  isButtonEnabled(screen, action) {
    this.currentScreen = screen;
    const rules = this.config[screen]?.[action];
    if (!Array.isArray(rules) || rules.length === 0) {
      return false;
    }
    return rules.every(rule => this._evaluate(rule));
  }

  setPresence(type, value) {
    this.presence[type] = value;
  }

  markCaptured() {
    this.captured = true;
  }

  resetCaptured() {
    this.captured = false;
  }

  resetPresence() {
    this.presence = {};
  }

  dispose() {
    if (this._handler) {
      this.eventBus.unsubscribe(this._handler);
      this._handler = null;
    }
  }

  _evaluate(rule) {
    switch (rule.type) {
      case 'always':
        return true;
      case 'profileReady':
        return this.profile.canProceed();
      case 'afterCapture':
        return this.captured === true;
      case 'presence':
        return this.presence[rule.object];
      default:
        return false;
    }
  }
}
