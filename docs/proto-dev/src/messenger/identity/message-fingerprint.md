---
domains: []
emits: []
implements: []
imports:
  - src/media/video/youtube.js
listens: []
owns: []
schemaVersion: 1
source: src/messenger/identity/message-fingerprint.js
used_by:
  - src/messenger/history/dialog-history-buffer.js
  - src/messenger/history/dialog-history-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/reactions/application/reaction-persistence-service.js
  - src/messenger/presentation/message-deduplicator.js
source_exists: true
runtime_role: messageFingerprint
contour_primary: DMN-NARRATIVE
contour_secondary: none
role_group: memory_narrative
narrative_role: narrative context builder
---

# messageFingerprint

`messageFingerprint` produces a deterministic identifier for dialog messages. It respects a preexisting fingerprint and otherwise hashes ghost, author, type, text, and a resolved media source into a colon‑delimited string.[^1] The media source resolution includes YouTube identifiers (via `resolveYoutubeId`) so both `youtubeId` fields and YouTube URLs produce stable fingerprints.[^1] This key orchestrates deduplication and persistence across the messaging pipeline: `DialogHistoryBuffer` skips messages whose fingerprints were already captured,[^2] `DialogHistoryService` uses it when preparing messages and deriving fallback keys for legacy records,[^3] `MessageDeduplicator` computes a local content key to avoid rendering duplicates,[^4] and `DialogOrchestratorService` embeds fingerprints while preparing stage configurations and normalizing histories.[^5]

[^1]: [src/messenger/identity/message-fingerprint.js#L1-L23](../../../../../proto-dev/src/messenger/identity/message-fingerprint.js)

[^2]: [src/messenger/history/dialog-history-buffer.js#L1-L22](../../../../../proto-dev/src/messenger/history/dialog-history-buffer.js)

[^3]: [src/messenger/history/dialog-history-service.js#L14-L27](../../../../../proto-dev/src/messenger/history/dialog-history-service.js) and [src/messenger/history/dialog-history-service.js#L55-L63](../../../../../proto-dev/src/messenger/history/dialog-history-service.js)

[^4]: [src/messenger/presentation/message-deduplicator.js#L1-L24](../../../../../proto-dev/src/messenger/presentation/message-deduplicator.js)

[^5]: [src/messenger/application/dialog-orchestrator-service.js#L104-L125](../../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js) and [src/messenger/application/dialog-orchestrator-service.js#L136-L146](../../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js)
