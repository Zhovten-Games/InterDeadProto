---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/config/button-state.config.js
used_by:
  - src/application/services/StateService.js
---

# Button State Configuration

This mapping controls when UI actions become clickable on each screen. Rules are keyed by screen and action, each rule evaluating conditions such as `profileReady` or `afterCapture`[^1]. The `StateService` loads this file and merges ghost-specific overrides from `spirits/*` configs to evaluate `isButtonEnabled` at runtime[^2]. Actions referenced here correspond to control definitions in `controls.config.js`, keeping state logic and rendered buttons aligned[^3].
Recent log tasks added default enablement for language change and profile import on early screens and aligned action names[^4].

[^1]: [`button-state.config.js`](../../src/config/button-state.config.js#L1-L22)
[^2]: [`StateService.js`](../../src/application/services/StateService.js#L18-L33)
[^3]: [`controls.config.js`](../../src/config/controls.config.js#L1-L41)
[^4]: Button rule tasks in [`doc/log.md`](../../../doc/log.md#L1586-L1657)
