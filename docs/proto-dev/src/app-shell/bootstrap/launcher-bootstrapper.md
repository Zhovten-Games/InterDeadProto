---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - _bootPromise
  - _ready
  - _unload
  - bootManager
  - container
  - windowRef
schemaVersion: 1
source: src/app-shell/bootstrap/launcher-bootstrapper.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: LauncherBootstrapper
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# LauncherBootstrapper

Initializes the lightweight launcher experience. It boots logging, language services, and the `ChatLauncherService`, then triggers the AI warmup service so the loader is ready if the embedded app launches.[^1]

A `beforeunload` handler disposes the launcher to clean up listeners when the host page is closed.[^2]

[^1]: Launcher boot sequence [src/app-shell/bootstrap/launcher-bootstrapper.js#L7-L13](../../../../../proto-dev/src/app-shell/bootstrap/launcher-bootstrapper.js)

[^2]: Cleanup on unload [src/app-shell/bootstrap/launcher-bootstrapper.js#L14-L16](../../../../../proto-dev/src/app-shell/bootstrap/launcher-bootstrapper.js)
