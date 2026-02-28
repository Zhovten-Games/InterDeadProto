---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/dialog/AutoReplyBuilder.js
used_by:
  - src/application/services/DialogOrchestratorService.js
---

# AutoReplyBuilder

`AutoReplyBuilder` builds standardized auto‑generated reply blocks for user messages. It encodes the Emoji Protocol‑style header, confirmation, search token, context, phase, and channel into a six‑line string, inserting the target emoji when available.[^1]

This helper is used by `DialogOrchestratorService` when a stage declares an auto‑generated user reply, ensuring the runtime emits a consistent protocol‑shaped message even without explicit authored text.[^1]

[^1]: Defaults and reply construction [src/core/dialog/AutoReplyBuilder.js#L1-L37](../../../src/core/dialog/AutoReplyBuilder.js#L1-L37)
