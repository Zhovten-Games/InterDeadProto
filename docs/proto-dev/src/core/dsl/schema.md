---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/dsl/schema.js
used_by:
  - src/core/dsl/compiler.js
  - src/core/dsl/driver.js
---

# schema.js

Defines the domain-specific language (DSL) step classes and factory helpers used to script spirits.[^1]

Each step class extends a common `Step` base, encapsulating behavior such as `SayStep`, `AwaitStep`, and `QuestStep`.[^2]  
Factory functions produce step instances consumed by the compiler and driver.[^3]

[^1]: [src/core/dsl/schema.js#L1-L12](../../../src/core/dsl/schema.js#L1-L12)  
[^2]: [src/core/dsl/schema.js#L14-L56](../../../src/core/dsl/schema.js#L14-L56)  
[^3]: [src/core/dsl/schema.js#L59-L80](../../../src/core/dsl/schema.js#L59-L80)
