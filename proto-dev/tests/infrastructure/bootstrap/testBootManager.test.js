import assert from 'assert';
import BootManager from '../../../src/infrastructure/bootstrap/BootManager.js';
import Container from '../../../src/infrastructure/container/Container.js';

describe('BootManager.js', () => {
  it('boots services based on priority', async () => {
    const container = new Container();
    const order = [];
    container.register('first', () => ({ boot: () => order.push('first') }), { priority: 2 });
    container.register('second', () => ({ boot: () => order.push('second') }), { priority: 1 });

    const bus = { emit: () => {} };
    const manager = new BootManager(container, bus);
    await manager.bootAll();

    assert.deepStrictEqual(order, ['second', 'first']);
  });

  it('respects declared dependencies', async () => {
    const container = new Container();
    const order = [];
    container.register('a', () => ({ boot: () => order.push('a') }), { priority: 1, deps: ['b'] });
    container.register('b', () => ({ boot: () => order.push('b') }), { priority: 1 });

    const manager = new BootManager(container, { emit: () => {} });
    await manager.bootAll();

    assert.deepStrictEqual(order, ['b', 'a']);
  });

  it('disposes services in reverse order', async () => {
    const container = new Container();
    const order = [];
    container.register('first', () => ({
      boot: () => order.push('boot1'),
      dispose: () => order.push('dispose1')
    }), { priority: 1 });
    container.register('second', () => ({
      boot: () => order.push('boot2'),
      dispose: () => order.push('dispose2')
    }), { priority: 2 });

    const manager = new BootManager(container, { emit: () => {} });
    await manager.bootAll();
    await manager.disposeAll();

    assert.deepStrictEqual(order, ['boot1', 'boot2', 'dispose2', 'dispose1']);
  });

  it('logs errors thrown during disposal', async () => {
    const container = new Container();
    container.register('bad', () => ({
      boot: () => {},
      dispose: () => { throw new Error('boom'); }
    }), { priority: 1 });

    const logger = { errors: [], error(msg) { this.errors.push(msg); } };
    const manager = new BootManager(container, { emit: () => {} }, logger);
    await manager.bootAll();
    await manager.disposeAll();
    assert.ok(logger.errors.some(e => e.includes('boom')));
  });
});
