---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - CAMERA_STATUS
implements:
  - IView
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/narrative-runtime/engine/store.js
  - src/narrative-runtime/engine/selectors.js
  - src/runtime-events/domain/constants.js
  - src/app-shell/ports/view-port.js
listens:
  - SCREEN_CHANGE
owns:
  - _awaiting
  - _booted
  - _nextButtonHandler
  - _origDispatch
  - _screenHandler
  - bus
  - ghostService
  - historyService
  - store
schemaVersion: 1
source: src/app-shell/navigation/view-adapter.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: ViewAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ViewAdapter

Bridges the application state store with DOM interactions. It subscribes to the injected event bus (falling back to `NullEventBus`) and wraps the store's dispatch to monitor awaiting state, translating it into `BUTTON_STATE_UPDATED` signals for UI buttons while also raising `CAMERA_STATUS` for non-camera screens[^1][^2][^3][^4].

[^1]: [`ViewAdapter.js`](../../../../../proto-dev/src/app-shell/navigation/view-adapter.js)

[^2]: [`ViewAdapter.js`](../../../../../proto-dev/src/app-shell/navigation/view-adapter.js)

[^3]: [`ViewAdapter.js`](../../../../../proto-dev/src/app-shell/navigation/view-adapter.js)

[^4]: [`NullEventBus.js`](../../../../../proto-dev/src/runtime-events/domain/null-event-bus.js)
