---
domains: []
emits: []
implements: []
imports:
  - src/core/dialog/Dialog.js
  - src/core/dialog/DialogManager.js
  - src/core/sequence/DualityManager.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/modules/DomainModule.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# DomainModule

`DomainModule` binds the core narrative coordinators—`DualityManager` and `DialogManager`—into the container so application services can compose higher-level flows without instantiating domain objects manually.[^1]

`DualityManager` is initialised with the shared event bus, persistence layer, and logging adapter to manage spirit progression and emit lifecycle notifications. `DialogManager` receives a fresh `Dialog` aggregate plus event bus, persistence, and logger references, preparing it to hydrate dialog history once repositories attach listeners.[^2]

[^1]: Module metadata and register entry point [src/infrastructure/bootstrap/modules/DomainModule.js#L5-L20](../../../../src/infrastructure/bootstrap/modules/DomainModule.js#L5-L20)
[^2]: `DualityManager` and `DialogManager` registrations with resolved dependencies [src/infrastructure/bootstrap/modules/DomainModule.js#L22-L44](../../../../src/infrastructure/bootstrap/modules/DomainModule.js#L22-L44); [`DualityManager`](../../../core/sequence/DualityManager.md); [`DialogManager`](../../../core/dialog/DialogManager.md)
