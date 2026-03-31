---
domains: []
emits: 
  - MODAL_HIDE
implements: []
imports: 
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens: 
  - MODAL_HIDE
  - MODAL_SHOW
owns: []
schemaVersion: 1
source: src/presentation/widgets/Modal/index.js
used_by: 
  - src/infrastructure/bootstrap/modules/PresentationModule.js
source_exists: true
runtime_role: index_widget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: "embodied feedback channel"
---

# ModalWidget

Listens for `MODAL_SHOW` and `MODAL_HIDE` events to render or remove a global overlay, applying translations to the inserted node. The widget accepts an injected event bus (defaulting to `NullEventBus`) so tests and non-UI flows can mount it without wiring the infrastructure bus.[^1][^2]
The event types originate from the shared constants module, allowing other widgets to control the modal via the event bus[^3].

[^1]: Subscription and rendering in [Modal/index.js](/src/presentation/widgets/Modal/index.js#L1-L46).
[^2]: `NullEventBus` fallback [Modal/index.js](/src/presentation/widgets/Modal/index.js#L1-L14); [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Event constants defined in [constants.js](/src/core/events/constants.js#L27-L29).
