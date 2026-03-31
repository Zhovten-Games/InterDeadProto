---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/LauncherBootstrapper.js
used_by: 
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
source_exists: true
runtime_role: launcher_bootstrapper_bootstrap
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: "executive coordination hub"
---

# LauncherBootstrapper

Initializes the lightweight launcher experience. It boots logging, language services, and the `ChatLauncherService`, then triggers the AI warmup service so the loader is ready if the embedded app launches.[^1]

A `beforeunload` handler disposes the launcher to clean up listeners when the host page is closed.[^2]

[^1]: Launcher boot sequence [src/infrastructure/bootstrap/LauncherBootstrapper.js#L7-L13](../../../src/infrastructure/bootstrap/LauncherBootstrapper.js#L7-L13)
[^2]: Cleanup on unload [src/infrastructure/bootstrap/LauncherBootstrapper.js#L14-L16](../../../src/infrastructure/bootstrap/LauncherBootstrapper.js#L14-L16)
