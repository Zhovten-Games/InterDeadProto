---
domains: []
emits: []
implements: []
imports:
  - src/ports/ILogging.js
listens: []
owns: []
schemaVersion: 1
source: src/core/logging/NullLogger.js
used_by:
  - src/adapters/ui/LanguageAdapter.js
  - src/application/services/ButtonStateService.js
  - src/application/services/ButtonVisibilityService.js
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/EffectsManager.js
  - src/application/services/ReactionFinaleService.js
  - src/core/dsl/compiler.js
  - src/core/events/Event.js
  - src/core/quests/Quest.js
  - src/core/sequence/DualityManager.js
  - src/core/sequence/Stage.js
  - src/infrastructure/bootstrap/BootManager.js
  - src/presentation/widgets/PanelEffectsWidget.js
  - src/utils/Observer.js
---

# NullLogger

Provides a no-op implementation of the logging port so core classes can safely emit log calls without depending on infrastructure adapters.[^1] The class satisfies the `ILogging` contract while intentionally leaving every lifecycle and level method empty, making it ideal for tests and default parameters.[^2]

NullLogger is injected across the stack—for example `Event`, `Quest`, `DualityManager`, `Stage`, `LanguageAdapter`, and shared services like `ButtonStateService`—ensuring optional loggers do not require additional guards before invoking `info`, `warn`, or `error`.[^3][^4][^5][^6][^7]

[^1]: [src/core/logging/NullLogger.js#L1-L15](../../../src/core/logging/NullLogger.js#L1-L15)
[^2]: `ILogging` contract [src/ports/ILogging.js#L1-L47](../../../src/ports/ILogging.js#L1-L47)
[^3]: Event default logger [src/core/events/Event.js#L8-L27](../../../src/core/events/Event.js#L8-L27)
[^4]: Quest default logger [src/core/quests/Quest.js#L8-L33](../../../src/core/quests/Quest.js#L8-L33)
[^5]: DualityManager default logger [src/core/sequence/DualityManager.js#L10-L32](../../../src/core/sequence/DualityManager.js#L10-L32)
[^6]: Stage default logger [src/core/sequence/Stage.js#L5-L32](../../../src/core/sequence/Stage.js#L5-L32)
[^7]: Application services leveraging NullLogger [src/adapters/ui/LanguageAdapter.js#L6-L81](../../../src/adapters/ui/LanguageAdapter.js#L6-L81); [src/application/services/ButtonStateService.js#L6-L61](../../../src/application/services/ButtonStateService.js#L6-L61)
