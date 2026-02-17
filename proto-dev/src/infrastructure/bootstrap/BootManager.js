/**
 * Boots services registered in the container.
 * Services with lower priority values start earlier.
 */
import NullLogger from '../../core/logging/NullLogger.js';

const NULL_BUS = {
  subscribe: () => {},
  unsubscribe: () => {},
  emit: () => {},
};

export default class BootManager {
  /**
   * @param {import('../container/Container.js').default} container Service container.
   * @param {import('../../ports/IEventBus.js').default} bus Application event bus.
   * @param {import('../../ports/ILogging.js').default|NullLogger|null} logger Logger implementation.
   */
  constructor(container, bus = NULL_BUS, logger = null) {
    this.container = container;
    this.bus = bus;
    this.logger = logger ?? new NullLogger();
    this.booted = [];
  }

  async bootAll() {
    const registrations = this.container.getRegistrations();
    registrations.sort((a, b) => a.priority - b.priority);
    const remaining = new Map(registrations.map(r => [r.name, r]));
    const bootedNames = new Set();
    while (remaining.size > 0) {
      let progressed = false;
      for (const [name, reg] of Array.from(remaining.entries())) {
        const deps = reg.deps || [];
        if (deps.every(d => bootedNames.has(d))) {
          const service = this.container.resolve(name);
          if (service && typeof service.boot === 'function') {
            this.logger?.info?.(`Booting ${name}`);
            await service.boot();
            if (typeof service.dispose === 'function') {
              this.booted.push(service);
            }
            this.bus.emit({ type: 'BOOT_STEP', name });
          }
          remaining.delete(name);
          bootedNames.add(name);
          progressed = true;
        }
      }
      if (!progressed) {
        const pending = Array.from(remaining.values()).map(r => r.name).join(', ');
        throw new Error(`Unresolved dependencies: ${pending}`);
      }
    }
    this.bus.emit({ type: 'BOOT_COMPLETE' });
  }

  async disposeAll() {
    for (const service of this.booted.reverse()) {
      try {
        await service.dispose();
      } catch (err) {
        this.logger?.error(err?.message || err);
      }
    }
    this.booted = [];
  }
}
