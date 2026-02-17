import NullLogger from '../../core/logging/NullLogger.js';
import NullEventBus from '../../core/events/NullEventBus.js';
import finaleConfig from '../../config/reactionFinale.config.js';
import {
  DIALOG_CLEAR,
  DUALITY_COMPLETED,
  EVENT_MESSAGE_READY,
  REACTION_SELECTED,
  REACTION_FINALE_RECALCULATE_REQUESTED,
  REACTION_FINALE_STATE_UPDATED
} from '../../core/events/constants.js';

/**
 * Coordinates finale validation based on reaction coverage before allowing
 * duality completion. Emits UI state updates for finale messages.
 */
export default class ReactionFinaleService {
  constructor(
    bus = new NullEventBus(),
    dualityManager = null,
    ghostService = null,
    spiritConfigs = {},
    config = finaleConfig,
    logger = null
  ) {
    this.bus = bus;
    this.dualityManager = dualityManager;
    this.ghostService = ghostService;
    this.spiritConfigs = spiritConfigs || {};
    this.config = config || {};
    this.logger = logger ?? new NullLogger();

    this._requirements = new Map();
    this._stageProgress = new Map();
    this._messageStage = new Map();
    this._finaleMessages = new Map();
    this._pendingCompletion = new Map();
    this._handler = this._handleEvent.bind(this);
  }

  boot() {
    this.dualityManager?.setCompletionGuard?.(this);
    this.bus?.subscribe?.(this._handler);
  }

  dispose() {
    this.bus?.unsubscribe?.(this._handler);
    this._pendingCompletion.clear();
    this._finaleMessages.clear();
    this._messageStage.clear();
    this._stageProgress.clear();
  }

  shouldHoldCompletion(context = {}) {
    const ghost = context.dualityId || this._currentGhostId();
    if (!ghost || !this._isConfigured(ghost)) {
      return false;
    }
    const finale = this._finaleMessages.get(ghost);
    if (!finale) {
      this.logger?.info?.(
        `[ReactionFinale] Deferring completion for ${ghost} until finale message renders.`
      );
      this._pendingCompletion.set(ghost, context.resume || (() => {}));
      return true;
    }
    const missing = this._computeMissingStages(ghost);
    if (missing.length === 0) {
      this._publishComplete(ghost, finale);
      return false;
    }
    this._pendingCompletion.set(ghost, context.resume || (() => {}));
    this._publishPending(ghost, finale, missing);
    return true;
  }

  _handleEvent(evt) {
    if (!evt) return;
    if (evt.type === EVENT_MESSAGE_READY) {
      this._handleMessageReady(evt);
      return;
    }
    if (evt.type === REACTION_SELECTED) {
      this._handleReaction(evt);
      return;
    }
    if (evt.type === REACTION_FINALE_RECALCULATE_REQUESTED) {
      this._handleRecalculate(evt);
      return;
    }
    if (evt.type === DUALITY_COMPLETED) {
      this._handleCompletion(evt);
      return;
    }
    if (evt.type === DIALOG_CLEAR) {
      this._handleDialogClear();
    }
  }

  _handleMessageReady(evt) {
    const ghost = this._currentGhostId();
    if (!ghost) return;
    const fingerprint = this._extractFingerprint(evt);
    const stageId = this._extractStageId(evt);
    if (fingerprint) {
      this._getMessageStageIndex(ghost).set(fingerprint, stageId);
    }
    const reaction = this._normalizeReaction(evt.reaction || evt.message?.reaction);
    if (stageId && reaction) {
      this._markStageSatisfied(ghost, stageId);
    }
    const finaleEnabled = this._isFinaleMessage(evt);
    if (finaleEnabled && fingerprint) {
      const finale = { fingerprint, stageId };
      this._finaleMessages.set(ghost, finale);
      const missing = this._computeMissingStages(ghost);
      if (missing.length === 0) {
        this._publishComplete(ghost, finale);
      } else {
        this._publishPending(ghost, finale, missing);
      }
    }
  }

  _handleReaction(evt) {
    const ghost = this._currentGhostId();
    if (!ghost) return;
    const stageId = evt.stageId || this._lookupStageByFingerprint(ghost, evt.fingerprint);
    if (!stageId) return;
    const reaction = this._normalizeReaction(evt.reaction);
    if (reaction) {
      this._markStageSatisfied(ghost, stageId);
      this._evaluatePendingCompletion(ghost);
    }
  }

  _handleRecalculate(evt) {
    const ghost = evt?.ghostId || this._currentGhostId();
    if (!ghost) return;
    const finale = this._finaleMessages.get(ghost);
    if (!finale) return;
    const missing = this._computeMissingStages(ghost);
    if (missing.length === 0) {
      this._publishComplete(ghost, finale);
      this._resumeIfPending(ghost);
    } else {
      this._publishPending(ghost, finale, missing);
    }
  }

  _handleCompletion(evt) {
    if (!evt?.id) return;
    this._pendingCompletion.delete(evt.id);
    this._finaleMessages.delete(evt.id);
  }

  _handleDialogClear() {
    this._messageStage.clear();
  }

