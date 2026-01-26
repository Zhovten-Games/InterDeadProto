---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - RETRY_DETECTION
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/presentation/widgets/CameraWidget.js
listens:
  - CAMERA_STATUS
  - DETECTION_DONE
  - DETECTION_SEARCH
owns: []
schemaVersion: 1
source: src/presentation/widgets/CameraStatusWidget.js
used_by:
  - src/presentation/adapters/GlobalViewPresenter.js
---

# CameraStatusWidget

Extends `CameraWidget` to react to camera-related events, updating status messages and retry controls. It injects an event bus (`NullEventBus` fallback) so status changes and button refreshes can be coordinated without global singletons.[^1][^2]
When detection completes it freezes the current frame, reveals a thumbnail, and signals that button states should refresh[^3].

[^1]: Constructor wiring and `NullEventBus` default [CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L1-L36); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^2]: Subscription and status handling in [CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L38-L83).
[^3]: Detection completion logic and button state emission in [CameraStatusWidget.js](/src/presentation/widgets/CameraStatusWidget.js#L85-L113).
