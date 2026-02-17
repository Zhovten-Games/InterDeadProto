import NullLogger from '../../core/logging/NullLogger.js';
import effectsConfig from '../../config/effects.config.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import {
  APP_RESET_COMPLETED,
  DUALITY_STARTED,
  DUALITY_STAGE_STARTED,
  EFFECT_DEFAULTS_SAVED,
  EFFECT_STYLE_UPDATED,
  EFFECT_UPDATE_REQUESTED,
  EVENT_STARTED
} from '../../core/events/constants.js';

const PERSISTENCE_KEY = 'effects:overrides';

/**
 * Coordinates visual effects and publishes their runtime configuration.
 * Listens to game progression events and exposes an event-driven API for
 * temporary and persistent updates driven by observers.
 */
export default class EffectsManager {
  constructor(
    eventBus = new NullEventBus(),
    persistence = null,
    ghostService = null,
    dualityManager = null,
    config = effectsConfig,
    logger = null,
    spiritConfigs = {}
  ) {
    this.bus = eventBus;
    this.persistence = persistence;
    this.ghostService = ghostService;
    this.dualityManager = dualityManager;
    this.logger = logger ?? new NullLogger();
    this.baseConfig = config || {};
    this.spiritConfigs = spiritConfigs || {};
    this.overrides = this._loadPersistedOverrides();
    this.runtimeOverrides = {};
    this.activeStage = 0;
    this.activeGhost = this.ghostService?.getCurrentGhost?.().name || null;
    this.current = new Map();
    this._handler = this._onEvent.bind(this);
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this.bus?.subscribe?.(this._handler);
    this._booted = true;
    this._emitForCurrentContext('boot', { includeStage: false });
  }

  dispose() {
    if (!this._booted) return;
    this.bus?.unsubscribe?.(this._handler);
    this._booted = false;
    this.runtimeOverrides = {};
    this.current.clear();
  }

  /**
   * Replace the known spirit configuration map.
   * @param {Record<string, object>} configs
   */
  setSpiritConfigs(configs = {}) {
    this.spiritConfigs = configs;
    this._emitForCurrentContext('config-refresh');
  }

  _onEvent(evt = {}) {
    switch (evt.type) {
      case EFFECT_UPDATE_REQUESTED:
        this._applyUpdate(evt);
        break;
      case DUALITY_STARTED:
        this.activeStage = this.dualityManager?.getCurrentStageIndex?.() ?? 0;
        this.runtimeOverrides = {};
        this._emitForCurrentContext('duality-start');
        break;
      case DUALITY_STAGE_STARTED:
        this.activeStage = typeof evt.index === 'number'
          ? evt.index
          : this.dualityManager?.getCurrentStageIndex?.() ?? 0;
        this.runtimeOverrides = {};
        this._emitForCurrentContext('stage-change');
        break;
      case EVENT_STARTED:
        this._emitForCurrentContext('event-start');
        break;
      case APP_RESET_COMPLETED:
        this.runtimeOverrides = {};
        this.activeStage = 0;
        this.activeGhost = this.ghostService?.getCurrentGhost?.().name || null;
        this._emitForCurrentContext('app-reset');
        break;
      default:
        if (evt.type === 'GHOST_CHANGE') {
          this.activeGhost = evt.payload?.name || this.ghostService?.getCurrentGhost?.().name || null;
          this.runtimeOverrides = {};
          this._emitForCurrentContext('ghost-change');
        }
        break;
    }
  }

  _applyUpdate(evt) {
    const effectName = evt.effect || evt.name;
    if (!effectName) return;
    const values = { ...(evt.values || evt.config || evt.updates || {}) };
    const replace = evt.replace === true;
    const persist = evt.persist === true;
    if (replace) {
      this.runtimeOverrides[effectName] = { ...values };
    } else {
      this.runtimeOverrides[effectName] = {
        ...(this.runtimeOverrides[effectName] || {}),
        ...values
      };
    }
    if (persist) {
      this._persistEffect(effectName, this.runtimeOverrides[effectName]);
    }
    this._emitEffect(effectName, 'manual-update');
  }

