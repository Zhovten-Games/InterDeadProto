---
domains: []
emits: []
implements:
  - Service
imports:
  - src/runtime-diagnostics/service.js
listens: []
owns:
  - database
schemaVersion: 1
source: src/identity/application/avatar-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: AvatarService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# AvatarService

Retrieves avatar images for the user or ghosts from the database. The current implementation focuses on fetching the most recently stored user selfie, returning base64 data or `null` if none is found[^1]. The service logs whether an avatar was loaded and prints the first 20 base64 characters to confirm the payload[^1]. It extends the base [`Service`](../../runtime-diagnostics/service.md) for unified logging and is consumed by `DialogOrchestratorService` when enriching dialog stages with user avatars[^4][^5]. Other services such as `ProfileRegistrationService` save avatar data that this service later consumes[^2]. For each capture, `ViewService` converts the blob to base64 and `ProfileRegistrationService` persists it, logging the byte length before `saveProfile()` proceeds[^2][^3].

Recent diagnostics were added so missing avatars can be traced end-to-end: `ViewService` records conversions, `ProfileRegistrationService` warns if a save is attempted without an avatar, and `AvatarService` reports the snippet retrieved from the database[^3].

[^1]: [src/identity/application/avatar-service.js](../../../../../proto-dev/src/identity/application/avatar-service.js)

[^2]: [src/identity/application/profile-registration-service.js](../../../../../proto-dev/src/identity/application/profile-registration-service.js)

[^3]: [src/app-shell/navigation/view-service.js](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^4]: Base class providing logging helpers ([src/runtime-diagnostics/service.js](../../../../../proto-dev/src/runtime-diagnostics/service.js))

[^5]: Dialog avatar enrichment ([src/messenger/application/dialog-orchestrator-service.js](../../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js))
