import QuestActivationRequirement from '../../core/requirements/QuestActivationRequirement.js';
import { DETECTION_SEARCH } from '../../core/events/constants.js';

export class CameraDetectionStrategy {
  /**
   * Return a requirement describing what the camera should detect.
   * @returns {{type: string, target: string}|null}
   */
  getRequirement() {
    return null;
  }
}

export class RegistrationCameraStrategy extends CameraDetectionStrategy {
  /**
   * Registration camera always searches for a person.
   * @returns {{type: string, target: string}}
   */
  getRequirement() {
    return { type: 'presence', target: 'person' };
  }
}

export class QuestCameraStrategy extends CameraDetectionStrategy {
  constructor(dualityManager, bus) {
    super();
    this.dualityManager = dualityManager;
    this.bus = bus;
  }

  /**
   * Use the active quest requirement. If no target is available, emit a
   * searching status and return null so detection waits.
   * @returns {{type: string, target: string}|null}
   */
  getRequirement() {
    const req = this.dualityManager?.getRequirement?.() || null;
    const target = req?.target ?? req?.object;
    if (!target) {
      // Notify UI that we are waiting for a requirement.
      this.bus?.emit({ type: DETECTION_SEARCH });
      return null;
    }
    const type = req?.type || 'object';
    return new QuestActivationRequirement(this.dualityManager, { ...req, type, target });
  }
}
