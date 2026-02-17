export default class CameraRequirement {
  constructor(inner = {}) {
    this.inner = inner;
    this.type = inner?.type || 'object';
    this.target = inner?.target ?? inner?.object ?? null;
  }

  /**
   * Indicates whether the requirement is satisfied.
   * Subclasses may override.
   * @returns {boolean}
   */
  isSatisfied() {
    return true;
  }
}
