/**
 * Builds standardized auto-generated dialog replies.
 */
export default class AutoReplyBuilder {
  constructor({
    header = '🧭R',
    confirmation = '✅',
    searchToken = '🔎',
    context = '🧊🖼⛓️🙈',
    phase = '🧱',
    channel = '🖼',
  } = {}) {
    this.header = header;
    this.confirmation = confirmation;
    this.searchToken = searchToken;
    this.context = context;
    this.phase = phase;
    this.channel = channel;
  }

  buildDetectionReply(targetEmoji = '') {
    const target = targetEmoji ? `${this.searchToken}${targetEmoji}` : this.searchToken;
    return [this.header, this.confirmation, target, this.context, this.phase, this.channel].join(
      '\n',
    );
  }
}
