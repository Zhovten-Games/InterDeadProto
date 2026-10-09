export const createMonitorBeepSound = (overrides = {}) => ({
  type: 'generated-beep',
  bpm: 84,
  frequency: 980,
  volume: 0.08,
  pulseDurationSeconds: 0.05,
  intervalPatternSeconds: [0],
  waveform: 'square',
  ...overrides,
});

export const SOUND_PRESETS = {
  ghostMessage: createMonitorBeepSound({
    bpm: 76,
    frequency: 920,
    volume: 0.07,
    pulseDurationSeconds: 0.24,
  }),
  userMessage: createMonitorBeepSound({
    bpm: 96,
    frequency: 1080,
    volume: 0.06,
    pulseDurationSeconds: 0.2,
  }),
  detectionLoop: createMonitorBeepSound({
    bpm: 62,
    frequency: 860,
    volume: 0.09,
    pulseDurationSeconds: 0.42,
  }),
};
