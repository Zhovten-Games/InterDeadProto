/**
 * Stores per-ghost reboot checkpoints in persistence.
 * A checkpoint contains a stable dialog history snapshot that can be
 * replayed to return the ghost into a fully completed state boundary.
 */
export default class GhostRebootCheckpointService {
  constructor(persistence = null, storageKey = 'ghostRebootCheckpoints') {
    this.persistence = persistence;
    this.storageKey = storageKey;
    this.cache = this._loadAll();
  }

  saveCheckpoint(ghost, checkpoint) {
    if (!ghost || typeof checkpoint !== 'object' || checkpoint === null) {
      return;
    }
    this.cache[ghost] = {
      ...checkpoint,
      history: Array.isArray(checkpoint.history)
        ? checkpoint.history.map(message => ({ ...message }))
        : []
    };
    this._persist();
  }

  getCheckpoint(ghost) {
    if (!ghost) return null;
    const checkpoint = this.cache[ghost];
    if (!checkpoint) return null;
    return {
      ...checkpoint,
      history: Array.isArray(checkpoint.history)
        ? checkpoint.history.map(message => ({ ...message }))
        : []
    };
  }

  clearGhost(ghost) {
    if (!ghost) return;
    if (!(ghost in this.cache)) return;
    delete this.cache[ghost];
    this._persist();
  }

  reset() {
    this.cache = {};
    this._persist();
  }

  _loadAll() {
    const stored = this.persistence?.load?.(this.storageKey);
    if (!stored || typeof stored !== 'object') {
      return {};
    }
    return { ...stored };
  }

  _persist() {
    this.persistence?.save?.(this.storageKey, this.cache);
  }
}
