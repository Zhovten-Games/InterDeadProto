const DEFAULT_THRESHOLD = 0.5;

/**
 * Reusable UI controller for camera detection sensitivity slider.
 */
export default class DetectionSensitivityControl {
  /**
   * @param {HTMLElement} root
   * @param {{
   *  min?: number,
   *  max?: number,
   *  step?: number,
   *  getThreshold?: (() => number|null)|null,
   *  setThreshold?: ((value: number) => number|void)|null,
   *  logger?: { info?: Function, warn?: Function }|null
   * }} options
   */
  constructor(root, options = {}) {
    this.root = root;
    this.options = {
      min: 0.1,
      max: 0.95,
      step: 0.05,
      getThreshold: null,
      setThreshold: null,
      logger: null,
      ...options,
    };
    this._inputListener = null;
  }

  mount() {
    const slider = this._querySlider();
    const valueEl = this._queryValue();
    if (!slider || !valueEl) return;

    const initial = this._normalize(this.options.getThreshold?.() ?? DEFAULT_THRESHOLD);
    slider.min = String(this.options.min);
    slider.max = String(this.options.max);
    slider.step = String(this.options.step);
    slider.value = String(initial);
    valueEl.textContent = initial.toFixed(2);

    this._inputListener = () => {
      const raw = Number(slider.value);
      const normalized = this._normalize(raw);
      valueEl.textContent = normalized.toFixed(2);
      const applied = this.options.setThreshold?.(normalized);
      const effective = Number.isFinite(Number(applied)) ? Number(applied) : normalized;
      slider.value = String(this._normalize(effective));
      valueEl.textContent = Number(slider.value).toFixed(2);
      this.options.logger?.info?.(
        `[Camera UI] Detection sensitivity changed to ${valueEl.textContent}`,
      );
    };

    slider.addEventListener('input', this._inputListener);
  }

  dispose() {
    const slider = this._querySlider();
    if (slider && this._inputListener) {
      slider.removeEventListener('input', this._inputListener);
    }
    this._inputListener = null;
  }

  _normalize(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return DEFAULT_THRESHOLD;
    const min = Number(this.options.min);
    const max = Number(this.options.max);
    if (numeric < min) return min;
    if (numeric > max) return max;
    return numeric;
  }

  _querySlider() {
    return this.root?.querySelector('[data-js="detection-threshold-slider"]') || null;
  }

  _queryValue() {
    return this.root?.querySelector('[data-js="detection-threshold-value"]') || null;
  }
}
