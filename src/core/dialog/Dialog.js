/**
 * Represents a queue of messages between user and ghost.
 * Each message should contain {author, text, avatar}.
 */
export default class Dialog {
  constructor(messages = [], typingDelay = 0) {
    this.messages = messages;
    this.typingDelay = typingDelay;
    this.index = 0;
  }

  /** Return next message and advance pointer. */
  next() {
    if (this.isComplete()) return null;
    return this.messages[this.index++];
  }

  /** Check whether dialog is completed. */
  isComplete() {
    return this.index >= this.messages.length;
  }

  /** Restore progress. */
  restore(index = 0) {
    this.index = index;
  }

  /** Serialize current state. */
  serializeState() {
    return { index: this.index };
  }
}
