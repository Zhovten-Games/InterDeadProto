---
domains: []
emits: []
implements: []
imports:
  - src/application/services/AvatarService.js
  - src/application/services/ButtonService.js
  - src/application/services/ButtonStateService.js
  - src/application/services/ButtonVisibilityService.js
  - src/application/services/CameraOrchestratorService.js
  - src/application/services/ChatScrollService.js
  - src/application/services/DialogHistoryBuffer.js
  - src/application/services/DialogHistoryObserverService.js
  - src/application/services/DialogHistoryService.js
  - src/application/services/DialogInputGateService.js
  - src/application/services/DialogOrchestratorService.js
  - src/application/services/DrumLayoutService.js
  - src/application/services/DualityConfigService.js
  - src/application/services/EffectsManager.js
  - src/application/services/GhostService.js
  - src/application/services/GhostSwitchService.js
  - src/application/services/ImageComposerService.js
  - src/application/services/ItemOverlayService.js
  - src/application/services/ModalService.js
  - src/application/services/PostsService.js
  - src/application/services/ProfileRegistrationService.js
  - src/application/services/ProfileTransferService.js
  - src/application/services/ReactionFinaleService.js
  - src/application/services/ReactionMappingService.js
  - src/application/services/ReactionPersistenceService.js
  - src/application/services/ResetService.js
  - src/application/services/ScreenService.js
  - src/application/services/StateService.js
  - src/application/services/ViewService.js
  - src/infrastructure/repositories/DialogRepository.js
  - src/infrastructure/repositories/MediaRepository.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/modules/ApplicationModule.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# ApplicationModule

`ApplicationModule` registers orchestration services that sit between raw adapters and presentation widgets. It resolves configuration, persistence, dialog, and logging dependencies from the container so higher layers receive ready-to-use coordinators while remaining coupled only to ports such as `IConfigLoader`, `ICanvasFactory`, and `IEventBus`.[^1]

Key responsibilities include:

- Provisioning duality, profile, ghost, dialog, screen, and button services, ensuring repositories initialise their schema and UI state machines share the event bus, persistence, and logging contracts.[^2]
- Wiring camera capture, media composition, and overlay helpers so camera orchestration can coordinate adapters, overlays, avatars, and item detection with consistent logging.[^3]
- Installing reaction and dialog history utilities—buffer, persistence, finale, orchestrator, scroll, and observers—tying them to duality and ghost services to maintain narrative continuity.[^4]
- Bootstrapping reset, profile transfer, effects, dialog input gating, and the composite view service, which aggregates template, panel, notification, camera, and persistence dependencies for screen rendering.[^5]

[^1]: Module context and registration entry point [`ApplicationModule.js`](../../../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L33-L48)
[^2]: Registrations for duality config, profile, ghost, dialog, screen, and button services [`ApplicationModule.js`](../../../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L50-L168); [`DialogRepository`](../../../repositories/DialogRepository.md)
[^3]: Camera orchestration, overlays, composer, and media repository wiring [`ApplicationModule.js`](../../../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L170-L204)
[^4]: Reaction mapping, persistence, finale, orchestrator, chat scroll, and history observers [`ApplicationModule.js`](../../../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L207-L293); [`ReactionOverlayWidget`](../../../presentation/widgets/ReactionOverlayWidget.md)
[^5]: Reset, profile transfer, effects manager, dialog input gate, and view service aggregation [`ApplicationModule.js`](../../../../src/infrastructure/bootstrap/modules/ApplicationModule.js#L295-L374); [`ViewService`](../../../application/services/ViewService.md)
