---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/app-shell/controls/button-state-config.js
used_by:
  - src/app-shell/state/application-state-service.js
source_exists: true
runtime_role: button-state-config
contour_primary: HIPPO-INDEX
contour_secondary: none
role_group: memory_narrative
narrative_role: context memory index
---

# Button State Configuration

This mapping controls when UI actions become clickable on each screen. Rules are keyed by screen and action, each rule evaluating conditions such as `profileReady` or `afterCapture`[^1]. The `StateService` loads this file and merges ghost-specific overrides from `spirits/*` configs to evaluate `isButtonEnabled` at runtime[^2]. Actions referenced here correspond to control definitions in `controls.config.js`, keeping state logic and rendered buttons aligned[^3].
Recent log tasks added default enablement for language change and profile import on early screens and aligned action names[^4].

[^1]: [`button-state.config.js`](../../../../../proto-dev/src/app-shell/controls/button-state-config.js)

[^2]: [`StateService.js`](../../../../../proto-dev/src/app-shell/state/application-state-service.js)

[^3]: [`controls.config.js`](../../../../../proto-dev/src/app-shell/controls/controls-config.js)

[^4]: Button rule tasks in `doc/log.md` (историческая ссылка отсутствует в baseline; не используется как evidence)
