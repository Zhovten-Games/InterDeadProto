import Stage from './stage.js';
import {
  DUALITY_STARTED,
  DUALITY_COMPLETED,
  DUALITY_STAGE_STARTED,
} from '../../runtime-events/domain/constants.js';
import NullLogger from '../../runtime-diagnostics/null-logger.js';

/**
 * Drives a sequence of event–quest duality stages.
 */
export default class DualityManager {
  constructor(eventBus, persistence, logger = null) {
    this.bus = eventBus;
    this.store = persistence;
    this.logger = logger ?? new NullLogger();
    this.sequence = null;
    this.stages = [];
    this.current = 0;
    this.completionGuard = null;
    /**
     * Stores context when completion is deferred by a guard.
     * @type {object|null}
     * @private
     */
    this._completionDeferred = null;
  }

  prepare(config) {
    const stages = (config.stages || []).map(
      (stage) => new Stage(this.bus, this.store, stage, this.logger),
    );
    const saved = this.store?.load?.(`duality:${config.id}:stage`);
    const completed = !!this.store?.load?.(`duality:${config.id}`)?.completed;
    let current = Number.isInteger(saved?.index) ? saved.index : 0;
    if (completed) current = Math.max(0, stages.length - 1);
    if (!stages[current]) throw new Error(`Missing stage for ${config.id}`);
    return { sequence: config, stages, current, completed };
  }

  commitPrepared(prepared, { notify = true } = {}) {
    this.sequence = prepared.sequence;
    this.stages = prepared.stages;
    this.current = prepared.current;
    this._restoredCompleted = prepared.completed;
    if (notify) this.publishRestored();
  }

  publishRestored() {
    if (this._restoredCompleted) this.bus?.emit({ type: DUALITY_COMPLETED, id: this.sequence.id });
    else {
      const quest = this.stages[this.current]?.quest;
      const state = quest ? this.store?.load?.(`quest:${quest.id}`) : null;
      if (quest && state?.started && !state.completed) quest.start();
    }
  }

  load(config) {
    this.commitPrepared(this.prepare(config));
  }

  start() {
    if (!this.sequence) return;
    this.bus?.emit({ type: DUALITY_STARTED, id: this.sequence.id });
    this.logger.info(`Duality started: ${this.sequence.id}`);
    this.stages[0]?.start();
  }

  getCurrentDialog() {
    return this.stages[this.current]?.getDialog();
  }

  completeCurrentEvent() {
    const stage = this.stages[this.current];
    if (!stage) return;
    stage.completeEvent();
    if (!stage.quest) {
      this._advance();
    }
  }

  completeQuest() {
    const stage = this.stages[this.current];
    if (!stage?.quest) return;
    stage.completeQuest();
    this._advance();
  }

  _advance() {
    if (this.current >= this.stages.length - 1) {
      this.store?.save?.(`duality:${this.sequence?.id}:stage`, {
        index: this.current,
      });
      if (this._shouldDeferCompletion()) {
        return;
      }
      this._completeSequence();
    } else {
      this.current += 1;
      this.store?.save?.(`duality:${this.sequence?.id}:stage`, {
        index: this.current,
      });
      this.stages[this.current].start();
      this.bus?.emit({
        type: DUALITY_STAGE_STARTED,
        id: this.sequence?.id,
        index: this.current,
      });
    }
  }

  /**
   * Attach a guard invoked before announcing duality completion.
   * @param {object|null} guard object exposing shouldHoldCompletion(context)
   */
  setCompletionGuard(guard) {
    this.completionGuard = guard || null;
  }

  /**
   * Resume completion when a guard previously deferred it.
   * @returns {boolean} true if completion resumed
   */
  resumeCompletion() {
    if (!this._completionDeferred) {
      return false;
    }
    this._completionDeferred = null;
    this._completeSequence();
    return true;
  }

  _shouldDeferCompletion() {
    if (!this.completionGuard?.shouldHoldCompletion) {
      return false;
    }
    if (this._completionDeferred) {
      return true;
    }
    const context = {
      dualityId: this.sequence?.id || null,
      stageIndex: this.current,
      stageConfig: this.getStageConfig(this.current),
      resume: () => this.resumeCompletion(),
    };
    const hold = this.completionGuard.shouldHoldCompletion(context);
    if (hold) {
      this._completionDeferred = context;
      return true;
    }
    return false;
  }

  _completeSequence() {
    this.bus?.emit({ type: DUALITY_COMPLETED, id: this.sequence?.id });
    this.store?.save?.(`duality:${this.sequence?.id}`, { completed: true });
    this.logger.info(`Duality completed: ${this.sequence?.id}`);
  }

  getRequirement() {
    return this.stages[this.current]?.getRequirement();
  }

  getCurrentStageIndex() {
    return this.current;
  }

  /**
   * Clear persisted progress for the provided configuration.
   * @param {object|null} config
   */
  resetProgress(config) {
    if (!config) return;
    const id = config.id;
    if (id) {
      this.store?.remove?.(`duality:${id}`);
      this.store?.remove?.(`duality:${id}:stage`);
    }
    (config.stages || []).forEach((stage) => {
      const questId = stage?.quest?.id;
      if (questId) {
        this.store?.remove?.(`quest:${questId}`);
      }
    });
    this.current = 0;
    this._completionDeferred = null;
  }

  getStageConfig(index = this.current) {
    return this.sequence?.stages?.[index] || null;
  }

  /**
   * Retrieve the quest object for the current stage.
   * @returns {Quest|null}
   */
  getQuest() {
    return this.stages[this.current]?.quest || null;
  }

  /**
   * Convenience accessor for the current quest's overlay configuration.
   * @returns {object|null}
   */
  getQuestOverlay() {
    return this.getQuest()?.overlay || null;
  }

  isQuestActive() {
    return this.stages[this.current]?.isQuestActive() || false;
  }
}
