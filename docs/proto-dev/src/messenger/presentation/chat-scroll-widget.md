---
domains: []
emits:
  - CHAT_LOAD_OLDER
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/app-shell/composition/configuration-index.js
listens:
  - CHAT_SCROLL_DOWN
  - CHAT_SCROLL_UP
owns:
  - _container
  - _handler
  - _observer
  - _screenHandler
  - _scrollListener
  - bus
  - selector
  - step
schemaVersion: 1
source: src/messenger/presentation/chat-scroll-widget.js
used_by:
  - src/messenger/application/chat-scroll-service.js
source_exists: true
runtime_role: ChatScrollWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# ChatScrollWidget

Provides scroll handling for the messenger dialog by reacting to event bus scroll events and mouse interaction. The constructor accepts an injected bus (defaulting to `NullEventBus`) so tests can reuse the widget without infrastructure wiring.[^1][^2] It subscribes to `SCREEN_CHANGE` to lazily bind the current scroll container when the messenger screen becomes active and automatically requests older messages when the user reaches the top.[^3]

[^1]: Widget construction and bus default [src/messenger/presentation/chat-scroll-widget.js#L1-L35](../../../../../proto-dev/src/messenger/presentation/chat-scroll-widget.js)

[^2]: [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Scroll bindings and `CHAT_LOAD_OLDER` emission [src/messenger/presentation/chat-scroll-widget.js#L53-L102](../../../../../proto-dev/src/messenger/presentation/chat-scroll-widget.js)
