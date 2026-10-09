---
domains: []
emits: []
implements: []
imports:
  - src/app-shell/configuration/default-config.js
  - src/spirit-contacts/configuration/guide.js
  - src/spirit-contacts/configuration/guest1.js
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/composition/configuration-index.js
used_by:
  - src/app-shell/state/application-state-service.js
  - src/app-shell/controls/controls-config.js
  - src/app-shell/composition/compose-application.js
  - src/messenger/presentation/chat-scroll-widget.js
  - src/messenger/presentation/dialog-widget.js
source_exists: true
runtime_role: spiritConfigs
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Configuration Entry Point

`index.js` assembles the runtime configuration. It imports defaults and loads spirit modules dynamically depending on the environment (Node filesystem, bundler glob, or explicit browser imports)[^1]. The active spirit is chosen from environment variables, falling back to the `defaultGhost` specified in `default.config.js`[^2]. The selected spirit's configuration is merged with the defaults, and all spirit configs are exported for consumers like the bootstrap process[^3][^4].

[^1]: [`config/index.js`](../../../../../proto-dev/src/app-shell/composition/configuration-index.js)

[^2]: [`config/index.js`](../../../../../proto-dev/src/app-shell/composition/configuration-index.js) and [`default.config.js`](../../../../../proto-dev/src/app-shell/configuration/default-config.js)

[^3]: [`config/index.js`](../../../../../proto-dev/src/app-shell/composition/configuration-index.js)

[^4]: [`bootstrap/index.js`](../../../../../proto-dev/src/app-shell/bootstrap/index.js)
