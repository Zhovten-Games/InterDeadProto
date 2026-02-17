/**
 * Provides access to valid reaction emoji for the active spirit stage.
 */
export default class ReactionMappingService {
  constructor(ghostService, dualityManager, spiritConfigs = {}, logger = null) {
    this.ghostService = ghostService;
    this.dualityManager = dualityManager;
    this.spiritConfigs = spiritConfigs;
    this.logger = logger;
  }

  /**
   * Retrieve valid reactions for the currently active spirit stage.
   * @returns {string[]}
   */
  getReactionsForCurrentStage() {
    const spiritId = this.ghostService?.getCurrentGhost?.()?.name;
    const stageConfig = this.dualityManager?.getStageConfig?.();
    const stageId = this._extractStageId(stageConfig);
    const reactions = this.getReactionsForStage(spiritId, stageId);
    if (!reactions.length && this.logger?.warn) {
      const ghostLabel = spiritId || 'unknown-ghost';
      const stageLabel = stageId || 'unknown-stage';
      this.logger.warn(`No reactions configured for ${ghostLabel}:${stageLabel}`);
    }
    return reactions;
  }

  /**
   * Retrieve reactions for the provided spirit and stage identifiers.
   * @param {string} spiritId
   * @param {string} stageId
   * @returns {string[]}
   */
  getReactionsForStage(spiritId, stageId) {
    if (!spiritId || !stageId) {
      return [];
    }
    const spirit = this.spiritConfigs?.[spiritId];
    if (!spirit) {
      return [];
    }
    const mapping = spirit.reactions || {};
    const configured = mapping[stageId];
    if (!Array.isArray(configured)) {
      return [];
    }
    return configured.filter(emoji => typeof emoji === 'string' && emoji.trim().length > 0);
  }

  /**
   * Retrieve a configured preset reaction for the provided spirit and stage.
   * Falls back to the first configured reaction if no explicit preset exists.
   * @param {string} spiritId
   * @param {string} stageId
   * @returns {string|null}
   */
  getPresetForStage(spiritId, stageId) {
    if (!spiritId || !stageId) return null;
    const spirit = this.spiritConfigs?.[spiritId];
    if (!spirit) return null;
    const stageConfig = (spirit.stages || []).find(stage => {
      if (stage.id === stageId) return true;
      if (stage.quest?.id === stageId) return true;
      if (stage.event?.id === stageId) return true;
      return false;
    });
    const preset = stageConfig?.reactionPreset;
    const reactions = stageConfig?.reactions || this.getReactionsForStage(spiritId, stageId);
    const normalizedPreset = typeof preset === 'string' ? preset.trim() : '';
    if (normalizedPreset && reactions.includes(normalizedPreset)) {
      return normalizedPreset;
    }
    if (normalizedPreset && !reactions.length) {
      return normalizedPreset;
    }
    return reactions.length ? reactions[0] : null;
  }

  _extractStageId(stageConfig) {
    if (!stageConfig || typeof stageConfig !== 'object') {
      return null;
    }
    if (typeof stageConfig.id === 'string' && stageConfig.id) {
      return stageConfig.id;
    }
    if (typeof stageConfig.quest?.id === 'string' && stageConfig.quest.id) {
      return stageConfig.quest.id;
    }
    if (typeof stageConfig.event?.id === 'string' && stageConfig.event.id) {
      return stageConfig.event.id;
    }
    return null;
  }
}
