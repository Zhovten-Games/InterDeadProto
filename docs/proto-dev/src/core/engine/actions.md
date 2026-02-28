---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/engine/actions.js
used_by:
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/DialogInputGateService.js
  - src/application/services/DialogOrchestratorService.js
  - src/core/dsl/driver.js
  - src/core/engine/reducer.js
---

# actions.js

Defines action constants and creators representing user intentions for the core engine.[^1]  
The reducer consumes these action types to transition state and queue effects.[^2]  
The `Store` dispatch method forwards actions to the reducer, returning any produced effects.[^3]

[^1]: [src/core/engine/actions.js#L1-L21](../../../src/core/engine/actions.js#L1-L21)  
[^2]: [src/core/engine/reducer.js#L4-L12](../../../src/core/engine/reducer.js#L4-L12)  
[^3]: [src/core/engine/store.js#L15-L18](../../../src/core/engine/store.js#L15-L18)
