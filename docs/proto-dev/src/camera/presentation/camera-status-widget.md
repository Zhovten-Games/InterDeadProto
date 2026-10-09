---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - RETRY_DETECTION
implements:
  - CameraWidget
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/camera/presentation/camera-widget.js
  - src/camera/presentation/detection-sensitivity-control.js
  - src/runtime-events/domain/constants.js
listens:
  - CAMERA_STATUS
  - DETECTION_DONE_EVENT
  - DETECTION_SEARCH
  - DETECTION_STOPPED
owns:
  - _handler
  - _retryListener
  - bus
  - language
  - sensitivityControl
schemaVersion: 1
source: src/camera/presentation/camera-status-widget.js
used_by:
  - src/app-shell/presentation/global-view-presenter.js
source_exists: true
runtime_role: CameraStatusWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# CameraStatusWidget

Extends `CameraWidget` to react to camera-related events, updating status messages and retry controls. It injects an event bus (`NullEventBus` fallback) so status changes and button refreshes can be coordinated without global singletons.[^1][^2]
When detection completes it freezes the current frame, reveals a thumbnail, and signals that button states should refresh[^3].

[^1]: Constructor wiring and `NullEventBus` default [CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^2]: Subscription and status handling in [CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js).

[^3]: Detection completion logic and button state emission in [CameraStatusWidget.js](/src/camera/presentation/camera-status-widget.js).
