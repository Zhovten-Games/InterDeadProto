---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/narrative-runtime/engine/selectors.js
used_by:
  - src/app-shell/navigation/view-adapter.js
source_exists: true
runtime_role: isDetectionBusy
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# selectors.js

Houses pure functions that derive UI-friendly flags from the engine state.[^1]  
These selectors inform presentation layers whether detection is busy, a quest is active, or dialog awaits user input.[^2]

`selectAwaiting` consolidates these checks into a single descriptor consumed by interfaces to route user actions.[^3]  
Selectors operate on the state shape defined by the reducer's `initialState`.[^4]

[^1]: [src/narrative-runtime/engine/selectors.js#L1-L26](../../../../../proto-dev/src/narrative-runtime/engine/selectors.js)

[^2]: [src/narrative-runtime/engine/selectors.js#L3-L5](../../../../../proto-dev/src/narrative-runtime/engine/selectors.js)

[^3]: [src/narrative-runtime/engine/selectors.js#L7-L26](../../../../../proto-dev/src/narrative-runtime/engine/selectors.js)

[^4]: [src/narrative-runtime/engine/reducer.js#L16-L21](../../../../../proto-dev/src/narrative-runtime/engine/reducer.js)
