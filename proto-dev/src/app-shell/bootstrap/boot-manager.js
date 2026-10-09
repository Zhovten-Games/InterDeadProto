import NullLogger from '../../runtime-diagnostics/null-logger.js';

const NULL_BUS = { subscribe() {}, unsubscribe() {}, emit() {} };

/** Single lifecycle authority. Phases share the same acquired-resource stack. */
export default class BootManager {
  constructor(container, bus = NULL_BUS, logger = null) {
    this.container = container;
    this.bus = bus;
    this.logger = logger ?? new NullLogger();
    this.booted = [];
    this._names = new Set();
    this._instances = new Set();
    this._tail = Promise.resolve();
    this._generation = 0;
    this._complete = false;
    this._abort = null;
  }

  bootPhase(names) {
    return this._schedule(names, false);
  }

  bootAll({ complete = true } = {}) {
    return this._schedule(null, complete);
  }

  _schedule(names, complete) {
    const generation = this._generation;
    const task = this._tail.then(() => this._boot(names, complete, generation));
    this._tail = task.catch(() => {});
    return task;
  }

  async _boot(names, complete, generation) {
    if (generation !== this._generation) throw new Error('Bootstrap cancelled');
    if (this._complete) return;
    const registrations = this.container.getRegistrations();
    const registry = new Map(registrations.map((reg) => [reg.name, reg]));
    const selected = new Set();
    const include = (name, visiting = new Set()) => {
      const reg = registry.get(name);
      if (!reg) throw new Error(`Unregistered dependency: ${name}`);
      if (visiting.has(name)) throw new Error(`Cyclic bootstrap dependency: ${name}`);
      if (selected.has(name) || this._names.has(name) || reg.managed === false) return;
      const next = new Set(visiting).add(name);
      for (const dep of reg.deps || []) include(dep, next);
      selected.add(name);
    };
    try {
      for (const name of names || registrations.map((reg) => reg.name)) include(name);
      const remaining = registrations
        .filter((reg) => selected.has(reg.name))
        .sort((a, b) => a.priority - b.priority);
      while (remaining.length) {
        const index = remaining.findIndex((reg) =>
          (reg.deps || []).every(
            (dep) => this._names.has(dep) || registry.get(dep)?.managed === false,
          ),
        );
        if (index < 0)
          throw new Error(
            `Unresolved dependencies: ${remaining.map((reg) => reg.name).join(', ')}`,
          );
        const [reg] = remaining.splice(index, 1);
        if (generation !== this._generation) throw new Error('Bootstrap cancelled');
        const service = this.container.resolve(reg.name);
        if (service && !this._instances.has(service)) {
          this._instances.add(service);
          // A failed boot may already have acquired resources; it also rolls back.
          if (typeof service.dispose === 'function') this.booted.push(service);
          if (typeof service.boot === 'function') {
            this.logger.info?.(`Booting ${reg.name}`);
            let timer;
            const cancelled = new Promise((_, reject) => {
              this._abort = () => reject(new Error('Bootstrap cancelled'));
              timer = setTimeout(() => reject(new Error(`Boot timeout: ${reg.name}`)), 30000);
            });
            try {
              await Promise.race([Promise.resolve().then(() => service.boot()), cancelled]);
            } finally {
              clearTimeout(timer);
              this._abort = null;
            }
            if (generation !== this._generation) throw new Error('Bootstrap cancelled');
            this.bus.emit({ type: 'BOOT_STEP', name: reg.name });
          }
        }
        this._names.add(reg.name);
      }
      if (complete) this.completeBoot();
    } catch (error) {
      await this._release();
      throw error;
    }
  }

  completeBoot() {
    if (this._complete) return;
    this._complete = true;
    this.bus.emit({ type: 'BOOT_COMPLETE' });
  }

  async _release() {
    const acquired = this.booted.splice(0).reverse();
    for (const service of acquired) {
      try {
        await service.dispose();
      } catch (error) {
        this.logger.error?.(error?.message || error);
      }
    }
    this._names.clear();
    this._instances.clear();
    this._complete = false;
  }

  async disposeAll() {
    this._generation += 1;
    this._abort?.();
    await this._tail;
    await this._release();
  }
}
