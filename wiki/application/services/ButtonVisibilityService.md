---
domains: []
emits:
  - BUTTON_VISIBILITY_UPDATED
implements: []
imports:
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ButtonVisibilityService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ButtonVisibilityService

Persists and broadcasts button visibility across screens. On boot it restores saved flags, normalizes legacy storage values, seeds defaults for messenger/camera toggles, and reports malformed data through a `NullLogger` fallback.[^1]

Visibility changes are persisted and published as `BUTTON_VISIBILITY_UPDATED` events so views can react, mirroring `ButtonStateService` which manages enabled/disabled state for the same actions.[^2]

[^1]: Boot normalization and logging [src/application/services/ButtonVisibilityService.js#L6-L39](../../src/application/services/ButtonVisibilityService.js#L6-L39); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Event emission helpers [src/application/services/ButtonVisibilityService.js#L41-L86](../../src/application/services/ButtonVisibilityService.js#L41-L86); relation to ButtonStateService [src/application/services/ButtonStateService.js#L88-L141](../../src/application/services/ButtonStateService.js#L88-L141)
