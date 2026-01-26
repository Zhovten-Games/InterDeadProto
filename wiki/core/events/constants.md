---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/core/events/constants.js
used_by:
  - src/adapters/notification/NotificationAdapter.js
  - src/adapters/ui/PanelAdapter.js
  - src/adapters/ui/ViewAdapter.js
  - src/application/services/ButtonService.js
  - src/application/services/ButtonStateService.js
  - src/application/services/ButtonVisibilityService.js
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/DialogHistoryObserverService.js
  - src/application/services/DialogInputGateService.js
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/DrumLayoutService.js
  - src/application/services/EffectsManager.js
  - src/application/services/ModalService.js
  - src/application/services/ProfileRegistrationService.js
  - src/application/services/ProfileTransferService.js
  - src/application/services/ReactionFinaleService.js
  - src/application/services/ReactionPersistenceService.js
  - src/application/services/ResetService.js
  - src/application/services/ViewService.js
  - src/core/dialog/DialogManager.js
  - src/core/events/Event.js
  - src/core/quests/Quest.js
  - src/core/sequence/DualityManager.js
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

# constants.js

Central registry for event identifiers shared across services, presenters, and widgets.[^1] Alongside quest and dialog
lifecycles it now defines view orchestration (`VIEW_RENDER_REQUESTED`, `VIEW_CAMERA_RENDER_REQUESTED`), messenger hydration
(`MESSENGER_POSTS_READY`), geo and camera preview updates, global reset notifications, and profile transfer/effect management
signals so UI layers can stay decoupled from business services.[^2]

Recent additions power the emoji reaction flow (`REACTION_REMINDER_READY`, `REACTION_OVERLAY_REQUESTED`, `REACTION_SELECTED`),
drum customization (`DRUM_LAYOUT_UPDATED`), settings entry points, and manual chat scrolling (`CHAT_SCROLL_UP/DOWN`,
`CHAT_LOAD_OLDER`).[^3]

`ALL_EVENTS` freezes the catalog for validation and tooling, ensuring new signals participate in subscription whitelists.[^4]

[^1]: Exported constants [src/core/events/constants.js#L1-L55](../../../src/core/events/constants.js#L1-L55)
[^2]: UI, effect, reset, and profile events exposed to presenters [src/core/events/constants.js#L12-L46](../../../src/core/events/constants.js#L12-L46)
[^3]: Reaction, drum, settings, and scroll events [src/core/events/constants.js#L38-L55](../../../src/core/events/constants.js#L38-L55)
[^4]: Aggregated immutable list [src/core/events/constants.js#L57-L110](../../../src/core/events/constants.js#L57-L110)
