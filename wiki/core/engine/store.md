---
domains: []
emits: []
implements: []
imports:
  - src/core/engine/reducer.js
listens: []
owns: []
schemaVersion: 1
source: src/core/engine/store.js
used_by:
  - src/adapters/ui/ViewAdapter.js
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/DialogInputGateService.js
  - src/application/services/DialogOrchestratorService.js
---

# store.js

Provides a minimal `Store` that holds core state and delegates mutations to the reducer.[^1]  
Dispatching an action updates the internal state and returns any queued effects for the caller to handle.[^2]

The default export preconfigures a store with the reducer's `initialState`, simplifying usage by higher layers.[^3]

[^1]: [src/core/engine/store.js#L5-L13](../../../src/core/engine/store.js#L5-L13)  
[^2]: [src/core/engine/store.js#L15-L18](../../../src/core/engine/store.js#L15-L18)  
[^3]: [src/core/engine/store.js#L22-L27](../../../src/core/engine/store.js#L22-L27)
