---
domains: []
emits: []
implements: []
imports:
  - src/config/flags.js
  - src/core/engine/actions.js
  - src/core/engine/effects.js
listens: []
owns: []
schemaVersion: 1
source: src/core/engine/reducer.js
used_by:
  - src/core/engine/store.js
---

# reducer.js

Implements the pure reducer at the heart of the core engine, managing detection, dialog, quest, and DSL indices.[^1]

For each action type, it returns a new state along with effect descriptors, enabling a functional architecture where side effects are processed externally.[^2]

The reducer consumes action constants and effect identifiers defined in sibling modules, maintaining clear separation of concerns.[^3]

[^1]: [src/core/engine/reducer.js#L1-L23](../../../src/core/engine/reducer.js#L1-L23)  
[^2]: [src/core/engine/reducer.js#L24-L97](../../../src/core/engine/reducer.js#L24-L97)  
[^3]: [src/core/engine/reducer.js#L4-L14](../../../src/core/engine/reducer.js#L4-L14)
