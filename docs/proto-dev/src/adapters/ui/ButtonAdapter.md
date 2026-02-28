---
domains: []
emits:
  - BUTTON_ACTION
implements: []
imports: []
listens:
  - BUTTONS_RENDER
owns: []
schemaVersion: 1
source: src/adapters/ui/ButtonAdapter.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# ButtonAdapter

Listens for `BUTTONS_RENDER` events and injects button markup into a target container before applying translations from the language manager[^1]. Each rendered button emits a `BUTTON_ACTION` event on the shared bus when interacted with, enabling decoupled UI actions[^2][^3].

[^1]: [`ButtonAdapter.js`](../../../src/adapters/ui/ButtonAdapter.js#L1-L21)
[^2]: [`ButtonAdapter.js`](../../../src/adapters/ui/ButtonAdapter.js#L22-L33)
[^3]: [`EventBusAdapter.js`](../../../src/adapters/logging/EventBusAdapter.js#L1-L6)

