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

Handles user profile creation, import, and export. The service stores profile fields in the database, encrypts export payloads that can include ghost/dialog extras, and logs each operation for traceability.[^1]

When importing, decrypted data is persisted and the in-memory profile is updated, while the optional `StateService` is marked as locally authenticated. `saveProfile` enforces avatar presence, persists the profile, updates presence and auth readiness, and emits `USER_PROFILE_SAVED` so downstream services refresh cached avatars.[^2]

An injected event bus (`NullEventBus` fallback) listens for `APP_RESET_COMPLETED` to clear local state and reset auth readiness, while `canProceed` gates onboarding based on name entry or import/export activity.[^3]

[^1]: Import/export payload handling and logging [src/application/services/ProfileRegistrationService.js#L35-L78](../../src/application/services/ProfileRegistrationService.js#L35-L78)
[^2]: Import side effects, profile save, and emitted events [src/application/services/ProfileRegistrationService.js#L35-L104](../../src/application/services/ProfileRegistrationService.js#L35-L104)
[^3]: Reset handling and progression gating [src/application/services/ProfileRegistrationService.js#L15-L116](../../src/application/services/ProfileRegistrationService.js#L15-L116)
