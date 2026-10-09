---
domains: []
emits: []
implements: []
imports: []
listens:
  - SCREEN_CHANGE
owns:
  - _handler
  - active
  - bus
schemaVersion: 1
source: src/app-shell/navigation/screen-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ScreenService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ScreenService

Tracks which screen is currently active by listening for `SCREEN_CHANGE` events. The latest screen identifier is exposed via `getActive` and updated whenever the bus emits a change[^1]. Other services such as `ButtonStateService` query this service to adjust UI state[^2].

[^1]: [src/app-shell/navigation/screen-service.js](../../../../../proto-dev/src/app-shell/navigation/screen-service.js)

[^2]: [src/app-shell/controls/button-state-service.js](../../../../../proto-dev/src/app-shell/controls/button-state-service.js)
