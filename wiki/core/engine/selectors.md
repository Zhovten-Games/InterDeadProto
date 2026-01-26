---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/engine/selectors.js
used_by:
  - src/adapters/ui/ViewAdapter.js
---

# selectors.js

Houses pure functions that derive UI-friendly flags from the engine state.[^1]  
These selectors inform presentation layers whether detection is busy, a quest is active, or dialog awaits user input.[^2]

`selectAwaiting` consolidates these checks into a single descriptor consumed by interfaces to route user actions.[^3]  
Selectors operate on the state shape defined by the reducer's `initialState`.[^4]

[^1]: [src/core/engine/selectors.js#L1-L26](../../../src/core/engine/selectors.js#L1-L26)  
[^2]: [src/core/engine/selectors.js#L3-L5](../../../src/core/engine/selectors.js#L3-L5)  
[^3]: [src/core/engine/selectors.js#L7-L26](../../../src/core/engine/selectors.js#L7-L26)  
[^4]: [src/core/engine/reducer.js#L16-L21](../../../src/core/engine/reducer.js#L16-L21)
