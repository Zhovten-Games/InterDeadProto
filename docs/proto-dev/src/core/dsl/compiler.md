---
domains: []
emits: []
implements: []
imports:
  - src/core/dsl/schema.js
  - src/core/logging/NullLogger.js
listens: []
owns: []
schemaVersion: 1
source: src/core/dsl/compiler.js
used_by: []
---

# compiler.js

Transforms a spirit configuration object into a flat list of DSL steps while routing validation failures through an injected logger that defaults to `NullLogger`.[^1] Invalid config objects or non-array message collections emit descriptive errors instead of throwing, allowing partial configurations to be skipped safely.[^2]

The compiler delegates step creation to the schema factories, inserting `awaitUser`, `say`, `quest`, or `overlay` steps based on stage content. Auto‑generated user replies skip `awaitUser` steps so the engine can emit scripted replies without blocking for manual input. Unlock directives append a final `UnlockStep` when present on the spirit config.[^3]

[^1]: Logger injection and config validation [src/core/dsl/compiler.js#L1-L24](../../../src/core/dsl/compiler.js#L1-L24); [docs/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^2]: Stage/message validation, auto‑generated handling, and quest flow [src/core/dsl/compiler.js#L18-L40](../../../src/core/dsl/compiler.js#L18-L40)
[^3]: Unlock handling [src/core/dsl/compiler.js#L42-L47](../../../src/core/dsl/compiler.js#L42-L47); step factories [src/core/dsl/schema.js#L1-L120](../../../src/core/dsl/schema.js#L1-L120)
