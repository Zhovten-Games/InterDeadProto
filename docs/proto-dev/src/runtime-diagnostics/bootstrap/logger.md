---
domains: []
emits: []
implements:
  - ILogging
imports:
  - src/runtime-diagnostics/ports/logging-port.js
listens: []
owns:
  - booted
  - level
schemaVersion: 1
source: src/runtime-diagnostics/bootstrap/logger.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: Logger
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Logger

Logger provides a simple level-based logging service implementing the `ILogging` port[^1][^2]. Supported levels (`debug`, `info`, `warn`, `error`) are mapped to numeric priorities to allow runtime filtering[^3]. Each call produces a timestamped message routed to the corresponding console method[^4].

The logger is registered in the bootstrap container so that other services can depend on a standardized logging interface[^5].

[^1]: `ILogging` interface definition [src/runtime-diagnostics/ports/logging-port.js#L1](../../../../../proto-dev/src/runtime-diagnostics/ports/logging-port.js)

[^2]: `Logger` extends the interface and stores the chosen level [src/runtime-diagnostics/bootstrap/logger.js#L1-L9](../../../../../proto-dev/src/runtime-diagnostics/bootstrap/logger.js)

[^3]: Level mapping and filter [src/runtime-diagnostics/bootstrap/logger.js#L3-L13](../../../../../proto-dev/src/runtime-diagnostics/bootstrap/logger.js)

[^4]: Formatted output methods [src/runtime-diagnostics/bootstrap/logger.js#L15-L42](../../../../../proto-dev/src/runtime-diagnostics/bootstrap/logger.js)

[^5]: Logger registration in bootstrap container [src/app-shell/bootstrap/index.js#L60-L61](../../../../../proto-dev/src/app-shell/bootstrap/index.js)
