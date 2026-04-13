export const PROFILE_UI_PREFERENCES_KEY = 'profile:ui-preferences';

export const DEFAULT_PROFILE_UI_PREFERENCES = Object.freeze({
  membraneDisabled: false,
  disableHoverPulse: false,
});

export function normalizeProfileUiPreferences(value) {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_PROFILE_UI_PREFERENCES };
  }

  return {
    membraneDisabled: value.membraneDisabled === true,
    disableHoverPulse: value.disableHoverPulse === true,
  };
}
