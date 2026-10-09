---
domains: []
emits: []
implements: []
imports:
  - src/narrative-runtime/engine/reducer.js
listens: []
owns:
  - reducer
  - state
schemaVersion: 1
source: src/narrative-runtime/engine/store.js
used_by:
  - src/app-shell/navigation/view-adapter.js
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/dialog-input-gate-service.js
  - src/messenger/application/dialog-orchestrator-service.js
source_exists: true
runtime_role: Store
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# store.js

Provides a minimal `Store` that holds core state and delegates mutations to the reducer.[^1]  
Dispatching an action updates the internal state and returns any queued effects for the caller to handle.[^2]

The default export preconfigures a store with the reducer's `initialState`, simplifying usage by higher layers.[^3]

[^1]: [src/narrative-runtime/engine/store.js#L5-L13](../../../../../proto-dev/src/narrative-runtime/engine/store.js)

[^2]: [src/narrative-runtime/engine/store.js#L15-L18](../../../../../proto-dev/src/narrative-runtime/engine/store.js)

[^3]: [src/narrative-runtime/engine/store.js#L22-L27](../../../../../proto-dev/src/narrative-runtime/engine/store.js)
