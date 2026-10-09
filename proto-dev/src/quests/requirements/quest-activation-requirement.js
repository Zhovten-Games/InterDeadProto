import CameraRequirement from './camera-requirement.js';

/**
 * Requirement wrapper ensuring detection waits until a quest becomes active.
 */
export default class QuestActivationRequirement extends CameraRequirement {
  constructor(dualityManager, inner) {
    super(inner);
    this.dualityManager = dualityManager;
  }

  /**
   * Detection is allowed only when the active quest has started.
   * @returns {boolean}
   */
  isSatisfied() {
    return !!this.dualityManager?.isQuestActive?.();
  }
}
