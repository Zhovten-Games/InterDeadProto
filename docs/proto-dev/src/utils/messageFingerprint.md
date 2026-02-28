---
domains: []
emits: []
implements: []
imports:
  - src/utils/youtube.js
listens: []
owns: []
schemaVersion: 1
source: src/utils/messageFingerprint.js
used_by:
  - src/application/services/DialogHistoryBuffer.js
  - src/application/services/DialogHistoryService.js
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/ReactionPersistenceService.js
  - src/presentation/widgets/Dialog/MessageDeduplicator.js
---

# messageFingerprint

`messageFingerprint` produces a deterministic identifier for dialog messages. It respects a preexisting fingerprint and otherwise hashes ghost, author, type, text, and a resolved media source into a colon‑delimited string.[^1] The media source resolution includes YouTube identifiers (via `resolveYoutubeId`) so both `youtubeId` fields and YouTube URLs produce stable fingerprints.[^1] This key orchestrates deduplication and persistence across the messaging pipeline: `DialogHistoryBuffer` skips messages whose fingerprints were already captured,[^2] `DialogHistoryService` uses it when preparing messages and deriving fallback keys for legacy records,[^3] `MessageDeduplicator` computes a local content key to avoid rendering duplicates,[^4] and `DialogOrchestratorService` embeds fingerprints while preparing stage configurations and normalizing histories.[^5]

[^1]: [src/utils/messageFingerprint.js#L1-L23](../../src/utils/messageFingerprint.js#L1-L23)
[^2]: [src/application/services/DialogHistoryBuffer.js#L1-L22](../../src/application/services/DialogHistoryBuffer.js#L1-L22)
[^3]: [src/application/services/DialogHistoryService.js#L14-L27](../../src/application/services/DialogHistoryService.js#L14-L27) and [src/application/services/DialogHistoryService.js#L55-L63](../../src/application/services/DialogHistoryService.js#L55-L63)
[^4]: [src/presentation/widgets/Dialog/MessageDeduplicator.js#L1-L24](../../src/presentation/widgets/Dialog/MessageDeduplicator.js#L1-L24)
[^5]: [src/application/services/DialogOrchestratorService.js#L104-L125](../../src/application/services/DialogOrchestratorService.js#L104-L125) and [src/application/services/DialogOrchestratorService.js#L136-L146](../../src/application/services/DialogOrchestratorService.js#L136-L146)
