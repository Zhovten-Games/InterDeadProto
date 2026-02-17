import ILogging from '../../ports/ILogging.js';

/**
 * No-op logging implementation used as a safe default when no logger is supplied.
 */
export default class NullLogger extends ILogging {
  boot() {}

  dispose() {}

  debug() {}

  info() {}

  warn() {}

  error() {}
}
