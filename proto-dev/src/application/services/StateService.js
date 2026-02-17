import defaultConfig from '../../config/button-state.config.js';
import deepMerge from '../../utils/deepMerge.js';
import {
  AI_STATE_CHANGED,
  APP_RESET_COMPLETED,
  USER_PROFILE_SAVED
} from '../../core/events/constants.js';

export default class StateService {
  constructor(profile, geo, ghostService, eventBus, logger, screenService = null) {
    this.profile = profile;
    this.geo = geo;
    this.ghostService = ghostService;
    this.eventBus = eventBus;
    this.logger = logger;
    this.screenService = screenService;
    this.config = null;
    this.currentScreen = null;
    this.presence = {};
    this.captured = false;
    this.localAuthReady = false;
    this.aiState = 'IDLE';
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
      if (evt.type === AI_STATE_CHANGED) {
        if (evt.state) {
          this.setAiState(evt.state);
          this._emitButtonRefresh();
        }
      }
      if (evt.type === USER_PROFILE_SAVED) {
        this.setLocalAuthReady(true);
        this._emitButtonRefresh();
      }
      if (evt.type === APP_RESET_COMPLETED) {
        this.setLocalAuthReady(false);
        this.setAiState('IDLE');
        this.resetPresence();
        this.resetCaptured();
        this._emitButtonRefresh();
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

  setLocalAuthReady(value) {
    this.localAuthReady = Boolean(value);
  }

  isLocalAuthReady() {
    return this.localAuthReady === true;
  }

  setAiState(state) {
    this.aiState = state;
  }

  getAiState() {
    return this.aiState;
  }

  isAiReady() {
    return this.aiState === 'READY';
  }

  isAiLoading() {
    return this.aiState !== 'READY' && this.aiState !== 'FAILED';
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
      case 'localAuthReady':
        return this.localAuthReady === true;
      case 'aiReady':
        return this.aiState === 'READY';
      default:
        return false;
    }
  }

  _emitButtonRefresh() {
    const screen = this.screenService?.getActive?.() || this.currentScreen;
    if (!screen) return;
    this.eventBus.emit({
      type: 'BUTTON_STATE_UPDATED',
      screen
    });
  }
}
