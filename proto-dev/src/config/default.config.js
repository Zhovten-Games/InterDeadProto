import { chatDisplay, chatScroll, chatScrollStep } from './chat.config.js';

export default {
  LOG_LEVEL: 'debug',
  chatDisplay: { ...chatDisplay },
  chatMessageBatchSize: chatDisplay.batchSize,
  chatScroll: { ...chatScroll },
  chatScrollStep: chatScrollStep,
  // Name of the ghost that should be active when no selection is persisted
  defaultGhost: 'guide',
  controlPanel: {
    showEmojiDrum: false,
  },
  launcher: {
    visibility: 'always',
  },
  reset: {
    initialScreen: 'welcome',
    clearDatabase: true,
    clearStorage: true,
  },
  ai: {
    cocoSsdFallbackUrl:
      'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json',
    warmupAfterAuth: true,
    warmupEnabled: true,
    warmupWithDummyFrame: true,
  },
};
