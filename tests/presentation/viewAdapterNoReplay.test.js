import assert from 'assert';
import { JSDOM } from 'jsdom';
import ViewAdapter from '../../src/adapters/ui/ViewAdapter.js';

class Bus {
  constructor() { this.subs = []; this.emitted = []; }
  subscribe(fn) { this.subs.push(fn); }
  unsubscribe(fn) { this.subs = this.subs.filter(f => f !== fn); }
  emit(evt) { this.emitted.push(evt); this.subs.slice().forEach(fn => fn(evt)); }
}

describe('ViewAdapter history replay', () => {
  it('does not emit history events on messenger screen change', () => {
    const dom = new JSDOM('<div></div>');
    global.window = dom.window;
    global.document = dom.window.document;
    const bus = new Bus();
    const adapter = new ViewAdapter(bus);
    adapter.boot();
    bus.emit({ type: 'SCREEN_CHANGE', screen: 'messenger' });
    const types = bus.emitted.map(e => e.type);
    assert.ok(!types.includes('EVENT_MESSAGE_READY'));
    assert.ok(!types.includes('DIALOG_CLEAR'));
    adapter.dispose();
    delete global.window;
    delete global.document;
  });
});
