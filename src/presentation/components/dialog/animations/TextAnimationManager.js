import TypewriterCascadeEffect from './TypewriterCascadeEffect.js';
import ShuffleRevealEffect from './ShuffleRevealEffect.js';

const DEFAULT_CONFIG = {
  initial: { effect: 'fx1', speed: 2 },
  replay: { effect: 'fx3', speed: 18 },
  fallbackEffect: 'fx3'
};

/**
 * Coordinates text animations for dialog messages. Responsible for
 * serializing animations, resolving translations, and gracefully cancelling
 * running effects when the dialog resets.
 */
export default class TextAnimationManager {
  constructor(languageService, config = {}, bus = null, effectsRegistry = null) {
    this.language = languageService;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bus = bus;
    const registryEntries = effectsRegistry
      ? effectsRegistry instanceof Map
        ? Array.from(effectsRegistry.entries())
        : Object.entries(effectsRegistry)
      : [
          ['fx1', () => new TypewriterCascadeEffect()],
          ['fx2', () => new TypewriterCascadeEffect()],
          ['fx3', () => new ShuffleRevealEffect()],
          ['fx4', () => new ShuffleRevealEffect()],
          ['fx5', () => new ShuffleRevealEffect()],
          ['fx6', () => new ShuffleRevealEffect()]
        ];
    this.effects = new Map(registryEntries);
    this._queue = Promise.resolve();
    this._activeControllers = new Set();
    this._generation = 0;
  }

  /**
   * Cancels all running animations and clears the queue.
   */
  reset() {
    this._generation += 1;
    for (const controller of this._activeControllers) {
      controller.abort();
    }
    this._activeControllers.clear();
    this._queue = Promise.resolve();
  }

  /**
   * Adds or overrides an effect factory.
   * @param {string} name
   * @param {Function} factory
   */
  registerEffect(name, factory) {
    this.effects.set(name, factory);
  }

  /**
   * Enqueues animation for a newly inserted dialog message.
   * @param {HTMLElement} messageNode
   * @param {Object} message
   * @param {Object} context
   */
  animateMessage(messageNode, message = {}, context = {}) {
    const generation = this._generation;
    const run = () => {
      if (generation !== this._generation) return undefined;
      return this._play(messageNode, message, context);
    };
    this._queue = this._queue.then(run, run);
    return this._queue;
  }

  async _play(messageNode, message, context) {
    if (!messageNode) return;
    const textElement = messageNode.querySelector('.dialog__message-text[data-i18n]');
    if (!textElement || !messageNode.isConnected) {
      await this._applyLanguage(messageNode);
      return;
    }

    const key = textElement.getAttribute('data-i18n') || message.text || '';
    const finalText = await this._resolveText(key, message, context);

    const effectName = this._resolveEffectName(context);
    const effectFactory = this.effects.get(effectName) || this.effects.get(this.config.fallbackEffect);
    const effect = typeof effectFactory === 'function' ? effectFactory() : null;
    const speed = this._resolveSpeed(context);

    textElement.dataset.i18nLock = 'true';
    textElement.textContent = finalText;
    await this._applyLanguage(messageNode);

    if (!messageNode.isConnected) {
      delete textElement.dataset.i18nLock;
      return;
    }

    if (!effect) {
      textElement.textContent = finalText;
      delete textElement.dataset.i18nLock;
      return;
    }

    const controller = new AbortController();
    this._activeControllers.add(controller);

    try {
      await effect.play(textElement, finalText, {
        speed,
        signal: controller.signal,
        ...context.effectOptions
      });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        this._log('error', `Text animation failed: ${err?.message || err}`);
      }
    } finally {
      delete textElement.dataset.i18nLock;
      textElement.textContent = finalText;
      controller.abort();
      this._activeControllers.delete(controller);
    }
  }

  async _resolveText(key, message, context) {
    try {
      const translation = await this.language?.translate?.(key, 'ui');
      if (translation) return translation;
    } catch (err) {
      this._log('warn', `Failed to translate "${key}": ${err?.message || err}`);
    }
    if (typeof message?.text === 'string') return message.text;
    if (typeof context?.fallbackText === 'string') return context.fallbackText;
    return '';
  }

  _resolveEffectName(context) {
    if (context?.effect) return context.effect;
    if (context?.isReplay) return context.replayEffect || this.config.replay.effect;
    return context?.initialEffect || this.config.initial.effect;
  }

  _resolveSpeed(context) {
    if (context?.speed) return context.speed;
    return context?.isReplay ? this.config.replay.speed : this.config.initial.speed;
  }

  async _applyLanguage(scope) {
    if (typeof this.language?.applyLanguage === 'function') {
      await this.language.applyLanguage(scope);
    }
  }

  _log(level, message) {
    if (!this.bus) return;
    this.bus.emit?.({ type: 'log', level, message });
  }
}
