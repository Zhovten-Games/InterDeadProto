---
domains: []
emits: []
implements:
  - Step
  - Step
  - Step
  - Step
  - Step
imports: []
listens: []
owns:
  - author
  - compose
  - detection
  - key
  - kind
  - target
  - text
  - type
schemaVersion: 1
source: src/narrative-runtime/dsl/schema.js
used_by:
  - src/narrative-runtime/dsl/compiler.js
  - src/narrative-runtime/dsl/driver.js
source_exists: true
runtime_role: StepTypes
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# schema.js

Defines the domain-specific language (DSL) step classes and factory helpers used to script spirits.[^1]

Each step class extends a common `Step` base, encapsulating behavior such as `SayStep`, `AwaitStep`, and `QuestStep`.[^2]  
Factory functions produce step instances consumed by the compiler and driver.[^3]

[^1]: [src/narrative-runtime/dsl/schema.js#L1-L12](../../../../../proto-dev/src/narrative-runtime/dsl/schema.js)

[^2]: [src/narrative-runtime/dsl/schema.js#L14-L56](../../../../../proto-dev/src/narrative-runtime/dsl/schema.js)

[^3]: [src/narrative-runtime/dsl/schema.js#L59-L80](../../../../../proto-dev/src/narrative-runtime/dsl/schema.js)
