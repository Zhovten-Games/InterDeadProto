---
domains: []
emits:
  - APP_RESET_REQUESTED
  - BUTTON_STATE_UPDATED
  - CAMERA_PREVIEW_CLEARED
  - CAMERA_PREVIEW_READY
  - CAMERA_STATUS
  - CAMERA_VIEW_CLOSED
  - DETECTION_DONE_EVENT
  - GEO_STATUS_UPDATED
  - MESSENGER_POSTS_READY
  - NEXT_BUTTON_ENABLE
  - RESET_OPTIONS_REQUESTED
  - SCREEN_CHANGE
  - VIEW_CAMERA_RENDER_REQUESTED
  - VIEW_RENDER_REQUESTED
  - enter-name
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - DETECTION_DONE_EVENT
  - RETRY_DETECTION
  - capture-btn
  - detect-geo
  - finish
  - post
  - reset-account
  - toggle-camera
  - toggle-messenger
owns:
  - _booted
  - _captureHandler
  - _geoHandler
  - _handler
  - _mainHandler
  - _nextHandler
  - _previewUrl
  - _registrationHandler
  - _screenRevision
  - bus
  - buttonStateService
  - cameraSectionManager
  - cameraService
  - currentScreen
  - db
  - detectionService
  - dualityManager
  - geoService
  - ghostService
  - historyBuffer
  - historyService
  - languageManager
  - lastDetection
  - logger
  - loginPrefillService
  - mediaRepository
  - notificationManager
  - panelService
  - postsService
  - profileRegService
  - storage
  - templateService
schemaVersion: 1
source: src/app-shell/navigation/view-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ViewService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
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

[^1]: Constructor dependencies and `lastDetection` cache [src/app-shell/navigation/view-service.js#L14-L64](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^2]: Event bus injection [src/app-shell/navigation/view-service.js#L1-L45](../../../../../proto-dev/src/app-shell/navigation/view-service.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Handler registration and disposal [src/app-shell/navigation/view-service.js#L65-L208](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^4]: Screen transition logic, history flush, and view payloads [src/app-shell/navigation/view-service.js#L80-L136](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^5]: Button state replay after screen change [src/app-shell/navigation/view-service.js#L138-L147](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^6]: Geo detection and main action handlers [src/app-shell/navigation/view-service.js#L150-L174](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^7]: Capture workflow, detection handling, profile persistence, and notifications [src/app-shell/navigation/view-service.js#L210-L325](../../../../../proto-dev/src/app-shell/navigation/view-service.js)

[^8]: Post publishing, messenger refresh, and reset emission [src/app-shell/navigation/view-service.js#L327-L383](../../../../../proto-dev/src/app-shell/navigation/view-service.js)
