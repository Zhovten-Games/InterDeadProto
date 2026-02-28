---
domains: []
emits: []
implements: []
imports:
  - src/config/flags.js
  - src/core/dsl/schema.js
  - src/core/engine/actions.js
listens: []
owns: []
schemaVersion: 1
source: src/core/dsl/driver.js
used_by: []
---

# driver.js

A deterministic driver that emits one engine action per tick based on the current DSL step.[^1]  
It consults feature flags to enable or bypass DSL processing.[^2]

Depending on step type, the driver dispatches dialog posts, awaits user input, or starts quests.[^3]  
By consuming action creators from the engine module, it keeps side effects outside and focuses on decision logic.[^4]

[^1]: [src/core/dsl/driver.js#L5-L12](../../../src/core/dsl/driver.js#L5-L12)  
[^2]: [src/core/dsl/driver.js#L19-L22](../../../src/core/dsl/driver.js#L19-L22)  
[^3]: [src/core/dsl/driver.js#L23-L37](../../../src/core/dsl/driver.js#L23-L37)  
[^4]: [src/core/dsl/driver.js#L1-L3](../../../src/core/dsl/driver.js#L1-L3)
