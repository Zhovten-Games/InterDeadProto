import Event from '../events/Event.js';
import Quest from '../quests/Quest.js';
import Dialog from '../dialog/Dialog.js';
import NullLogger from '../logging/NullLogger.js';

/**
 * Represents a single event–quest duality stage.
 */
export default class Stage {
  constructor(bus, store, config = {}, logger = null) {
    this.bus = bus;
    this.store = store;
    this.logger = logger ?? new NullLogger();
    this.id = config.id || null;
    this.eventConfig = config.event || {};
    this.questConfig = config.quest || null;
    this.reactions = Array.isArray(config.reactions) ? [...config.reactions] : null;
    this.reactionPreset =
      typeof config.reactionPreset === 'string' && config.reactionPreset.trim() !== ''
        ? config.reactionPreset
        : null;
    this.event = this.eventConfig.id
      ? new Event(bus, store, this.eventConfig.id, this.logger)
      : null;
    if (this.questConfig?.id) {
      this.quest = new Quest(bus, store, this.questConfig.id, this.logger);
      this.quest.overlay = this.questConfig.overlay;
    } else {
      this.quest = null;
    }
  }

  start() {
    if (this.event && this.eventConfig.autoStart) {
      this.event.start();
    }
  }

  getDialog() {
    return new Dialog(this.eventConfig.messages || []);
  }

  getRequirement() {
    return this.questConfig?.requirement || null;
  }

  completeEvent() {
    if (!this.event) return;
    this.event.complete();
    if (this.quest) {
      this.quest.start();
    }
  }

  completeQuest() {
    if (!this.quest) return;
    this.quest.complete();
  }

  isQuestActive() {
    return !!this.quest?.started && !this.quest?.completed;
  }

  getId() {
    return this.id || this.questConfig?.id || this.eventConfig?.id || null;
  }

  getReactions() {
    return this.reactions ? [...this.reactions] : [];
  }

  getReactionPreset() {
    return this.reactionPreset;
  }
}
