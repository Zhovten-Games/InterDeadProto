---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/default.config.js
used_by:
  - src/config/index.js
---

# Default Application Configuration

Defines base runtime values including log verbosity, messenger batching, scroll step, and the fallback ghost identifier.[^1] The
`textAnimation` block configures initial and replay effects for `DialogWidget`, while `reset` supplies defaults consumed by
`ResetService` when orchestrating full data wipes and rerouting to the initial screen.[^2]

[^1]: Core defaults, chat batching, and default ghost [src/config/default.config.js#L1-L8](../../src/config/default.config.js#L1-L8)
[^2]: Text animation and reset options [src/config/default.config.js#L8-L16](../../src/config/default.config.js#L8-L16); usage in reset flow [src/application/services/ResetService.js#L27-L42](../../src/application/services/ResetService.js#L27-L42)
