---
domains: []
emits: []
implements: []
imports:
  - proto-dev/src/application/services/GhostRebootCheckpointService.js
  - proto-dev/src/application/services/DialogOrchestratorService.js
  - proto-dev/src/application/services/ChatLauncherService.js
  - proto-dev/src/application/services/AiWarmupService.js
listens: []
owns:
  - GhostRebootCheckpointService
  - DialogOrchestratorService
schemaVersion: 1
source: proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js
used_by:
  - proto-dev/src/infrastructure/bootstrap/Bootstrap.js
---

# ApplicationModule

Registers application-level services in the DI container, including auth/login helpers, chat launcher visibility, AI warmup, dialog orchestration, camera/reaction services, and reset/profile transfer orchestration.[^1]

Updated wiring includes `GhostRebootCheckpointService` and injection into `DialogOrchestratorService`, enabling ghost reboot checkpoint persistence as part of the runtime composition root.[^2]

[^1]: Service registration map [proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js#L1-L520](../../../../../proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js#L1-L520)
[^2]: Reboot checkpoint registration and orchestrator dependency binding [proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js#L300-L520](../../../../../proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js#L300-L520)
