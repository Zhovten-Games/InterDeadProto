---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-configuration/feature-flags.js
used_by:
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/narrative-runtime/dsl/driver.js
  - src/narrative-runtime/engine/reducer.js
source_exists: true
runtime_role: ENGINE_V1_ENABLED
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Feature Flags

`flags.js` exposes runtime switches controlling experimental subsystems. `ENGINE_V1_ENABLED` toggles the engine-first architecture in dialog and camera orchestrators[^1][^2][^3], while `DSL_ENABLED` gates the domain-specific language processing in the reducer and DSL driver[^4][^5].

[^1]: [`flags.js`](../../../../proto-dev/src/runtime-configuration/feature-flags.js)

[^2]: [`DialogOrchestratorService.js`](../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js)

[^3]: [`CameraOrchestratorService.js`](../../../../proto-dev/src/camera/application/camera-orchestrator-service.js)

[^4]: [`core/engine/reducer.js`](../../../../proto-dev/src/narrative-runtime/engine/reducer.js)

[^5]: [`core/dsl/driver.js`](../../../../proto-dev/src/narrative-runtime/dsl/driver.js)
