---
domains: []
emits: []
implements:
  - ILogging
imports:
  - src/runtime-diagnostics/ports/logging-port.js
listens: []
owns: []
schemaVersion: 1
source: src/runtime-diagnostics/null-logger.js
used_by:
  - src/localization/browser/language-adapter.js
  - src/app-shell/controls/button-state-service.js
  - src/app-shell/controls/button-visibility-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/narrative-runtime/effects/effects-manager.js
  - src/reactions/application/reaction-finale-service.js
  - src/media/audio/sound-service.js
  - src/narrative-runtime/dsl/compiler.js
  - src/runtime-events/domain/event.js
  - src/quests/domain/quest.js
  - src/narrative-runtime/sequence/duality-manager.js
  - src/narrative-runtime/sequence/stage.js
  - src/app-shell/bootstrap/boot-manager.js
  - src/runtime-events/subscriptions/observer.js
source_exists: true
runtime_role: NullLogger
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# NullLogger

Provides a no-op implementation of the logging port so core classes can safely emit log calls without depending on infrastructure adapters.[^1] The class satisfies the `ILogging` contract while intentionally leaving every lifecycle and level method empty, making it ideal for tests and default parameters.[^2]

NullLogger is injected across the stack—for example `Event`, `Quest`, `DualityManager`, `Stage`, `LanguageAdapter`, and shared services like `ButtonStateService`—ensuring optional loggers do not require additional guards before invoking `info`, `warn`, or `error`.[^3][^4][^5][^6][^7]

[^1]: [src/runtime-diagnostics/null-logger.js#L1-L15](../../../../proto-dev/src/runtime-diagnostics/null-logger.js)

[^2]: `ILogging` contract [src/runtime-diagnostics/ports/logging-port.js#L1-L47](../../../../proto-dev/src/runtime-diagnostics/ports/logging-port.js)

[^3]: Event default logger [src/runtime-events/domain/event.js#L8-L27](../../../../proto-dev/src/runtime-events/domain/event.js)

[^4]: Quest default logger [src/quests/domain/quest.js#L8-L33](../../../../proto-dev/src/quests/domain/quest.js)

[^5]: DualityManager default logger [src/narrative-runtime/sequence/duality-manager.js#L10-L32](../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js)

[^6]: Stage default logger [src/narrative-runtime/sequence/stage.js#L5-L32](../../../../proto-dev/src/narrative-runtime/sequence/stage.js)

[^7]: Application services leveraging NullLogger [src/localization/browser/language-adapter.js#L6-L81](../../../../proto-dev/src/localization/browser/language-adapter.js); [src/app-shell/controls/button-state-service.js#L6-L61](../../../../proto-dev/src/app-shell/controls/button-state-service.js)
