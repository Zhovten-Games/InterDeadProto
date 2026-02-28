---
domains: []
emits: []
implements: []
imports:
  - src/config/chat.config.js
listens: []
owns: []
schemaVersion: 1
source: src/config/default.config.js
used_by:
  - src/config/index.js
---

# Default Application Configuration

Defines baseline runtime settings for logging, chat rendering, default ghost selection, control panel visibility, launcher policy, reset behavior, and AI model warmup/loading defaults.[^1]

`chatDisplay`, `chatMessageBatchSize`, and `chatScrollStep` are derived from `chat.config.js` so chat pacing can be tuned from a single source.[^1]

`reset` controls the initial screen and cleanup semantics (`clearDatabase`, `clearStorage`), while `launcher.visibility` gates launcher behavior for embedded/authenticated flows.[^2]

The `ai` block defines fallback model URL plus warmup toggles (`warmupAfterAuth`, `warmupEnabled`, `warmupWithDummyFrame`) used by warmup and detection services.[^3]

[^1]: Chat, ghost, and panel defaults [src/config/default.config.js#L1-L14](../../src/config/default.config.js#L1-L14)
[^2]: Launcher and reset settings [src/config/default.config.js#L15-L21](../../src/config/default.config.js#L15-L21)
[^3]: AI fallback and warmup flags [src/config/default.config.js#L22-L28](../../src/config/default.config.js#L22-L28)
