---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-diagnostics/ports/logging-port.js
used_by:
  - src/runtime-diagnostics/adapters/logging-adapter.js
  - src/runtime-diagnostics/null-logger.js
  - src/runtime-diagnostics/bootstrap/logger.js
source_exists: true
runtime_role: ILogging
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ILogging Port

Captures diagnostic information and errors generated throughout the application.[^1] Logging implementations may also forward events over the central event bus for observation.[^3]

## Relations

- Import test verifies the interface exists.[^2]
- Can integrate with `IEventBus` to emit log events.[^3]
- Aligns with repository port-naming conventions.[^4]

[^1]: [src/runtime-diagnostics/ports/logging-port.js](../../../../../proto-dev/src/runtime-diagnostics/ports/logging-port.js)

[^2]: [tests/ports/testILogging.test.js](../../../../../proto-dev/tests/runtime-diagnostics/test-i-logging.test.js)

[^3]: [src/runtime-events/ports/event-bus-port.js](../../../../../proto-dev/src/runtime-events/ports/event-bus-port.js)

[^4]: [README.md](../../../../../proto-dev/README.md)
