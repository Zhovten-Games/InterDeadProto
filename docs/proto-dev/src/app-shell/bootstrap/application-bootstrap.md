---
schemaVersion: 1
source: src/app-shell/bootstrap/application-bootstrap.js
source_exists: true
runtime_role: ApplicationBootstrap
contour_primary: app-shell
role_group: lifecycle_owner
imports:
  - src/host-integration/framework/framework-bridge.js
  - src/app-shell/composition/compose-application.js
implements: []
owns:
  - _startPromise
  - _unload
  - bootstrapper
  - bridge
  - bridgeFactory
  - compose
  - context
  - documentRef
  - generation
  - ready
  - windowRef
listens: []
emits: []
used_by:
  - src/app-shell/bootstrap/index.js
---

# ApplicationBootstrap

`start()` coalesces concurrent calls for one generation and chooses the full or
launcher bootstrapper through the registered embedding resolver. It owns one
framework bridge and its unload listener. The selected bootstrapper delegates
service ordering and reverse rollback to BootManager. `dispose()` invalidates
pending startup, releases the bridge/listener and delegates cleanup. A later
explicit lifecycle cycle may start again.

Constructor ports: `compose`, `windowRef`, `documentRef`, `bridgeFactory`. They are
composition dependencies, without a production debug-command interface.
Verification: the entry lifecycle unit family, IDP-WH-BOOT-001 and assembled
browser startup. Fresh, partial-registration and returning profiles remain
separate public restore flows.
