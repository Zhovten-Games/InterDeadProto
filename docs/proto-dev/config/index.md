---
domains: []
emits: []
implements: []
imports:
  - src/config/default.config.js
listens: []
owns: []
schemaVersion: 1
source: src/config/index.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
  - src/presentation/widgets/ChatScrollWidget.js
  - src/presentation/widgets/Dialog/index.js
---

# Configuration Entry Point

`index.js` assembles the runtime configuration. It imports defaults and loads spirit modules dynamically depending on the environment (Node filesystem, bundler glob, or explicit browser imports)[^1]. The active spirit is chosen from environment variables, falling back to the `defaultGhost` specified in `default.config.js`[^2]. The selected spirit's configuration is merged with the defaults, and all spirit configs are exported for consumers like the bootstrap process[^3][^4].

[^1]: [`config/index.js`](../../src/config/index.js#L1-L33)
[^2]: [`config/index.js`](../../src/config/index.js#L35-L39) and [`default.config.js`](../../src/config/default.config.js#L5-L6)
[^3]: [`config/index.js`](../../src/config/index.js#L41-L45)
[^4]: [`bootstrap/index.js`](../../src/infrastructure/bootstrap/index.js#L5)
