---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - channel
  - confirmation
  - context
  - header
  - phase
  - searchToken
schemaVersion: 1
source: src/narrative-runtime/dialog/auto-reply-builder.js
used_by:
  - src/messenger/application/dialog-orchestrator-service.js
source_exists: true
runtime_role: AutoReplyBuilder
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# AutoReplyBuilder

`AutoReplyBuilder` builds standardized auto‑generated reply blocks for user messages. It encodes the Emoji Protocol‑style header, confirmation, search token, context, phase, and channel into a six‑line string, inserting the target emoji when available.[^1]

This helper is used by `DialogOrchestratorService` when a stage declares an auto‑generated user reply, ensuring the runtime emits a consistent protocol‑shaped message even without explicit authored text.[^1]

[^1]: Defaults and reply construction [src/narrative-runtime/dialog/auto-reply-builder.js#L1-L37](../../../../../proto-dev/src/narrative-runtime/dialog/auto-reply-builder.js)
