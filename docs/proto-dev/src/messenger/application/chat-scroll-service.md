---
domains: []
emits: []
implements:
  - ChatScrollWidget
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/messenger/presentation/chat-scroll-widget.js
listens: []
owns: []
schemaVersion: 1
source: src/messenger/application/chat-scroll-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ChatScrollService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ChatScrollService

Provides scroll controls for the chat container by extending `ChatScrollWidget`. Booting the service delegates to the widget so all scrolling logic remains centralized, while the constructor accepts an injected event bus (defaulting to `NullEventBus`) so scroll controls can respond to shared UI signals without depending on globals[^1][^2]. It is typically used alongside the dialog widget to allow users to navigate long conversations[^3].

[^1]: [src/messenger/application/chat-scroll-service.js](../../../../../proto-dev/src/messenger/application/chat-scroll-service.js)

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: [src/messenger/presentation/chat-scroll-widget.js](../../../../../proto-dev/src/messenger/presentation/chat-scroll-widget.js)
