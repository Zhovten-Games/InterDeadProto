---
domains: []
emits:
  - APP_RESET_REQUESTED
  - BUTTONS_RENDER
  - NEXT_BUTTON_ENABLE
  - PROFILE_EXPORT_REQUESTED
  - PROFILE_IMPORT_REQUESTED
  - PROFILE_SETTINGS_REQUESTED
  - RESET_OPTIONS_REQUESTED
  - action
  - capture-btn
  - enter-name
implements: []
imports:
  - src/runtime-events/domain/constants.js
listens:
  - BUTTON_ACTION
owns:
  - _booted
  - _handler
  - bus
  - languageManager
  - profileRegService
  - storage
  - templateService
schemaVersion: 1
source: src/app-shell/controls/button-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ButtonService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ButtonService

Renders button definitions using the template service and dispatches user actions over the event bus.[^1] Buttons are localized
via `LanguageAdapter`, and the resulting HTML is emitted through a `BUTTONS_RENDER` event so adapters can inject markup.[^2]

`handleAction` routes specific commands: language switches update the active locale, capture triggers emit `capture-btn`, profile
import/export fire their dedicated events, and reset flows emit `APP_RESET_REQUESTED` with contextual payloads.[^3] Registration
inputs still update the profile service and toggle the "Next" button availability before broadcasting generic events for
downstream handlers.[^4]

[^1]: Template rendering and constructor wiring [src/app-shell/controls/button-service.js#L9-L45](../../../../../proto-dev/src/app-shell/controls/button-service.js)

[^2]: Template composition and emission [src/app-shell/controls/button-service.js#L32-L45](../../../../../proto-dev/src/app-shell/controls/button-service.js)

[^3]: Action routing for profile transfer, reset, and camera capture [src/app-shell/controls/button-service.js#L47-L86](../../../../../proto-dev/src/app-shell/controls/button-service.js)

[^4]: Registration name handling and generic fallbacks [src/app-shell/controls/button-service.js#L87-L98](../../../../../proto-dev/src/app-shell/controls/button-service.js)

## Current lifecycle contract

Constructor wiring performs no subscription. `boot()` owns one idempotent bus subscription; `dispose()` removes it and permits a new generation. Reset opens options; execution follows an explicit confirmation event.
