---
domains: []
emits:
  - BUTTON_ACTION
implements: []
imports: []
listens:
  - BUTTONS_RENDER
owns:
  - _booted
  - _handler
  - bus
  - languageManager
schemaVersion: 1
source: src/app-shell/controls/button-adapter.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: ButtonAdapter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ButtonAdapter

Listens for `BUTTONS_RENDER` events and injects button markup into a target container before applying translations from the language manager[^1]. Each rendered button emits a `BUTTON_ACTION` event on the shared bus when interacted with, enabling decoupled UI actions[^2][^3].

[^1]: [`ButtonAdapter.js`](../../../../../proto-dev/src/app-shell/controls/button-adapter.js)

[^2]: [`ButtonAdapter.js`](../../../../../proto-dev/src/app-shell/controls/button-adapter.js)

[^3]: [`EventBusAdapter.js`](../../../../../proto-dev/src/runtime-events/adapters/event-bus-adapter.js)
