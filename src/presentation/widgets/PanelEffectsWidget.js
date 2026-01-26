import NullLogger from '../../core/logging/NullLogger.js';
import effectsConfig from '../../config/effects.config.js';
import { EFFECT_STYLE_UPDATED } from '../../core/events/constants.js';
import ElectricBorderRenderer from '../components/effects/ElectricBorderRenderer.js';
import NullEventBus from '../../core/events/NullEventBus.js';

/**
 * Presentation widget responsible for rendering electric border effects
 * around the control panel.
 */
export default class PanelEffectsWidget {
  constructor(
    eventBus = new NullEventBus(),
    logger = null,
    config = effectsConfig
  ) {
    this.bus = eventBus;
    this.logger = logger ?? new NullLogger();
    this.config = config?.electricBorder || {};
    this.enabled = this.config.enabled ?? true;
    this.canvasKey = this.config.canvasDatasetKey || 'electric-border-canvas';
    this.effectClass = this.config.effectClass || 'panel__bottom--has-effect';
    this.container = null;
    this.canvas = null;
    this.renderer = null;
    this.resizeObserver = null;
    this.currentConfig = null;
    this._handler = this._onEvent.bind(this);
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this.bus?.subscribe?.(this._handler);
    this._booted = true;
  }

  dispose() {
    if (!this._booted) return;
    this.bus?.unsubscribe?.(this._handler);
    this._booted = false;
    this._teardown();
  }

  mount(container) {
    if (!this.enabled) {
      this._teardown();
      return;
    }
    if (!container) {
      this._teardown();
      return;
    }
    if (this.container !== container) {
      this._teardown();
      this.container = container;
    }
    if (!this.canvas) {
      this._ensureCanvas();
    }
    this._resizeToContainer();
    if (this.currentConfig) {
      this._applyConfig(this.currentConfig);
    }
  }

  _onEvent(evt) {
    if (!this.enabled) {
      return;
    }
    if (evt?.type !== EFFECT_STYLE_UPDATED) {
      return;
    }
    if (evt.effect !== 'electricBorder') {
      return;
    }
    this.currentConfig = evt.config || {};
    if (this.container && !this.canvas) {
      this._ensureCanvas();
    }
    if (!this.container || !this.renderer) {
      return;
    }
    this._resizeToContainer();
    this._applyConfig(this.currentConfig);
  }

  _ensureCanvas() {
    if (!this.container) return;
    if (this.effectClass) {
      this.container.classList.add(this.effectClass);
    }
    let canvas = this.container.querySelector(`[data-js="${this.canvasKey}"]`);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.dataset.js = this.canvasKey;
      canvas.className = 'panel__effect-canvas';
      this.container.prepend(canvas);
    }
    this.canvas = canvas;
    this.renderer = new ElectricBorderRenderer(this.canvas, this.currentConfig || {});
    this._observeResize();
    this.renderer.start();
  }

  _applyConfig(config = {}) {
    if (!this.renderer) return;
    this.renderer.update(config);
  }

  _resizeToContainer() {
    if (!this.renderer || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width > 0 && height > 0) {
      this.renderer.resize(width, height);
    }
  }

  _observeResize() {
    if (!this.container) return;
    this.resizeObserver?.disconnect?.();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          const box = entry.contentRect;
          const width = Math.floor(box.width);
          const height = Math.floor(box.height);
          this.renderer?.resize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  _teardown() {
    this.resizeObserver?.disconnect?.();
    this.resizeObserver = null;
    if (this.renderer) {
      this.renderer.stop();
    }
    this.renderer = null;
    this.canvas = null;
    if (this.container && this.effectClass) {
      this.container.classList.remove(this.effectClass);
    }
    this.container = null;
  }
}
