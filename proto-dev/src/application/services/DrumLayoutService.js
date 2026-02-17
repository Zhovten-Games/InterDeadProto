import NullEventBus from '../../core/events/NullEventBus.js';
import drumConfig, { DEFAULT_DRUM_LAYOUT } from '../../config/drum.config.js';
import { DRUM_LAYOUT_UPDATED } from '../../core/events/constants.js';

/**
 * Provides emoji drum layouts and notifies listeners about updates.
 */
export default class DrumLayoutService {
  constructor(persistence = null, bus = new NullEventBus(), config = drumConfig) {
    this.persistence = persistence;
    this.bus = bus;
    this.config = config;
    this.overrideLayout = this._normalizeLayout(config?.overrides?.layout);
    this.booted = false;
  }

  boot() {
    if (this.booted) return;
    this.booted = true;
    const stored = this.persistence?.load?.('drumOverrides');
    if (Array.isArray(stored?.layout)) {
      this.overrideLayout = this._normalizeLayout(stored.layout);
    } else if (Array.isArray(stored)) {
      // Backward compatibility with per-ghost persistence format.
      this.overrideLayout = this._normalizeLayout(stored.default || stored.guide || stored);
    } else if (stored && typeof stored === 'object') {
      const globalOverride = Object.values(stored)[0];
      this.overrideLayout = this._normalizeLayout(globalOverride);
    }
  }

  dispose() {}

  /**
   * Retrieve the current drum layout, merging overrides with defaults.
   * @returns {string[]}
   */
  getLayout() {
    const base = this._getBaseLayout();
    if (!this.overrideLayout?.length) {
      return base;
    }
    return base.map((emoji, index) => this.overrideLayout[index] || emoji);
  }

  /**
   * Retrieve layout for a ghost id. Maintained for compatibility with
   * existing callers; the returned layout is global for all spirits.
   * @returns {string[]}
   */
  getLayoutForGhost() {
    return this.getLayout();
  }

  /**
   * Persist a global override layout and notify listeners.
   * @param {string[]} layout
   */
  setOverride(layout) {
    this.overrideLayout = this._normalizeLayout(layout);
    const payload = this.overrideLayout?.length ? { layout: this.overrideLayout } : { layout: null };
    this.persistence?.save?.('drumOverrides', payload);
    this.notifyLayoutChange();
  }

  /**
   * Emit updated layout for all listeners.
   */
  notifyLayoutChange() {
    const layout = this.getLayout();
    this.bus.emit({ type: DRUM_LAYOUT_UPDATED, layout });
  }

  _getBaseLayout() {
    if (Array.isArray(this.config?.layout)) {
      return [...this.config.layout];
    }
    return [...DEFAULT_DRUM_LAYOUT];
  }

  _normalizeLayout(layout) {
    if (!Array.isArray(layout)) {
      return null;
    }
    return layout.map(emoji => (typeof emoji === 'string' ? emoji : '')).filter(Boolean);
  }
}
