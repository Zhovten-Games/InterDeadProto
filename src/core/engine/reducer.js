// Pure reducer for the functional core.
// Takes current state and an action, returns next state and queued effects.

import {
  DETECTION_START,
  DETECTION_DONE,
  DIALOG_ADVANCE,
  AWAIT_USER,
  REPLAY_HISTORY,
  QUEST_START,
  QUEST_COMPLETE
} from './actions.js';
import { CAMERA_DETECT, DIALOG_PROGRESS, HISTORY_SAVE } from './effects.js';
import * as flags from '../../config/flags.js';

export const initialState = {
  detection: { busy: false },
  dialog: { index: 0, awaiting: 'ghost' },
  quest: { active: false },
  dsl: { index: 0 }
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DETECTION_START:
      if (state.detection.busy) {
        return { state, effects: [] };
      }
      return {
        state: { ...state, detection: { busy: true } },
        effects: [{ type: CAMERA_DETECT, payload: action.payload }]
      };
    case DETECTION_DONE:
      return {
        state: { ...state, detection: { busy: false } },
        effects: []
      };
    case 'DETECTION_FINISHED': {
      const enabled = flags.DSL_ENABLED || process.env.DSL_ENABLED === 'true';
      return {
        state: {
          ...state,
          detection: { busy: false },
          dsl: { index: enabled ? state.dsl.index + 1 : state.dsl.index }
        },
        effects: []
      };
    }
    case DIALOG_ADVANCE: {
      const nextIndex = state.dialog.index + 1;
      const awaiting = state.dialog.awaiting === 'user' ? 'ghost' : 'user';
      return {
        state: {
          ...state,
          dialog: { index: nextIndex, awaiting }
        },
        effects: [{ type: DIALOG_PROGRESS }, { type: HISTORY_SAVE }]
      };
    }
    case 'DIALOG_POST': {
      const nextIndex = state.dialog.index + 1;
      const awaiting = state.dialog.awaiting === 'user' ? 'ghost' : 'user';
      const enabled = flags.DSL_ENABLED || process.env.DSL_ENABLED === 'true';
      const dslIndex = enabled ? state.dsl.index + 1 : state.dsl.index;
      return {
        state: {
          ...state,
          dialog: { index: nextIndex, awaiting },
          dsl: { index: dslIndex }
        },
        effects: [{ type: DIALOG_PROGRESS }, { type: HISTORY_SAVE }]
      };
    }
    case QUEST_START:
      return {
        state: { ...state, quest: { active: true } },
        effects: []
      };
    case QUEST_COMPLETE:
      return {
        state: { ...state, quest: { active: false } },
        effects: []
      };
    case AWAIT_USER:
      return {
        state: { ...state, dialog: { ...state.dialog, awaiting: 'user' } },
        effects: []
      };
    case REPLAY_HISTORY: {
      const patch = action.payload || {};
      const nextState = { ...state, ...patch };
      const same = JSON.stringify(nextState) === JSON.stringify(state);
      return { state: same ? state : nextState, effects: [] };
    }
    default:
      return { state, effects: [] };
  }
}

