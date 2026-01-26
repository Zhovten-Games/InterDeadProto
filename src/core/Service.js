export default class Service {
  constructor(logger = null) {
    this.logger = logger;
  }

  debug(msg) {
    this.logger?.debug?.(msg);
  }

  info(msg) {
    this.logger?.info?.(msg);
  }

  warn(msg) {
    this.logger?.warn?.(msg);
  }

  error(msg) {
    this.logger?.error?.(msg);
  }
}
