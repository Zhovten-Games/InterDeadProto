---
domains: []
emits: []
implements: []
imports:
  - src/narrative-runtime/sequence/duality-manager.js
  - src/narrative-runtime/dialog/dialog-manager.js
  - src/narrative-runtime/dialog/dialog.js
listens: []
owns:
  - context
schemaVersion: 1
source: src/app-shell/composition/domain-module.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: DomainModule
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DomainModule

`DomainModule` binds the core narrative coordinators—`DualityManager` and `DialogManager`—into the container so application services can compose higher-level flows without instantiating domain objects manually.[^1]

`DualityManager` is initialised with the shared event bus, persistence layer, and logging adapter to manage spirit progression and emit lifecycle notifications. `DialogManager` receives a fresh `Dialog` aggregate plus event bus, persistence, and logger references, preparing it to hydrate dialog history once repositories attach listeners.[^2]

[^1]: Module metadata and register entry point [src/app-shell/composition/domain-module.js#L5-L20](../../../../../proto-dev/src/app-shell/composition/domain-module.js)

[^2]: `DualityManager` and `DialogManager` registrations with resolved dependencies [src/app-shell/composition/domain-module.js#L22-L44](../../../../../proto-dev/src/app-shell/composition/domain-module.js); [`DualityManager`](../../narrative-runtime/sequence/duality-manager.md); [`DialogManager`](../../narrative-runtime/dialog/dialog-manager.md)
