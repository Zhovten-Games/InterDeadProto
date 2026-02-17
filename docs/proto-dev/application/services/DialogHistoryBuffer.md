---
domains: []
emits: []
implements: []
imports:
  - src/utils/messageFingerprint.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/DialogHistoryBuffer.js
used_by:
  - src/application/services/DialogOrchestratorService.js
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogHistoryBuffer

Maintains an in-memory cache of dialog messages with fingerprint-based deduplication. New messages are appended only if their
fingerprint has not been seen before, and reactions are normalized as they enter the buffer to keep later comparisons stable.[^1]

`merge` reconciles the buffer with persisted history, tracking fingerprints so only unseen messages are returned, while
`flushTo` pushes accumulated messages to `DialogHistoryService` without resetting the fingerprint set.[^2] Utility helpers update
all user-authored avatars when profiles change and can overwrite stored reactions when persistence confirms a user selection.[^3]

[^1]: Append logic and normalized reaction storage [src/application/services/DialogHistoryBuffer.js#L14-L23](../../src/application/services/DialogHistoryBuffer.js#L14-L23)
[^2]: Merge and flush helpers [src/application/services/DialogHistoryBuffer.js#L25-L76](../../src/application/services/DialogHistoryBuffer.js#L25-L76)
[^3]: Avatar and reaction update helpers [src/application/services/DialogHistoryBuffer.js#L45-L66](../../src/application/services/DialogHistoryBuffer.js#L45-L66)
