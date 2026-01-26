---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/container/Container.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# Container

The container is a lightweight dependency injection utility that stores factories along with optional priority and dependency metadata[^1]. Instances are created lazily when `resolve` is called, allowing services to reference each other without eagerly constructing every object[^2]. BootManager relies on `getRegistrations` to obtain all registered services and orchestrate their startup[^3].

[^1]: Registration with priority and dependency metadata [src/infrastructure/container/Container.js#L6-L10](../../../src/infrastructure/container/Container.js#L6-L10)
[^2]: Lazy resolution of instances [src/infrastructure/container/Container.js#L12-L21](../../../src/infrastructure/container/Container.js#L12-L21)
[^3]: `getRegistrations` supplies BootManager with boot metadata [src/infrastructure/container/Container.js#L23-L24](../../../src/infrastructure/container/Container.js#L23-L24) and its usage in BootManager [src/infrastructure/bootstrap/BootManager.js#L16-L20](../../../src/infrastructure/bootstrap/BootManager.js#L16-L20)
