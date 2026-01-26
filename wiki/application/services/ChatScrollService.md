---
domains: []
emits: []
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/presentation/widgets/ChatScrollWidget.js
listens: []
owns: []
schemaVersion: 1
source: src/application/services/ChatScrollService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ChatScrollService

Provides scroll controls for the chat container by extending `ChatScrollWidget`. Booting the service delegates to the widget so all scrolling logic remains centralized, while the constructor accepts an injected event bus (defaulting to `NullEventBus`) so scroll controls can respond to shared UI signals without depending on globals[^1][^2]. It is typically used alongside the dialog widget to allow users to navigate long conversations[^3].

[^1]: [src/application/services/ChatScrollService.js](../../src/application/services/ChatScrollService.js#L1-L22)
[^2]: [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: [src/presentation/widgets/ChatScrollWidget.js](../../src/presentation/widgets/ChatScrollWidget.js#L1-L107)
