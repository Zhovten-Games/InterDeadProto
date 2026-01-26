import assert from 'assert';
import { compile } from '../../../src/core/dsl/compiler.js';

describe('DSL compiler', () => {
  it('compiles spirit config into ordered steps', () => {
    const config = {
      unlock: { requires: ['guide'] },
      stages: [
        {
          event: {
            messages: [
              { author: 'ghost', text: 'hello' },
              { author: 'user', text: 'hi' }
            ]
          },
          quest: {
            requirement: { target: 'person' },
            overlay: { x: 0, y: 0, width: 10, height: 10 }
          }
        }
      ]
    };
    const steps = compile(config, { error: () => {} });
    assert.strictEqual(steps.length, 7);
    assert.strictEqual(steps[0].type, 'say');
    assert.strictEqual(steps[1].type, 'await');
    assert.strictEqual(steps[1].kind, 'user_post');
    assert.strictEqual(steps[2].author, 'user');
    assert.strictEqual(steps[3].type, 'quest');
    assert.strictEqual(steps[3].detection.target, 'person');
    assert.strictEqual(steps[4].kind, 'camera_capture');
    assert.strictEqual(steps[5].type, 'overlay');
    assert.deepStrictEqual(steps[6].requires, ['guide']);
  });

  it('logs error and skips invalid stages', () => {
    const errors = [];
    const logger = { error: msg => errors.push(msg) };
    const bad = { stages: [{ event: { messages: 'oops' } }] };
    const steps = compile(bad, logger);
    assert.strictEqual(steps.length, 0);
    assert.ok(errors.length > 0);
  });
});
