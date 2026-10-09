import { adaptHistoryPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import DialogOrchestratorService from '../../../src/messenger/application/dialog-orchestrator-service.js';
import { DUALITY_COMPLETED } from '../../../src/runtime-events/domain/constants.js';

class Bus {
  constructor() {
    this.handlers = [];
  }
  subscribe(fn) {
    this.handlers.push(fn);
  }
  unsubscribe(fn) {
    this.handlers = this.handlers.filter((h) => h !== fn);
  }
  emit(evt) {
    this.handlers.slice().forEach((h) => h(evt));
  }
}

describe('DialogOrchestratorService duality completion', () => {
  it('unlocks ghost switcher on completion', () => {
    const bus = new Bus();
    let marked = null;
    let btnArgs = null;
    const ghostSwitchService = {
      markCompleted(name) {
        marked = name;
      },
    };
    const buttonStateService = {
      setScreenState(...args) {
        btnArgs = args;
      },
    };
    const svc = new DialogOrchestratorService(
      null,
      { dialog: { messages: [], index: 0 }, progress() {} },
      { getCurrentGhost: () => ({ name: 'guide' }) },
      buttonStateService,
      null,
      adaptHistoryPort(null),
      null,
      ghostSwitchService,
      {},
      null,
      bus,
    );
    svc.boot();
    bus.emit({ type: DUALITY_COMPLETED, id: 'guide' });
    assert.strictEqual(marked, 'guide');
    assert.deepStrictEqual(btnArgs, ['messenger', 'switch-ghost', true]);
  });
});
