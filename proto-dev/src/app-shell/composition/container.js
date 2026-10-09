export default class Container {
  constructor() {
    this.registry = new Map();
  }

  register(name, factory, options = {}) {
    const priority = Number.isInteger(options.priority) ? options.priority : 0;
    const deps = Array.isArray(options.deps) ? options.deps.slice() : [];
    const managed = options.managed !== false;
    this.registry.set(name, { factory, instance: undefined, priority, deps, managed });
  }

  resolve(name) {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new Error(`Dependency ${name} not registered`);
    }
    if (entry.instance === undefined) {
      entry.instance = entry.factory();
    }
    return entry.instance;
  }

  getRegistrations() {
    return Array.from(this.registry.entries()).map(([name, entry]) => ({ name, ...entry }));
  }
}
