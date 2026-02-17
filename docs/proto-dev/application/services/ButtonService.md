---
domains: []
emits:
  - APP_RESET_REQUESTED
  - BUTTONS_RENDER
  - NEXT_BUTTON_ENABLE
  - PROFILE_EXPORT_REQUESTED
  - PROFILE_IMPORT_REQUESTED
  - action
  - capture-btn
  - enter-name
implements: []
imports:
  - src/core/events/constants.js
  - src/ports/IEventBus.js
listens:
  - BUTTON_ACTION
owns: []
schemaVersion: 1
source: src/application/services/ButtonService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ButtonService

Renders button definitions using the template service and dispatches user actions over the event bus.[^1] Buttons are localized
via `LanguageAdapter`, and the resulting HTML is emitted through a `BUTTONS_RENDER` event so adapters can inject markup.[^2]

`handleAction` routes specific commands: language switches update the active locale, capture triggers emit `capture-btn`, profile
import/export fire their dedicated events, and reset flows emit `APP_RESET_REQUESTED` with contextual payloads.[^3] Registration
inputs still update the profile service and toggle the "Next" button availability before broadcasting generic events for
downstream handlers.[^4]

[^1]: Template rendering and constructor wiring [src/application/services/ButtonService.js#L9-L45](../../src/application/services/ButtonService.js#L9-L45)
[^2]: Template composition and emission [src/application/services/ButtonService.js#L32-L45](../../src/application/services/ButtonService.js#L32-L45)
[^3]: Action routing for profile transfer, reset, and camera capture [src/application/services/ButtonService.js#L47-L86](../../src/application/services/ButtonService.js#L47-L86)
[^4]: Registration name handling and generic fallbacks [src/application/services/ButtonService.js#L87-L98](../../src/application/services/ButtonService.js#L87-L98)
