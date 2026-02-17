import NullEventBus from '../../core/events/NullEventBus.js';

export default class GhostSwitchService {
  constructor(persistence, bus = new NullEventBus()) {
    this.store = persistence;
    this.bus = bus;
    this.completed = new Set(this.store?.load?.('ghostsCompleted') || []);
  }

  isCompleted(name) {
    return this.completed.has(name);
  }

  markCompleted(name, configs) {
    const before = configs ? this.getUnlocked(configs) : [];
    this.completed.add(name);
    this.store?.save?.('ghostsCompleted', Array.from(this.completed));
    if (configs) {
      const after = this.getUnlocked(configs);
      const newly = after.filter(n => !before.includes(n));
      if (newly.length) {
        this.bus.emit({ type: 'GHOST_UNLOCKED', ghosts: newly });
      }
    }
  }

  getUnlocked(configs) {
    return Object.keys(configs).filter(name => {
      const req = configs[name].unlock?.requires || [];
      return req.every(r => this.completed.has(r));
    });
  }

  getAvailable(configs, currentGhost = null) {
    const unlocked = this.getUnlocked(configs);
    const alwaysVisible = Object.keys(configs).filter(
      name => configs[name].unlock?.alwaysVisible
    );
    const pool = new Set([...unlocked, ...alwaysVisible]);
    if (currentGhost) {
      pool.add(currentGhost);
    }
    return Array.from(pool);
  }
}
