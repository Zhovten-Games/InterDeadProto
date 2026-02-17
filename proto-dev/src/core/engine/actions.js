// Core engine action constants and factories for state transitions.
// Actions describe intentions that the reducer can handle.

export const DETECTION_START = 'DETECTION_START';
export const DETECTION_DONE = 'DETECTION_DONE';

// Dialog progression and quest lifecycle
export const DIALOG_ADVANCE = 'DIALOG_ADVANCE';
export const QUEST_START = 'QUEST_START';
export const QUEST_COMPLETE = 'QUEST_COMPLETE';
export const AWAIT_USER = 'AWAIT_USER';
export const REPLAY_HISTORY = 'REPLAY_HISTORY';

export const detectionStart = payload => ({ type: DETECTION_START, payload });
export const detectionDone = payload => ({ type: DETECTION_DONE, payload });

export const dialogAdvance = () => ({ type: DIALOG_ADVANCE });
export const questStart = payload => ({ type: QUEST_START, payload });
export const questComplete = payload => ({ type: QUEST_COMPLETE, payload });
export const awaitUser = payload => ({ type: AWAIT_USER, payload });
export const replayHistory = payload => ({ type: REPLAY_HISTORY, payload });

