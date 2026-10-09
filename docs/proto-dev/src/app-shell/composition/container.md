---
domains: []
emits: []
implements: []
imports: []
listens: []
owns:
  - registry
schemaVersion: 1
source: src/app-shell/composition/container.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: Container
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Container

The container is a lightweight dependency injection utility that stores factories along with optional priority and dependency metadata[^1]. Instances are created lazily when `resolve` is called, allowing services to reference each other without eagerly constructing every object[^2]. BootManager relies on `getRegistrations` to obtain all registered services and orchestrate their startup[^3].

[^1]: Registration with priority and dependency metadata [src/app-shell/composition/container.js#L6-L10](../../../../../proto-dev/src/app-shell/composition/container.js)

[^2]: Lazy resolution of instances [src/app-shell/composition/container.js#L12-L21](../../../../../proto-dev/src/app-shell/composition/container.js)

[^3]: `getRegistrations` supplies BootManager with boot metadata [src/app-shell/composition/container.js#L23-L24](../../../../../proto-dev/src/app-shell/composition/container.js) and its usage in BootManager [src/app-shell/bootstrap/boot-manager.js#L16-L20](../../../../../proto-dev/src/app-shell/bootstrap/boot-manager.js)
