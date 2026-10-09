---
domains: []
emits: []
implements: []
imports:
  - src/runtime-diagnostics/null-logger.js
  - src/narrative-runtime/dsl/schema.js
listens: []
owns: []
schemaVersion: 1
source: src/narrative-runtime/dsl/compiler.js
used_by: []
source_exists: true
runtime_role: compile
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# compiler.js

Transforms a spirit configuration object into a flat list of DSL steps while routing validation failures through an injected logger that defaults to `NullLogger`.[^1] Invalid config objects or non-array message collections emit descriptive errors instead of throwing, allowing partial configurations to be skipped safely.[^2]

The compiler delegates step creation to the schema factories, inserting `awaitUser`, `say`, `quest`, or `overlay` steps based on stage content. Auto‑generated user replies skip `awaitUser` steps so the engine can emit scripted replies without blocking for manual input. Unlock directives append a final `UnlockStep` when present on the spirit config.[^3]

[^1]: Logger injection and config validation [src/narrative-runtime/dsl/compiler.js#L1-L24](../../../../../proto-dev/src/narrative-runtime/dsl/compiler.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^2]: Stage/message validation, auto‑generated handling, and quest flow [src/narrative-runtime/dsl/compiler.js#L18-L40](../../../../../proto-dev/src/narrative-runtime/dsl/compiler.js)

[^3]: Unlock handling [src/narrative-runtime/dsl/compiler.js#L42-L47](../../../../../proto-dev/src/narrative-runtime/dsl/compiler.js); step factories [src/narrative-runtime/dsl/schema.js#L1-L120](../../../../../proto-dev/src/narrative-runtime/dsl/schema.js)
