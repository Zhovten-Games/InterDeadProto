---
domains: []
emits:
  - log
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _handler
  - bus
  - container
  - selector
schemaVersion: 1
source: src/app-shell/presentation/status-widget.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: StatusWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# StatusWidget

Displays transient status messages by subscribing to `STATUS_SHOW` events over an injected bus (`NullEventBus` fallback) and updating a dedicated container in the DOM[^1][^2]. If no container exists it is created on demand, and each update is logged for diagnostics[^3].

[^1]: Event handling and bus default in [StatusWidget.js](/src/app-shell/presentation/status-widget.js).

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Container resolution and logging in [StatusWidget.js](/src/app-shell/presentation/status-widget.js) and logging task (`doc/log.md` (историческая ссылка отсутствует в baseline; не используется как evidence)).
