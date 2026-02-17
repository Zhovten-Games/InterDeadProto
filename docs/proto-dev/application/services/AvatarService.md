---
domains: []
emits: []
implements: []
imports:
  - src/core/Service.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/AvatarService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# AvatarService

Retrieves avatar images for the user or ghosts from the database. The current implementation focuses on fetching the most recently stored user selfie, returning base64 data or `null` if none is found[^1]. The service logs whether an avatar was loaded and prints the first 20 base64 characters to confirm the payload[^1]. It extends the base [`Service`](../../core/Service.md) for unified logging and is consumed by `DialogOrchestratorService` when enriching dialog stages with user avatars[^4][^5]. Other services such as `ProfileRegistrationService` save avatar data that this service later consumes[^2]. For each capture, `ViewService` converts the blob to base64 and `ProfileRegistrationService` persists it, logging the byte length before `saveProfile()` proceeds[^2][^3].

Recent diagnostics were added so missing avatars can be traced end-to-end: `ViewService` records conversions, `ProfileRegistrationService` warns if a save is attempted without an avatar, and `AvatarService` reports the snippet retrieved from the database[^3].

[^1]: [src/application/services/AvatarService.js](../../src/application/services/AvatarService.js#L1-L31)
[^2]: [src/application/services/ProfileRegistrationService.js](../../src/application/services/ProfileRegistrationService.js#L37-L61)
[^3]: [src/application/services/ViewService.js](../../src/application/services/ViewService.js#L332-L379)
[^4]: Base class providing logging helpers ([src/core/Service.js](../../src/core/Service.js#L1-L20))
[^5]: Dialog avatar enrichment ([src/application/services/DialogOrchestratorService.js](../../src/application/services/DialogOrchestratorService.js#L119-L141))
