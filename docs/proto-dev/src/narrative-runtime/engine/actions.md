---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/narrative-runtime/engine/actions.js
used_by:
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/dialog-input-gate-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/narrative-runtime/dsl/driver.js
  - src/narrative-runtime/engine/reducer.js
source_exists: true
runtime_role: DETECTION_START
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# actions.js

Defines action constants and creators representing user intentions for the core engine.[^1]  
The reducer consumes these action types to transition state and queue effects.[^2]  
The `Store` dispatch method forwards actions to the reducer, returning any produced effects.[^3]

[^1]: [src/narrative-runtime/engine/actions.js#L1-L21](../../../../../proto-dev/src/narrative-runtime/engine/actions.js)

[^2]: [src/narrative-runtime/engine/reducer.js#L4-L12](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js)

[^3]: [src/narrative-runtime/engine/store.js#L15-L18](../../../../../proto-dev/src/narrative-runtime/engine/store.js)
