import TypewriterCascadeEffect from '../components/dialog/animations/TypewriterCascadeEffect.js';
import LoaderModuleNameProvider from '../components/loader/LoaderModuleNameProvider.js';

/**
 * LoaderView listens for overlay events and updates DOM accordingly.
 * It creates a full screen overlay with the current boot message and
 * animates module names using the primary typewriter effect.
 */
export default class LoaderView {
  constructor(
    bus,
    languageManager = null,
    moduleNameProvider = null,
    effectFactory = () => new TypewriterCascadeEffect()
  ) {
    this.bus = bus;
    this.languageManager = languageManager;
    this.moduleNameProvider = moduleNameProvider || (languageManager ? new LoaderModuleNameProvider(languageManager) : null);
    this.effectFactory = effectFactory;
    this.overlay = this._createOverlay();
    this._handler = evt => this._handle(evt);
    this.shownSteps = new Set();
    this._animationQueue = Promise.resolve();
    this._activeControllers = new Set();
    this._generation = 0;
  }

  /** Boots the view by subscribing to the event bus. */
  boot() {
    this.bus.subscribe(this._handler);
  }

  /** Cleans up subscriptions. */
  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  _createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loader';
    overlay.innerHTML = `
      <div class="loader__content">
        <div class="loader__message" data-i18n="loading"></div>
        <ul class="loader__list"></ul>
      </div>
    `;
    const container = document.querySelector('[data-js="global-content"]') || document.body;
    container.appendChild(overlay);
    this.languageManager?.applyLanguage(overlay);
    return overlay;
  }

  _handle(evt) {
    if (!evt || typeof evt.type !== 'string') return;
    if (evt.type === 'OVERLAY_SHOW') {
      const msg = this.overlay.querySelector('.loader__message');
      this._resetAnimations();
      if (evt.i18nKey) {
        msg.setAttribute('data-i18n', evt.i18nKey);
        this.languageManager?.applyLanguage(this.overlay);
        this.bus.emit({
          type: 'log',
          level: 'info',
          message: `LoaderView: rendering overlay message key ${evt.i18nKey}`
        });
      } else if (evt.message) {
        msg.textContent = evt.message;
        this.bus.emit({
          type: 'log',
          level: 'info',
          message: `LoaderView: rendering overlay message ${evt.message}`
        });
      }
      this._clearSteps();
      this.overlay.classList.add('loader--visible');
    } else if (evt.type === 'OVERLAY_HIDE') {
      this._resetAnimations();
      this._clearSteps();
      this.overlay.classList.remove('loader--visible');
    } else if (evt.type === 'OVERLAY_STEP') {
      const key = evt.i18nKey;
      if (!key || this.shownSteps.has(key)) return;
      this.shownSteps.add(key);
      const list = this.overlay.querySelector('.loader__list');
      const li = document.createElement('li');
      li.className = 'loader__step';
      li.dataset.loaderKey = key;
      const span = document.createElement('span');
      span.className = 'loader__step-text';
      li.appendChild(span);
      list.appendChild(li);
      this._enqueueStepAnimation(span, key);
      this._log('info', `LoaderView: rendering overlay step ${key}`);
    }
  }

  _clearSteps() {
    const list = this.overlay.querySelector('.loader__list');
    if (list) list.innerHTML = '';
    this.shownSteps.clear();
  }

  _resetAnimations() {
    this._generation += 1;
    for (const controller of this._activeControllers) {
      controller.abort();
    }
    this._activeControllers.clear();
    this._animationQueue = Promise.resolve();
  }

  _enqueueStepAnimation(element, key) {
    const run = async () => {
      const generation = this._generation;
      const label = await this._resolveStepLabel(key);
      if (generation !== this._generation) return;
      const effect = this._createEffect();
      if (!effect || typeof effect.play !== 'function') {
        element.textContent = label;
        return;
      }
      const controller = new AbortController();
      this._activeControllers.add(controller);
      element.textContent = '';
      try {
        await effect.play(element, label, { signal: controller.signal });
      } catch (err) {
        if (err?.name !== 'AbortError') {
          this._log('warn', `LoaderView: step animation failed for ${key}: ${err?.message || err}`);
        }
      } finally {
        controller.abort();
        this._activeControllers.delete(controller);
        element.textContent = label;
      }
    };
    this._animationQueue = this._animationQueue.then(run, run);
  }

  _createEffect() {
    try {
      return this.effectFactory?.();
    } catch (err) {
      this._log('warn', `LoaderView: failed to create text effect: ${err?.message || err}`);
      return null;
    }
  }

  async _resolveStepLabel(key) {
    if (this.moduleNameProvider) {
      try {
        const value = await this.moduleNameProvider.getRandomName(key);
        if (value) return value;
      } catch (err) {
        this._log('warn', `LoaderView: failed to resolve loader label for ${key}: ${err?.message || err}`);
      }
    }
    if (this.languageManager?.translate) {
      try {
        return await this.languageManager.translate(key, 'ui');
      } catch (err) {
        this._log('warn', `LoaderView: translation fallback failed for ${key}: ${err?.message || err}`);
      }
    }
    return key || '';
  }

  _log(level, message) {
    this.bus?.emit?.({ type: 'log', level, message });
  }
}
