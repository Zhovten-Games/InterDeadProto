import BaseTextEffect from './BaseTextEffect.js';

/**
 * Effect inspired by Codrops Type Shuffle "fx3":
 * characters flicker through random glyphs before revealing the final text.
 */
export default class ShuffleRevealEffect extends BaseTextEffect {
  constructor(options = {}) {
    super(options);
    const {
      iterations = 6,
      frameDelay = 32
    } = options;
    this.iterations = iterations;
    this.frameDelay = frameDelay;
  }

  async play(element, finalText, { speed = 1, signal } = {}) {
    if (!element) return;
    const normalizedSpeed = Math.max(0.1, Number(speed) || 1);
    const chars = Array.from(finalText ?? '');
    const iterationCount = Math.max(1, Math.round(this.iterations / normalizedSpeed));
    const delay = this.frameDelay / normalizedSpeed;

    for (let i = 0; i < iterationCount; i++) {
      if (!(await this.wait(delay, signal))) return;
      const frame = chars
        .map(ch => (ch === ' ' ? ' ' : this.getRandomChar()))
        .join('');
      element.textContent = frame;
    }

    element.textContent = finalText;
  }
}
