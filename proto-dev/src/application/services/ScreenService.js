/**
 * Tracks currently active screen based on SCREEN_CHANGE events.
 */
export default class ScreenService {
  constructor(bus) {
    this.bus = bus;
    this.active = null;
    this._handler = evt => {
      if (evt.type === 'SCREEN_CHANGE') {
        this.active = evt.screen;
      }
    };
  }

  boot() {
    this.bus?.subscribe(this._handler);
  }

  getActive() {
    return this.active;
  }

  dispose() {
    if (this._handler) this.bus?.unsubscribe(this._handler);
  }
}
