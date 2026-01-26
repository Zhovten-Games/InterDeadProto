import { QUEST_STARTED, QUEST_COMPLETED } from '../events/constants.js';
import NullLogger from '../logging/NullLogger.js';

/**
 * Represents a quest in the duality system.
 * Tracks lifecycle and emits bus events.
 */
export default class Quest {
  constructor(eventBus, persistence, id = '', logger = null) {
    this.eventBus = eventBus;
    this.persistence = persistence;
    this.id = id;
    this.started = false;
    this.completed = false;
    this.logger = logger ?? new NullLogger();
  }

  /** Begin the quest. */
  start() {
    this.started = true;
    this.eventBus?.emit({ type: QUEST_STARTED, id: this.id });
    this.persistence?.save?.(`quest:${this.id}`, this.serializeState());
    this.logger.info(`Quest started: ${this.id}`);
  }

  /** Mark quest as ready (alias to start for now). */
  ready() {
    this.eventBus?.emit({ type: QUEST_STARTED, id: this.id });
  }

  /** Complete quest and persist state. */
  complete() {
    this.completed = true;
    this.eventBus?.emit({ type: QUEST_COMPLETED, id: this.id });
    this.persistence?.save?.(`quest:${this.id}`, this.serializeState());
    this.logger.info(`Quest completed: ${this.id}`);
  }

  /** Serialize quest state. */
  serializeState() {
    return { id: this.id, started: this.started, completed: this.completed };
  }
}
