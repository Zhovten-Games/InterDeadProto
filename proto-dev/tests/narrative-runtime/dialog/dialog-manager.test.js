import assert from 'assert';
import Dialog from '../../../src/narrative-runtime/dialog/dialog.js';
import DialogManager from '../../../src/narrative-runtime/dialog/dialog-manager.js';
import ButtonStateService from '../../../src/app-shell/controls/button-state-service.js';
import ScreenService from '../../../src/app-shell/navigation/screen-service.js';
import NullLogger from '../../../src/runtime-diagnostics/null-logger.js';
import { EVENT_MESSAGE_READY } from '../../../src/runtime-events/domain/constants.js';

describe('DialogManager', () => {
  it('publishes messages and toggles post button', () => {
    const events = [];
    const bus = {
      subs: [],
      emit(evt) {
        this.subs.forEach((f) => f(evt));
        events.push(evt);
      },
      subscribe(fn) {
        this.subs.push(fn);
      },
      unsubscribe(fn) {
        this.subs = this.subs.filter((f) => f !== fn);
      },
    };
    const store = {
      save() {},
      load() {
        return {};
      },
    };
    const logger = new NullLogger();
    const screen = new ScreenService(bus);
    screen.boot();
    const btnSvc = new ButtonStateService(bus, store, screen, logger);
    btnSvc.boot();
    const dialog = new Dialog([
      { author: 'ghost', text: 'hello' },
      { author: 'user', text: 'reply' },
    ]);
    const mgr = new DialogManager(dialog, bus, store, btnSvc);
    mgr.progress();
    const evt = events.find((e) => e.type === EVENT_MESSAGE_READY);
    assert.ok(evt);
    assert.strictEqual(evt.text, 'hello');
    assert.strictEqual(evt.message.text, 'hello');
    mgr.progress();
  });
});
