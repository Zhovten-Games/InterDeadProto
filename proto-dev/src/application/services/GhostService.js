export default class GhostService {
  constructor(persistence, config = {}) {
    this.storage = persistence;
    this.defaultGhost = config.defaultGhost || 'guide';
    this.current = this.storage.load('ghostType') || this.defaultGhost;
  }

  setCurrentGhost(name) {
    this.current = name;
    this.storage.save('ghostType', name);
  }

  getCurrentGhost() {
    return { name: this.current };
  }
}
