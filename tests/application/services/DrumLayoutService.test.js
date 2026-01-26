import assert from 'assert';
import DrumLayoutService from '../../../src/application/services/DrumLayoutService.js';
import { DRUM_LAYOUT_UPDATED } from '../../../src/core/events/constants.js';

/** @description Validates global drum layout resolution and update notifications. */
describe('DrumLayoutService', () => {
  it('returns a shared layout with fallback to defaults', () => {
    const persistence = { load: () => null, save() {} };
    const bus = { emit() {} };
    const service = new DrumLayoutService(persistence, bus, {
      layout: ['🙂', '😐'],
      overrides: { layout: null },
    });
    service.boot();
    assert.deepStrictEqual(service.getLayout(), ['🙂', '😐']);
    assert.deepStrictEqual(service.getLayoutForGhost('guide'), ['🙂', '😐']);
  });

  it('merges overrides from storage and emits layout updates', () => {
    const stored = { layout: ['😎', '😍'] };
    const persistence = {
      load(key) {
        return key === 'drumOverrides' ? stored : null;
      },
      save(key, value) {
        this.saved = { key, value };
      },
      saved: null,
    };
    const events = [];
    const bus = {
      emit(evt) {
        events.push(evt);
      },
    };
    const service = new DrumLayoutService(persistence, bus, {
      layout: ['🙂', '😐'],
      overrides: { layout: null },
    });
    service.boot();
    assert.deepStrictEqual(service.getLayout(), ['😎', '😍']);
    service.setOverride(['🥳']);
    assert.deepStrictEqual(persistence.saved.value, { layout: ['🥳'] });
    const update = events.pop();
    assert.strictEqual(update.type, DRUM_LAYOUT_UPDATED);
    assert.deepStrictEqual(update.layout, ['🥳', '😐']);
  });

  it('handles legacy ghost-specific overrides', () => {
    const persistence = {
      load(key) {
        if (key === 'drumOverrides') {
          return { guide: ['🤖'] };
        }
        return null;
      },
      save() {},
    };
    const bus = { emit() {} };
    const service = new DrumLayoutService(persistence, bus, {
      layout: ['🙂', '😐'],
      overrides: { layout: null },
    });
    service.boot();
    assert.deepStrictEqual(service.getLayout(), ['🤖', '😐']);
  });
});
