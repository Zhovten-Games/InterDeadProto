---
domains: []
emits: []
implements: []
imports:
  - src/ports/ILogging.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/Logger.js
used_by:
  - src/infrastructure/bootstrap/Loader.js
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# Logger

Logger provides a simple level-based logging service implementing the `ILogging` port[^1][^2]. Supported levels (`debug`, `info`, `warn`, `error`) are mapped to numeric priorities to allow runtime filtering[^3]. Each call produces a timestamped message routed to the corresponding console method[^4].

The logger is registered in the bootstrap container so that other services can depend on a standardized logging interface[^5].

[^1]: `ILogging` interface definition [src/ports/ILogging.js#L1](../../../src/ports/ILogging.js#L1)
[^2]: `Logger` extends the interface and stores the chosen level [src/infrastructure/bootstrap/Logger.js#L1-L9](../../../src/infrastructure/bootstrap/Logger.js#L1-L9)
[^3]: Level mapping and filter [src/infrastructure/bootstrap/Logger.js#L3-L13](../../../src/infrastructure/bootstrap/Logger.js#L3-L13)
[^4]: Formatted output methods [src/infrastructure/bootstrap/Logger.js#L15-L42](../../../src/infrastructure/bootstrap/Logger.js#L15-L42)
[^5]: Logger registration in bootstrap container [src/infrastructure/bootstrap/index.js#L60-L61](../../../src/infrastructure/bootstrap/index.js#L60-L61)
