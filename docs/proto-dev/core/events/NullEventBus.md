---
domains: []
emits: []
implements: []
imports:
  - src/ports/IEventBus.js
listens: []
owns: []
schemaVersion: 1
source: src/core/events/NullEventBus.js
used_by:
  - src/adapters/ai/DetectionAdapter.js
  - src/adapters/notification/NotificationAdapter.js
  - src/adapters/ui/LanguageAdapter.js
  - src/adapters/ui/PanelAdapter.js
  - src/adapters/ui/ViewAdapter.js
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/ChatScrollService.js
  - src/application/services/DialogHistoryObserverService.js
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/DrumLayoutService.js
  - src/application/services/EffectsManager.js
  - src/application/services/GhostSwitchService.js
  - src/application/services/ModalService.js
  - src/application/services/ProfileRegistrationService.js
  - src/application/services/ProfileTransferService.js
  - src/application/services/ReactionFinaleService.js
  - src/application/services/ReactionPersistenceService.js
  - src/application/services/ResetService.js
  - src/application/services/ViewService.js
  - src/presentation/adapters/GlobalViewPresenter.js
  - src/presentation/components/MediaLightbox.js
  - src/presentation/widgets/CameraStatusWidget.js
  - src/presentation/widgets/ChatScrollWidget.js
  - src/presentation/widgets/ControlPanel/index.js
  - src/presentation/widgets/Dialog/index.js
  - src/presentation/widgets/Modal/index.js
  - src/presentation/widgets/PanelEffectsWidget.js
  - src/presentation/widgets/ReactionOverlayWidget.js
  - src/presentation/widgets/StatusWidget.js
---

# NullEventBus

Null object implementation of the event bus port. It satisfies `IEventBus` while performing no operations, allowing services and adapters to opt into pub/sub semantics without requiring an actual bus during tests or offline flows.[^1][^2]

[^1]: [`NullEventBus.js`](../../../src/core/events/NullEventBus.js#L1-L11)
[^2]: [`IEventBus.js`](../../../src/ports/IEventBus.js#L1-L48)
