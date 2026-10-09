---
domains: []
emits: []
implements: []
imports:
  - src/app-shell/bootstrap/application-bootstrap.js
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/bootstrap/index.js
used_by: []
source_exists: true
runtime_role: index
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# Bootstrap Index

`index.js` now delegates container composition to [`composeApplication`](../composition/compose-application.md), receiving the fully wired container, boot manager, and event bus in a single call so the entrypoint can focus on lifecycle coordination instead of manual registrations.[^1]

A `beforeunload` guard disposes every booted service through `BootManager` when the browser closes, while the infrastructure logger and loader view are explicitly booted ahead of the guarded asynchronous loader sequence.[^2]

The loader defers rendering until all modules finish booting, toggles messenger-related buttons off by default, and starts reset, presenter, view service, and view adapter lifecycles before reconciling persisted registration state with the database.[^3]

On launch the entrypoint restores user identity from persistence, falls back to a database lookup when keys are missing, and emits the appropriate `SCREEN_CHANGE` event—either resuming messenger, forcing re-registration, or showing the welcome screen—while logging boot failures for diagnostics.[^4]

[^1]: Delegating to `composeApplication` and destructuring the bootstrap tuple [src/app-shell/bootstrap/index.js#L1-L4](../../../../../proto-dev/src/app-shell/bootstrap/index.js); [`composeApplication`](../composition/compose-application.md)

[^2]: Window unload disposal and early logger/loader boot [src/app-shell/bootstrap/index.js#L5-L16](../../../../../proto-dev/src/app-shell/bootstrap/index.js); [`BootManager`](boot-manager.md)

[^3]: Loader-managed boot sequence, button defaults, and service boot order [src/app-shell/bootstrap/index.js#L14-L24](../../../../../proto-dev/src/app-shell/bootstrap/index.js)

[^4]: Persistence/database reconciliation, state recovery, screen routing, and failure logging [src/app-shell/bootstrap/index.js#L25-L60](../../../../../proto-dev/src/app-shell/bootstrap/index.js); [`Loader`](loader.md)
