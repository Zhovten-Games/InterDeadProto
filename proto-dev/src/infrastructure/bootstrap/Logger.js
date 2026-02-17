import ILogging from '../../ports/ILogging.js';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

export default class Logger extends ILogging {
  constructor(level = 'debug') {
    super();
    this.level = String(level).toLowerCase();
    this.booted = false;
  }

  /**
   * Logging in bootstrap is synchronous so boot simply
   * marks the adapter ready without external side-effects.
   */
  async boot() {
    this.booted = true;
  }

  /**
   * No resources are allocated therefore disposal is a no-op.
   */
  async dispose() {
    this.booted = false;
  }

  shouldLog(level) {
    return LEVELS[level] >= LEVELS[this.level];
  }

  format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(msg) {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', msg));
    }
  }

  info(msg) {
    if (this.shouldLog('info')) {
      console.log(this.format('info', msg));
    }
  }

  warn(msg) {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', msg));
    }
  }

  error(msg) {
    if (this.shouldLog('error')) {
      console.error(this.format('error', msg));
    }
  }
}
