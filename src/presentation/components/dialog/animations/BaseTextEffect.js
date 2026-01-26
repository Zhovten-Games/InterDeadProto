const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$&*()-_=+[]{}<>?/\\|~';

/**
 * Base class for dialog text effects. Provides shared helpers such as
 * random character selection and cancellable delays.
 */
export default class BaseTextEffect {
  constructor({ charset = DEFAULT_CHARSET } = {}) {
    this.charset = charset;
  }

  /**
   * Returns a random character from the configured charset.
   * @returns {string}
   */
  getRandomChar() {
    const idx = Math.floor(Math.random() * this.charset.length);
    return this.charset.charAt(idx);
  }

  /**
   * Waits for the provided duration unless the signal is aborted.
   * @param {number} ms
   * @param {AbortSignal} [signal]
   * @returns {Promise<boolean>} Resolves with `true` if the delay completed,
   * or `false` when aborted.
   */
  wait(ms, signal) {
    const duration = Math.max(0, Number(ms) || 0);
    return new Promise(resolve => {
      if (signal?.aborted) {
        resolve(false);
        return;
      }
      const id = setTimeout(() => {
        resolve(!signal?.aborted);
      }, duration);
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(id);
            resolve(false);
          },
          { once: true }
        );
      }
    });
  }
}
