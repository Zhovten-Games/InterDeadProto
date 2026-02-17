---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: proto-dev/src/application/services/GhostRebootCheckpointService.js
used_by:
  - proto-dev/src/application/services/DialogOrchestratorService.js
  - proto-dev/src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# GhostRebootCheckpointService

Persistence-backed store for per-ghost reboot checkpoints. A checkpoint keeps a stable history snapshot so reboot can restore a consistent completed boundary for a selected ghost.[^1]

The service clones stored history on save/read, supports per-ghost cleanup (`clearGhost`) and global cleanup (`reset`), and writes through a configurable persistence port key (`ghostRebootCheckpoints` by default).[^1]

[^1]: Service API and persistence contract [proto-dev/src/application/services/GhostRebootCheckpointService.js#L1-L56](../../../../proto-dev/src/application/services/GhostRebootCheckpointService.js#L1-L56)
