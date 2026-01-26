---
domains: []
emits: []
implements: []
imports: []
listens:
  - SCREEN_CHANGE
owns: []
schemaVersion: 1
source: src/application/services/ScreenService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ScreenService

Tracks which screen is currently active by listening for `SCREEN_CHANGE` events. The latest screen identifier is exposed via `getActive` and updated whenever the bus emits a change[^1]. Other services such as `ButtonStateService` query this service to adjust UI state[^2].

[^1]: [src/application/services/ScreenService.js](../../src/application/services/ScreenService.js#L1-L23)
[^2]: [src/application/services/ButtonStateService.js](../../src/application/services/ButtonStateService.js#L67-L75)
