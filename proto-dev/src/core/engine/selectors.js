// Selectors derive useful flags from the core state.

export const isDetectionBusy = state => !!state?.detection?.busy;
export const isQuestActive = state => !!state?.quest?.active;
export const isAwaitingUser = state => state?.dialog?.awaiting === 'user';

// Map core state to a unified awaiting descriptor used by the UI layer.
// Returns a structured object describing whether the application awaits
// any user action and which screen should handle it.
export const selectAwaiting = state => {
  if (state?.quest?.active) {
    return {
      awaits: true,
      kind: 'camera_capture',
      targetScreen: 'camera'
    };
  }
  if (state?.dialog?.awaiting === 'user') {
    return {
      awaits: true,
      kind: 'user_text',
      targetScreen: 'messenger'
    };
  }
  return { awaits: false, kind: null, targetScreen: null };
};
