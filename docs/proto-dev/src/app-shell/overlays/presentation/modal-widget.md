---
domains: []
emits:
  - MODAL_HIDE
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - MODAL_HIDE
  - MODAL_SHOW
owns:
  - _handler
  - bus
  - language
  - modal
  - root
schemaVersion: 1
source: src/app-shell/overlays/presentation/modal-widget.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: ModalWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# ModalWidget

Listens for `MODAL_SHOW` and `MODAL_HIDE` events to render or remove a global overlay, applying translations to the inserted node. The widget accepts an injected event bus (defaulting to `NullEventBus`) so tests and non-UI flows can mount it without wiring the infrastructure bus.[^1][^2]
The event types originate from the shared constants module, allowing other widgets to control the modal via the event bus[^3].

[^1]: Subscription and rendering in [Modal/index.js](/src/app-shell/overlays/presentation/modal-widget.js).

[^2]: `NullEventBus` fallback [Modal/index.js](/src/app-shell/overlays/presentation/modal-widget.js); [docs/core/events/NullEventBus.md](../../../runtime-events/domain/null-event-bus.md)

[^3]: Event constants defined in [constants.js](/src/runtime-events/domain/constants.js).
