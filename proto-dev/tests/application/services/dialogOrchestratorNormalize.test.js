import assert from 'assert';
import DialogOrchestratorService from '../../../src/application/services/DialogOrchestratorService.js';

class DummyBus { subscribe() {} unsubscribe() {} emit() {} }

class DummyLogger { error() {} }

describe('DialogOrchestratorService normalize history', () => {
  it('removes duplicate messages based on fingerprint or id', () => {
    const svc = new DialogOrchestratorService(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {},
      null,
      new DummyBus(),
      new DummyLogger()
    );
    const history = [
      { author: 'ghost', text: 'hi', fingerprint: 'f1', id: 1 },
      { author: 'ghost', text: 'hi', fingerprint: 'f1', id: 1 },
      { author: 'ghost', text: 'hey', id: 2 },
      { author: 'ghost', text: 'hey', id: 2 },
      { author: 'ghost', text: 'unique', id: 3 }
    ];
    const normalized = svc._normalizeHistory(history, 'g');
    assert.strictEqual(normalized.length, 3);
    assert.deepStrictEqual(normalized.map(m => m.text), ['hi', 'hey', 'unique']);
  });

  it('generates unique fingerprints per ghost', () => {
    const svc = new DialogOrchestratorService(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      {},
      null,
      new DummyBus(),
      new DummyLogger()
    );
    const history = [{ author: 'ghost', text: 'hi' }];
    const a = svc._normalizeHistory(history, 'ga')[0].fingerprint;
    const b = svc._normalizeHistory(history, 'gb')[0].fingerprint;
    assert.notStrictEqual(a, b);
  });
});
