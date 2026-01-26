---
domains: []
emits:
  - USER_PROFILE_SAVED
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - APP_RESET_COMPLETED
owns: []
schemaVersion: 1
source: src/application/services/ProfileRegistrationService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ProfileRegistrationService

Handles user profile creation, import, and export. The service stores profile fields in the database and logs each operation, while encryption secures exported payloads that bundle profile metadata alongside optional ghost/dialog extras supplied by orchestrators.[^1] An injected event bus (`NullEventBus` fallback) lets the service broadcast reset completions and profile updates without binding to infrastructure singletons.[^2] It exposes `setName`/`setAvatar` helpers, tracks whether a profile was imported or exported before allowing progression, and records export blobs for auditing.[^3]

When importing, decrypted data is saved through the database service and the in-memory name/avatar cache is updated for downstream consumers such as `AvatarService`.[^4] `saveProfile` marks presence through `StateService` before persistence and emits `USER_PROFILE_SAVED` so downstream services refresh cached avatars, while reset completion clears local state via an event subscription.[^5]

[^1]: Export/import encryption and payload structure [src/application/services/ProfileRegistrationService.js#L35-L77](../../src/application/services/ProfileRegistrationService.js#L35-L77)
[^2]: Event bus injection and default [src/application/services/ProfileRegistrationService.js#L1-L28](../../src/application/services/ProfileRegistrationService.js#L1-L28); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Progress gating via `_imported`/`_exported` flags and export recording [src/application/services/ProfileRegistrationService.js#L12-L73](../../src/application/services/ProfileRegistrationService.js#L12-L73)
[^4]: Import persistence and logging [src/application/services/ProfileRegistrationService.js#L35-L53](../../src/application/services/ProfileRegistrationService.js#L35-L53)
[^5]: Profile save, state updates, and reset handling [src/application/services/ProfileRegistrationService.js#L80-L120](../../src/application/services/ProfileRegistrationService.js#L80-L120)
