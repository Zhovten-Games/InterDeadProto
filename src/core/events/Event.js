import { EVENT_STARTED, EVENT_COMPLETED } from './constants.js';
import NullLogger from '../logging/NullLogger.js';

/**
 * Basic game event lifecycle.
 * Emits start and completion on the provided event bus
 * and persists its state using the persistence port.
 */
export default class Event {
  constructor(eventBus, persistence, id = '', logger = null) {
    this.eventBus = eventBus;
    this.persistence = persistence;
    this.id = id;
    this.started = false;
    this.completed = false;
    this.logger = logger ?? new NullLogger();
  }

  /** Start the event and notify observers. */
  start() {
    this.started = true;
    this.eventBus?.emit({ type: EVENT_STARTED, id: this.id });
    this.logger.info(`Event started: ${this.id}`);
  }

  /** Complete the event and persist state. */
  complete() {
    this.completed = true;
    this.eventBus?.emit({ type: EVENT_COMPLETED, id: this.id });
    this.persistence?.save?.(`event:${this.id}`, this.serializeState());
    this.logger.info(`Event completed: ${this.id}`);
  }

  /** Serialize state for persistence. */
  serializeState() {
    return { id: this.id, started: this.started, completed: this.completed };
  }
}
