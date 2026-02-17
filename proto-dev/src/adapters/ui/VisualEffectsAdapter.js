import IVisualEffects from '../../ports/IVisualEffects.js';

export default class VisualEffectsAdapter extends IVisualEffects {
  constructor(logger = null) {
    super();
    this.logger = logger;
  }

  mount(container) {
    if (!container) {
      this.logger?.warn?.('VisualEffectsAdapter: mount called without container');
    }
  }

  applyEffect(effectName, config = {}) {
    this.logger?.debug?.(
      `VisualEffectsAdapter: applyEffect(${effectName}) ignored in placeholder implementation`,
    );
  }

  clearEffect(effectName) {
    this.logger?.debug?.(
      `VisualEffectsAdapter: clearEffect(${effectName}) ignored in placeholder implementation`,
    );
  }

  clearAll() {
    this.logger?.debug?.('VisualEffectsAdapter: clearAll ignored in placeholder implementation');
  }
}
