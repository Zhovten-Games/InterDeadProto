---
domains: []
emits: []
implements: []
imports:
  - src/messenger/identity/message-fingerprint.js
listens: []
owns:
  - _fingerprints
  - _messages
schemaVersion: 1
source: src/messenger/history/dialog-history-buffer.js
used_by:
  - src/messenger/application/dialog-orchestrator-service.js
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogHistoryBuffer
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# DialogHistoryBuffer

Maintains an in-memory cache of dialog messages with fingerprint-based deduplication. New messages are appended only if their
fingerprint has not been seen before, and reactions are normalized as they enter the buffer to keep later comparisons stable.[^1]

`merge` reconciles the buffer with persisted history, tracking fingerprints so only unseen messages are returned, while
`flushTo` pushes accumulated messages to `DialogHistoryService` without resetting the fingerprint set.[^2] Utility helpers update
all user-authored avatars when profiles change and can overwrite stored reactions when persistence confirms a user selection.[^3]

[^1]: Append logic and normalized reaction storage [src/messenger/history/dialog-history-buffer.js#L14-L23](../../../../../proto-dev/src/messenger/history/dialog-history-buffer.js)

[^2]: Merge and flush helpers [src/messenger/history/dialog-history-buffer.js#L25-L76](../../../../../proto-dev/src/messenger/history/dialog-history-buffer.js)

[^3]: Avatar and reaction update helpers [src/messenger/history/dialog-history-buffer.js#L45-L66](../../../../../proto-dev/src/messenger/history/dialog-history-buffer.js)
