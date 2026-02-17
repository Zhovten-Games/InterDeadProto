import { chatDisplay, chatScrollStep } from './chat.config.js';

export default {
  "LOG_LEVEL": "debug",
  "chatDisplay": { ...chatDisplay },
  "chatMessageBatchSize": chatDisplay.batchSize,
  "chatScrollStep": chatScrollStep,
  // Name of the ghost that should be active when no selection is persisted
  "defaultGhost": "guide",
  "controlPanel": {
    "showEmojiDrum": false
  },
  "launcher": {
    "visibility": "auth-gated"
  },
  "reset": {
    "initialScreen": "welcome",
    "clearDatabase": true,
    "clearStorage": true
  },
  "ai": {
    "cocoSsdFallbackUrl": "https://storage.googleapis.com/tfjs-models/tfjs/coco-ssd/model.json",
    "warmupAfterAuth": true,
    "warmupEnabled": true,
    "warmupWithDummyFrame": true
  }
};
