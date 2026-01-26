---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/ports/ILogging.js
used_by:
  - src/adapters/logging/LoggingAdapter.js
  - src/core/logging/NullLogger.js
  - src/infrastructure/bootstrap/Logger.js
---

# ILogging Port

Captures diagnostic information and errors generated throughout the application.[^1] Logging implementations may also forward events over the central event bus for observation.[^3]

## Relations
- Import test verifies the interface exists.[^2]
- Can integrate with `IEventBus` to emit log events.[^3]
- Aligns with repository port-naming conventions.[^4]

[^1]: [src/ports/ILogging.js](../../src/ports/ILogging.js#L1)
[^2]: [tests/ports/testILogging.test.js](../../tests/ports/testILogging.test.js#L3-L14)
[^3]: [src/ports/IEventBus.js](../../src/ports/IEventBus.js#L1)
[^4]: [README.md](../../README.md#L23-L24)
