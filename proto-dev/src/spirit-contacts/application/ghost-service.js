export default class GhostService {
  constructor(persistence, config = {}) {
    this.storage = persistence;
    this.defaultGhost = config.defaultGhost || 'guide';
    this.current = this.defaultGhost;
    this.requested = this.current;
  }

  boot() {
    this.current = this.storage?.load?.('ghostType') || this.defaultGhost;
    this.requested = this.current;
  }

  setCurrentGhost(name) {
    this.requested = name;
  }

  getRequestedGhost() {
    return { name: this.requested };
  }

  commitCurrentGhost(name) {
    this.current = name;
    this.requested = name;
    this.storage.save('ghostType', name);
  }

  getCurrentGhost() {
    return { name: this.current };
  }
}