  _emitForCurrentContext(reason = '', options = {}) {
    const effectNames = Object.keys(this.baseConfig || {});
    if (!effectNames.length) return;
    effectNames.forEach(name => this._emitEffect(name, reason, options));
  }

  _emitEffect(effectName, reason = '', options = {}) {
    const config = this._buildEffectConfig(effectName, options);
    if (!config) return;
    this.current.set(effectName, config);
    this.bus?.emit?.({
      type: EFFECT_STYLE_UPDATED,
      effect: effectName,
      config,
      reason,
      ghost: this.activeGhost,
      stage: this.activeStage
    });
  }

  _buildEffectConfig(effectName, { includeStage = true } = {}) {
    const base = this._clone(this.baseConfig?.[effectName]?.defaults || {});
    const ghostDefaults = this._clone(this._getGhostDefaults(effectName));
    const persisted = this._clone(this.overrides?.[effectName] || {});
    const stageOverrideRaw = includeStage
      ? this._clone(this._getStageOverrides(effectName) || {})
      : {};
    const { persist, replace, ...stageOverride } = stageOverrideRaw;
    if (persist && Object.keys(stageOverride).length > 0) {
      this._persistEffect(effectName, stageOverride);
    }
    const runtime = this._clone(this.runtimeOverrides?.[effectName] || {});
    let combined = { ...base, ...ghostDefaults, ...persisted };
    if (replace === true) {
      combined = { ...combined, ...stageOverride };
    } else {
      combined = { ...combined, ...stageOverride };
    }
    combined = { ...combined, ...runtime };
    return combined;
  }

  _persistEffect(effectName, values = {}) {
    if (!this.persistence) return;
    if (!values || Object.keys(values).length === 0) return;
    const currentOverrides = this.overrides?.[effectName] || {};
    const nextOverrides = {
      ...currentOverrides,
      ...values
    };
    if (this._isShallowEqual(currentOverrides, nextOverrides)) {
      return;
    }
    this.overrides = {
      ...(this.overrides || {}),
      [effectName]: nextOverrides
    };
    try {
      this.persistence.save?.(PERSISTENCE_KEY, this.overrides);
      this.bus?.emit?.({
        type: EFFECT_DEFAULTS_SAVED,
        effect: effectName,
        overrides: this._clone(this.overrides[effectName])
      });
    } catch (err) {
      this.logger?.warn?.(`Failed to persist effect overrides: ${err?.message || err}`);
    }
  }

  _getGhostDefaults(effectName) {
    if (!this.activeGhost) return {};
    const ghostConfig = this.spiritConfigs?.[this.activeGhost];
    if (!ghostConfig) return {};
    const effects = ghostConfig.effects || {};
    const effectConfig = effects[effectName];
    if (!effectConfig) return {};
    if (effectConfig.defaults && typeof effectConfig.defaults === 'object') {
      return effectConfig.defaults;
    }
    return effectConfig;
  }

  _getStageOverrides(effectName) {
    if (!this.activeGhost) return {};
    const ghostConfig = this.spiritConfigs?.[this.activeGhost];
    if (!ghostConfig?.stages) return {};
    const stage = ghostConfig.stages?.[this.activeStage];
    if (!stage?.effects) return {};
    const override = stage.effects[effectName];
    if (!override || typeof override !== 'object') return {};
    return override;
  }

  _loadPersistedOverrides() {
    if (!this.persistence) return {};
    try {
      const data = this.persistence.load?.(PERSISTENCE_KEY) || {};
      return typeof data === 'object' && data !== null ? data : {};
    } catch (err) {
      this.logger?.warn?.(`Failed to load effect overrides: ${err?.message || err}`);
      return {};
    }
  }

  _clone(value) {
    if (!value || typeof value !== 'object') return value;
    return Array.isArray(value) ? value.slice() : { ...value };
  }

  _isShallowEqual(a = {}, b = {}) {
    const keysA = Object.keys(a || {});
    const keysB = Object.keys(b || {});
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => a[key] === b[key]);
  }
}
