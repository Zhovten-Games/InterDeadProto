---
domains: []
emits:
  - CHAT_LOAD_OLDER
implements: []
imports:
  - src/config/index.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - CHAT_SCROLL_DOWN
  - CHAT_SCROLL_UP
  - SCREEN_CHANGE
owns: []
schemaVersion: 1
source: src/presentation/widgets/ChatScrollWidget.js
used_by:
  - src/application/services/ChatScrollService.js
---

# ChatScrollWidget

Provides scroll handling for the messenger dialog by reacting to event bus scroll events and mouse interaction. The constructor accepts an injected bus (defaulting to `NullEventBus`) so tests can reuse the widget without infrastructure wiring.[^1][^2] It subscribes to `SCREEN_CHANGE` to lazily bind the current scroll container when the messenger screen becomes active and automatically requests older messages when the user reaches the top.[^3]

[^1]: Widget construction and bus default [src/presentation/widgets/ChatScrollWidget.js#L1-L35](../../../src/presentation/widgets/ChatScrollWidget.js#L1-L35)
[^2]: [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Scroll bindings and `CHAT_LOAD_OLDER` emission [src/presentation/widgets/ChatScrollWidget.js#L53-L102](../../../src/presentation/widgets/ChatScrollWidget.js#L53-L102)
