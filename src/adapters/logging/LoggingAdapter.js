import ILogging from '../../ports/ILogging.js';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

export default class LoggingAdapter extends ILogging {
  constructor(level = 'debug', bus) {
    super();
    this.level = level.toLowerCase();
    this.bus = bus;
    this._evtHandler = evt => this._handleEvent(evt);
    this._windowErrorHandler = event => this._handleError(event?.error || event);
    this._rejectionHandler = event => this._handleError(event?.reason || event);
  }

  boot() {
    if (this.bus) this.bus.subscribe(this._evtHandler);
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this._windowErrorHandler);
      window.addEventListener('unhandledrejection', this._rejectionHandler);
    }
  }

  dispose() {
    if (this.bus) this.bus.unsubscribe(this._evtHandler);
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this._windowErrorHandler);
      window.removeEventListener('unhandledrejection', this._rejectionHandler);
    }
  }

  _handleEvent(evt) {
    if (!evt || evt.type !== 'log') return;
    const lvl = (evt.level || 'info').toLowerCase();
    if (LEVELS[lvl] === undefined || LEVELS[lvl] < LEVELS[this.level]) return;
    const msg = evt.message || '';
    (this[lvl] || this.info).call(this, msg);
  }

  _handleError(err) {
    const msg = err?.stack || err?.message || String(err);
    this.error(msg);
    if (this.bus) {
      this.bus.emit({ type: 'log', level: 'error', message: msg });
    }
  }

  debug(msg) { if (LEVELS.debug >= LEVELS[this.level]) console.log(`[DEBUG] ${msg}`); }
  info(msg) { if (LEVELS.info >= LEVELS[this.level]) console.log(`[INFO] ${msg}`); }
  warn(msg) { if (LEVELS.warn >= LEVELS[this.level]) console.warn(`[WARN] ${msg}`); }
  error(msg) { console.error(`[ERROR] ${msg}`); }
}
