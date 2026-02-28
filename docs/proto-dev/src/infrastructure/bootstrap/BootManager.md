---
domains: []
emits:
  - BOOT_COMPLETE
  - BOOT_STEP
implements: []
imports:
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/BootManager.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# BootManager

BootManager orchestrates startup and shutdown of services registered in the dependency container. It accepts an event bus and logger (defaulting to a lightweight no-op bus and `NullLogger`) so boot progress and failures can be surfaced without requiring infrastructure wiring during tests.[^1]

Registrations are sorted by priority and booted once dependencies have been satisfied. Each booted service that exposes `dispose` is tracked for cleanup during application shutdown, with disposal errors reported through the logger.[^2]

The manager emits progress events on the global `EventBus`, allowing the `Loader` overlay to display boot steps. It is instantiated during application bootstrap where it drives the overall boot process and uses registration metadata to resolve services in order.[^3]

[^1]: Constructor wiring container, bus fallback, and logger [src/infrastructure/bootstrap/BootManager.js#L5-L24](../../../src/infrastructure/bootstrap/BootManager.js#L5-L24); [docs/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Boot sequence, dependency resolution, and disposal logging [src/infrastructure/bootstrap/BootManager.js#L20-L58](../../../src/infrastructure/bootstrap/BootManager.js#L20-L58)
[^3]: Boot progress events and bootstrap usage [src/infrastructure/bootstrap/BootManager.js#L31-L47](../../../src/infrastructure/bootstrap/BootManager.js#L31-L47); [src/infrastructure/bootstrap/index.js#L14-L60](../../../src/infrastructure/bootstrap/index.js#L14-L60); container registrations [src/infrastructure/container/Container.js#L6-L24](../../../src/infrastructure/container/Container.js#L6-L24)
