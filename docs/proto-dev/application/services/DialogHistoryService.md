---
domains: []
emits: []
implements: []
imports:
  - src/utils/messageFingerprint.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/DialogHistoryService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogHistoryService

Persists per-ghost dialog messages using an underlying repository. Messages are normalized with timestamps, order, avatars, media
references, reactions, and content-derived fingerprints before being appended uniquely to storage, preventing duplicate rows even
when media blobs are regenerated.[^1] Legacy numeric fingerprints are migrated during `load`, ensuring reactions and history
operations can target stable hashes.[^2]

The service tracks processed fingerprints to avoid duplicating entries during a session and can migrate legacy fingerprints on
load.[^3] `setReaction` writes reaction choices through the repository, trimming empty emoji to `NULL` so SQL constraints remain
compact.[^4]

Export/import flows consume `exportAll`/`replaceAll`, which clear caches, dump grouped histories, and bulk replace records while
keeping in-memory fingerprint sets in sync with the database.[^5] `DialogHistoryObserverService` relies on this API to append live
messages as they arrive, and `clearSeen`/`clearAll` allow presenters to replay conversations after ghost switches or resets.[^6]

[^1]: Normalization pipeline handling timestamps, avatars, media, and reactions [src/application/services/DialogHistoryService.js#L14-L59](../../src/application/services/DialogHistoryService.js#L14-L59)
[^2]: Legacy fingerprint migration during load [src/application/services/DialogHistoryService.js#L123-L161](../../src/application/services/DialogHistoryService.js#L123-L161)
[^3]: Session fingerprint cache and legacy migration [src/application/services/DialogHistoryService.js#L60-L123](../../src/application/services/DialogHistoryService.js#L60-L123)
[^4]: Reaction persistence [src/application/services/DialogHistoryService.js#L165-L169](../../src/application/services/DialogHistoryService.js#L165-L169)
[^5]: Export/replace helpers [src/application/services/DialogHistoryService.js#L189-L198](../../src/application/services/DialogHistoryService.js#L189-L198)
[^6]: Observer integration and replay helpers [src/application/services/DialogHistoryService.js#L90-L118](../../src/application/services/DialogHistoryService.js#L90-L118)
