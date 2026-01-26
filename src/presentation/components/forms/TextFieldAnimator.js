import TypewriterCascadeEffect from '../dialog/animations/TypewriterCascadeEffect.js';

export default class TextFieldAnimator {
  constructor(effectFactory = () => new TypewriterCascadeEffect()) {
    this.effectFactory = effectFactory;
    this._controller = null;
  }

  cancel() {
    if (this._controller) {
      this._controller.abort();
      this._controller = null;
    }
  }

  async animate(element, text, options = {}) {
    if (!element) return;
    const finalText = typeof text === 'string' ? text : element.textContent ?? '';
    const effect = this._createEffect();
    if (!effect || typeof effect.play !== 'function') {
      element.textContent = finalText;
      return;
    }
    this.cancel();
    const controller = new AbortController();
    this._controller = controller;
    element.textContent = '';
    try {
      await effect.play(element, finalText, { signal: controller.signal, ...options });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        element.textContent = finalText;
      }
    } finally {
      if (this._controller === controller) {
        this._controller = null;
      }
      element.textContent = finalText;
    }
  }

  _createEffect() {
    try {
      return this.effectFactory?.();
    } catch {
      return null;
    }
  }
}
