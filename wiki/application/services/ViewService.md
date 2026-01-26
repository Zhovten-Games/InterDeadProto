---
domains: []
emits:
  - APP_RESET_REQUESTED
  - BUTTON_STATE_UPDATED
  - CAMERA_PREVIEW_CLEARED
  - CAMERA_PREVIEW_READY
  - CAMERA_STATUS
  - CAMERA_VIEW_CLOSED
  - DETECTION_DONE
  - GEO_STATUS_UPDATED
  - MESSENGER_POSTS_READY
  - NEXT_BUTTON_ENABLE
  - SCREEN_CHANGE
  - VIEW_CAMERA_RENDER_REQUESTED
  - VIEW_RENDER_REQUESTED
  - enter-name
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - DETECTION_DONE
  - REGISTRATION_NAME_CHANGED
  - RETRY_DETECTION
  - SCREEN_CHANGE
  - capture-btn
  - detect-geo
  - finish
  - next
  - post
  - reset-data
  - toggle-camera
  - toggle-messenger
owns: []
schemaVersion: 1
source: src/application/services/ViewService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ViewService

Coordinates UI rendering, screen transitions, and camera workflows. The constructor injects template, panel, language, geo,
detection, camera, history, and media collaborators—plus an event bus that defaults to `NullEventBus`—while caching the last
detection result for reuse.[^1][^2] Boot registers handlers for screen changes, navigation shortcuts, geo detection, camera
events, and registration input updates; `dispose` removes each subscription.[^3]

On `SCREEN_CHANGE` it tears down the previous screen, resets camera state when leaving camera flows, flushes messenger history to
`DialogHistoryService` via `DialogHistoryBuffer`, and emits either a `VIEW_CAMERA_RENDER_REQUESTED` payload (with camera panel
options) or `VIEW_RENDER_REQUESTED` with hydrated messenger posts and registration data.[^3] Retrieved button states are replayed
via `BUTTON_STATE_UPDATED` events so the presenter can reflect stored availability.[^4]

Geo detection requests translate to `GEO_STATUS_UPDATED` and enable navigation, while generic UI actions such as posting,
toggling camera/messenger panels, or requesting a reset delegate to dedicated helpers.[^5] The capture handler manages detection
retries, overlay composition for quests, avatar storage, preview toggling, and finalizing registration, including persisting
identifiers and surfacing notifications before routing to the messenger.[^6]

Publishing a post refreshes the feed and announces `MESSENGER_POSTS_READY`; reset actions raise `APP_RESET_REQUESTED` for the
global reset service.[^7]

[^1]: Constructor dependencies and `lastDetection` cache [src/application/services/ViewService.js#L14-L64](../../src/application/services/ViewService.js#L14-L64)
[^2]: Event bus injection [src/application/services/ViewService.js#L1-L45](../../src/application/services/ViewService.js#L1-L45); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Handler registration and disposal [src/application/services/ViewService.js#L65-L208](../../src/application/services/ViewService.js#L65-L208)
[^4]: Screen transition logic, history flush, and view payloads [src/application/services/ViewService.js#L80-L136](../../src/application/services/ViewService.js#L80-L136)
[^5]: Button state replay after screen change [src/application/services/ViewService.js#L138-L147](../../src/application/services/ViewService.js#L138-L147)
[^6]: Geo detection and main action handlers [src/application/services/ViewService.js#L150-L174](../../src/application/services/ViewService.js#L150-L174)
[^7]: Capture workflow, detection handling, profile persistence, and notifications [src/application/services/ViewService.js#L210-L325](../../src/application/services/ViewService.js#L210-L325)
[^8]: Post publishing, messenger refresh, and reset emission [src/application/services/ViewService.js#L327-L383](../../src/application/services/ViewService.js#L327-L383)
