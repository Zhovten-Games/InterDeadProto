---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - CAMERA_STATUS
implements: []
imports:
  - src/core/engine/selectors.js
  - src/core/engine/store.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/ports/IView.js
listens:
  - NEXT_BUTTON_ENABLE
  - SCREEN_CHANGE
owns: []
schemaVersion: 1
source: src/adapters/ui/ViewAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# ViewAdapter

Bridges the application state store with DOM interactions. It subscribes to the injected event bus (falling back to `NullEventBus`) and wraps the store's dispatch to monitor awaiting state, translating it into `BUTTON_STATE_UPDATED` signals for UI buttons while also raising `CAMERA_STATUS` for non-camera screens[^1][^2][^3][^4].

[^1]: [`ViewAdapter.js`](../../../src/adapters/ui/ViewAdapter.js#L1-L46)
[^2]: [`ViewAdapter.js`](../../../src/adapters/ui/ViewAdapter.js#L48-L93)
[^3]: [`ViewAdapter.js`](../../../src/adapters/ui/ViewAdapter.js#L95-L123)
[^4]: [`NullEventBus.js`](../../../src/core/events/NullEventBus.js#L1-L11)

