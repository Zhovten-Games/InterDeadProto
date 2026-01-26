import BaseTextEffect from './BaseTextEffect.js';

const LEADING_CHARS = "*-\"'";

/**
 * Effect inspired by Codrops Type Shuffle "fx1":
 * characters cascade line-by-line with small random flickers before settling
 * on their final value.
 */
export default class TypewriterCascadeEffect extends BaseTextEffect {
  constructor(options = {}) {
    super(options);
    const {
      flickerSteps = 5,
      charDelay = 28,
      settleDelay = 18
    } = options;
    this.flickerSteps = flickerSteps;
    this.charDelay = charDelay;
    this.settleDelay = settleDelay;
  }

  async play(element, finalText, { speed = 1, signal } = {}) {
    if (!element) return;
    const normalizedSpeed = Math.max(0.1, Number(speed) || 1);
    const characters = Array.from(finalText ?? '');
    let resolved = '';

    for (const char of characters) {
      if (signal?.aborted) return;
      if (char === '\n') {
        resolved += '\n';
        element.textContent = resolved;
        continue;
      }
      if (char === ' ') {
        resolved += ' ';
        element.textContent = resolved;
        continue;
      }

      const steps = Math.max(1, Math.round(this.flickerSteps / normalizedSpeed));
      for (let i = 0; i < steps; i++) {
        if (!(await this.wait(this.charDelay / normalizedSpeed, signal))) return;
        const pool = resolved.length === 0 ? LEADING_CHARS : this.charset;
        const randomChar = pool.charAt(Math.floor(Math.random() * pool.length));
        element.textContent = `${resolved}${randomChar}`;
      }

      resolved += char;
      element.textContent = resolved;
      if (!(await this.wait(this.settleDelay / normalizedSpeed, signal))) return;
    }
  }
}
