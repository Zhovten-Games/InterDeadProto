---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-configuration/merge-configuration.js
used_by:
  - src/app-shell/state/application-state-service.js
source_exists: true
runtime_role: deepMerge
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# deepMerge

`deepMerge` recursively combines two plain object trees, creating a new structure without mutating the inputs.[^1] `StateService` uses it to overlay ghost‑specific overrides onto the default button state configuration.[^2]

[^1]: [src/runtime-configuration/merge-configuration.js#L1-L11](../../../../proto-dev/src/runtime-configuration/merge-configuration.js)

[^2]: [src/app-shell/state/application-state-service.js#L2](../../../../proto-dev/src/app-shell/state/application-state-service.js) and [src/app-shell/state/application-state-service.js#L35-L40](../../../../proto-dev/src/app-shell/state/application-state-service.js)
