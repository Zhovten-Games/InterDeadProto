---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/utils/deepMerge.js
used_by:
  - src/application/services/StateService.js
---

# deepMerge

`deepMerge` recursively combines two plain object trees, creating a new structure without mutating the inputs.[^1] `StateService` uses it to overlay ghost‑specific overrides onto the default button state configuration.[^2]

[^1]: [src/utils/deepMerge.js#L1-L11](../../src/utils/deepMerge.js#L1-L11)
[^2]: [src/application/services/StateService.js#L2](../../src/application/services/StateService.js#L2) and [src/application/services/StateService.js#L35-L40](../../src/application/services/StateService.js#L35-L40)
