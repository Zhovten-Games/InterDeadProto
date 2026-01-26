import { chatDisplay, chatScrollStep } from './chat.config.js';

export default {
  "LOG_LEVEL": "debug",
  "chatDisplay": { ...chatDisplay },
  "chatMessageBatchSize": chatDisplay.batchSize,
  "chatScrollStep": chatScrollStep,
  // Name of the ghost that should be active when no selection is persisted
  "defaultGhost": "guide",
  "textAnimation": {
    "initial": { "effect": "fx1", "speed": 2 },
    "replay": { "effect": "fx3", "speed": 18 },
    "fallbackEffect": "fx3"
  },
  "controlPanel": {
    "showEmojiDrum": false
  },
  "reset": {
    "initialScreen": "welcome",
    "clearDatabase": true,
    "clearStorage": true
  }
};
