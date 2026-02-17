import { StepTypes } from './schema.js';
import { questStart, awaitUser } from '../engine/actions.js';
import * as flags from '../../config/flags.js';

/**
 * Step-by-step DSL driver emitting one action per tick.
 * The driver is deterministic and side-effect free.
 */
export default class Driver {
  constructor(steps = []) {
    this.steps = steps;
  }

  /**
   * Determine which action should be dispatched for the current step.
   * @param {Object} state Current engine state containing `dsl.index`.
   * @returns {Object|null} Action to dispatch or null if no action is needed.
   */
  tick(state = {}) {
    const enabled = flags.DSL_ENABLED || process.env.DSL_ENABLED === 'true';
    if (!enabled) return null;
    const index = state?.dsl?.index ?? 0;
    const step = this.steps[index];
    if (!step) return null;
    switch (step.type) {
      case StepTypes.SAY:
        return { type: 'DIALOG_POST', payload: step };
      case StepTypes.AWAIT:
        return awaitUser(step);
      case StepTypes.QUEST:
        if (!state?.quest?.active) {
          return questStart({ target: step.target });
        }
        return null;
      default:
        return null;
    }
  }
}
