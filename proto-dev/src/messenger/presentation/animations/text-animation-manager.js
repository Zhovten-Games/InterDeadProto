/** Serialized visual effects. Reset invalidates queued and active work. */
export default class TextAnimationManager {
  constructor(
    language,
    configuration = { live: 'fx1', replay: 'fx3' },
    logger = null,
    effects = new Map(),
  ) {
    this.language = language;
    this.configuration = configuration;
    this.logger = logger;
    this.effects = effects;
    this._queue = Promise.resolve();
    this._revision = 0;
    this._activeControllers = new Set();
  }
  animateMessage(node, message, context = {}) {
    const revision = this._revision;
    const task = this._queue
      .catch(() => {})
      .then(async () => {
        if (revision !== this._revision) return;
        const controller = new AbortController();
        this._activeControllers.add(controller);
        try {
          const text = (await this.language?.translate?.(message.text || '')) || message.text || '';
          if (revision !== this._revision || controller.signal.aborted) return;
          const name = context.isReplay ? this.configuration.replay : this.configuration.live;
          const effect = this.effects.get(name)?.();
          if (effect) await effect.play(node, text, { signal: controller.signal });
          else if (this.language?.applyLanguage && revision === this._revision)
            await this.language.applyLanguage(node);
        } finally {
          this._activeControllers.delete(controller);
        }
      });
    this._queue = task;
    return task;
  }
  reset() {
    this._revision += 1;
    // New context work must not wait for an obsolete translation/effect port.
    this._queue = Promise.resolve();
    for (const controller of this._activeControllers) controller.abort();
    this._activeControllers.clear();
  }
  dispose() {
    this.reset();
  }
}
