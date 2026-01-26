---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/flags.js
used_by:
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/DialogOrchestratorService.js
  - src/core/dsl/driver.js
  - src/core/engine/reducer.js
---

# Feature Flags

`flags.js` exposes runtime switches controlling experimental subsystems. `ENGINE_V1_ENABLED` toggles the engine-first architecture in dialog and camera orchestrators[^1][^2][^3], while `DSL_ENABLED` gates the domain-specific language processing in the reducer and DSL driver[^4][^5].

[^1]: [`flags.js`](../../src/config/flags.js#L1-L2)
[^2]: [`DialogOrchestratorService.js`](../../src/application/services/DialogOrchestratorService.js#L7-L33)
[^3]: [`CameraOrchestratorService.js`](../../src/application/services/CameraOrchestratorService.js#L6-L37)
[^4]: [`core/engine/reducer.js`](../../src/core/engine/reducer.js#L14-L47)
[^5]: [`core/dsl/driver.js`](../../src/core/dsl/driver.js#L3-L21)
