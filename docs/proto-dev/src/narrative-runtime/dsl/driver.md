---
domains: []
emits: []
implements: []
imports:
  - src/narrative-runtime/dsl/schema.js
  - src/narrative-runtime/engine/actions.js
  - src/runtime-configuration/feature-flags.js
listens: []
owns:
  - steps
schemaVersion: 1
source: src/narrative-runtime/dsl/driver.js
used_by: []
source_exists: true
runtime_role: Driver
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# driver.js

A deterministic driver that emits one engine action per tick based on the current DSL step.[^1]  
It consults feature flags to enable or bypass DSL processing.[^2]

Depending on step type, the driver dispatches dialog posts, awaits user input, or starts quests.[^3]  
By consuming action creators from the engine module, it keeps side effects outside and focuses on decision logic.[^4]

[^1]: [src/narrative-runtime/dsl/driver.js#L5-L12](../../../../../proto-dev/src/narrative-runtime/dsl/driver.js)

[^2]: [src/narrative-runtime/dsl/driver.js#L19-L22](../../../../../proto-dev/src/narrative-runtime/dsl/driver.js)

[^3]: [src/narrative-runtime/dsl/driver.js#L23-L37](../../../../../proto-dev/src/narrative-runtime/dsl/driver.js)

[^4]: [src/narrative-runtime/dsl/driver.js#L1-L3](../../../../../proto-dev/src/narrative-runtime/dsl/driver.js)
