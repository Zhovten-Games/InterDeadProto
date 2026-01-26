import assert from 'assert';
import Container from '../../../src/infrastructure/container/Container.js';

describe('Container.js', () => {
  it('resolves registered services as singletons', () => {
    const c = new Container();
    let counter = 0;
    c.register('svc', () => ({ id: ++counter }));

    const a = c.resolve('svc');
    const b = c.resolve('svc');
    assert.strictEqual(a, b);
    assert.strictEqual(a.id, 1);
  });

  it('throws when resolving unknown service', () => {
    const c = new Container();
    assert.throws(() => c.resolve('missing'));
  });

  it('reports registrations with priorities', () => {
    const c = new Container();
    c.register('a', () => ({}), { priority: 2 });
    c.register('b', () => ({}), { priority: 1 });
    const regs = c.getRegistrations();
    regs.sort((x, y) => x.priority - y.priority);
    assert.deepStrictEqual(
      regs.map(r => r.name),
      ['b', 'a']
    );
  });
});
