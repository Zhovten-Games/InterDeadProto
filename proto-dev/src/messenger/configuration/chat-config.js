export const chatDisplayModes = Object.freeze({
  ALL: 'all',
  BATCH: 'batch',
});

export const chatDisplay = Object.freeze({
  mode: chatDisplayModes.ALL,
  batchSize: 3,
});

export const chatScrollStep = 100;

export const chatScrollModes = Object.freeze({
  AUTO: 'auto',
  NEW_MESSAGES_BUTTON: 'new-messages-button',
});

export const chatScroll = Object.freeze({
  mode: chatScrollModes.NEW_MESSAGES_BUTTON,
});