  _evaluatePendingCompletion(ghost) {
    const finale = this._finaleMessages.get(ghost);
    if (!finale) return;
    const missing = this._computeMissingStages(ghost);
    if (missing.length === 0) {
      this._publishComplete(ghost, finale);
      this._resumeIfPending(ghost);
    } else if (this._pendingCompletion.has(ghost)) {
      this._publishPending(ghost, finale, missing);
    }
  }

  _publishPending(ghost, finale, missing) {
    const config = this._resolveConfig(ghost);
    const promptKey = config?.pending?.messageKey || 'reactions.finale.pending';
    const buttonKey = config?.pending?.buttonKey || 'reactions.finale.recalculate';
    this.bus?.emit?.({
      type: REACTION_FINALE_STATE_UPDATED,
      ghostId: ghost,
      fingerprint: finale?.fingerprint || null,
      stageId: finale?.stageId || null,
      status: 'pending',
      promptKey,
      buttonKey,
      missingStages: [...missing]
    });
  }

  _publishComplete(ghost, finale) {
    const config = this._resolveConfig(ghost);
    const status = {
      type: REACTION_FINALE_STATE_UPDATED,
      ghostId: ghost,
      fingerprint: finale?.fingerprint || null,
      stageId: finale?.stageId || null,
      status: 'complete',
      titleKey: config?.success?.titleKey || null,
      messageKey: config?.success?.messageKey || null,
      imageUrl: config?.success?.imageUrl || '',
      imageAltKey: config?.success?.imageAltKey || null
    };
    this.bus?.emit?.(status);
    this._resumeIfPending(ghost);
  }

  _resumeIfPending(ghost) {
    const resume = this._pendingCompletion.get(ghost);
    if (typeof resume === 'function') {
      this._pendingCompletion.delete(ghost);
      try {
        resume();
      } catch (err) {
        this.logger?.error?.(err?.message || err);
      }
    }
  }

  _markStageSatisfied(ghost, stageId) {
    if (!stageId) return;
    const stages = this._getStageProgress(ghost);
    stages.set(stageId, true);
  }

  _computeMissingStages(ghost) {
    const required = this._getRequirements(ghost);
    const stages = this._getStageProgress(ghost);
    const missing = [];
    required.forEach(stageId => {
      if (!stages.get(stageId)) {
        missing.push(stageId);
      }
    });
    return missing;
  }

  _getRequirements(ghost) {
    if (!this._requirements.has(ghost)) {
      const cfg = this._resolveConfig(ghost);
      let stageIds = Array.isArray(cfg?.requiredStages)
        ? cfg.requiredStages.filter(id => typeof id === 'string' && id.trim() !== '')
        : [];
      if (!stageIds.length) {
        const spirit = this.spiritConfigs?.[ghost];
        if (Array.isArray(spirit?.stages)) {
          stageIds = spirit.stages
            .filter(stage => Array.isArray(stage?.reactions) && stage.reactions.length > 0)
            .map(stage => stage.id || stage.event?.id || stage.quest?.id)
            .filter(id => typeof id === 'string' && id.trim() !== '');
        } else if (spirit?.reactions && typeof spirit.reactions === 'object') {
          stageIds = Object.keys(spirit.reactions).filter(id => typeof id === 'string' && id.trim() !== '');
        }
      }
      const excluded = Array.isArray(cfg?.excludedStages)
        ? new Set(cfg.excludedStages.filter(id => typeof id === 'string' && id.trim() !== ''))
        : null;
      if (excluded) {
        stageIds = stageIds.filter(id => !excluded.has(id));
      }
      this._requirements.set(ghost, new Set(stageIds));
    }
    return this._requirements.get(ghost);
  }

  _getStageProgress(ghost) {
    if (!this._stageProgress.has(ghost)) {
      this._stageProgress.set(ghost, new Map());
    }
    return this._stageProgress.get(ghost);
  }

  _getMessageStageIndex(ghost) {
    if (!this._messageStage.has(ghost)) {
      this._messageStage.set(ghost, new Map());
    }
    return this._messageStage.get(ghost);
  }

  _lookupStageByFingerprint(ghost, fingerprint) {
    if (!fingerprint) return null;
    return this._getMessageStageIndex(ghost).get(fingerprint) || null;
  }

  _resolveConfig(ghost) {
    return this.config?.[ghost] || null;
  }

  _isConfigured(ghost) {
    const cfg = this._resolveConfig(ghost);
    return Boolean(cfg);
  }

  _isFinaleMessage(evt) {
    const effects = evt?.effects || evt?.message?.effects;
    if (!effects) return false;
    if (effects.reactionFinale === true) return true;
    if (typeof effects.reactionFinale === 'object') return true;
    return false;
  }

  _extractFingerprint(evt) {
    if (evt?.fingerprint) return evt.fingerprint;
    if (evt?.message?.fingerprint) return evt.message.fingerprint;
    return null;
  }

  _extractStageId(evt) {
    if (typeof evt?.stageId === 'string' && evt.stageId.trim() !== '') return evt.stageId;
    if (typeof evt?.message?.stageId === 'string' && evt.message.stageId.trim() !== '') {
      return evt.message.stageId;
    }
    return null;
  }

  _currentGhostId() {
    return this.ghostService?.getCurrentGhost?.()?.name || null;
  }

  _normalizeReaction(value) {
    if (typeof value !== 'string') return '';
    return value.trim();
  }
}
