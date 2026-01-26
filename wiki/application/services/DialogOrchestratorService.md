---
domains: []
emits:
  - DIALOG_CLEAR
  - EVENT_MESSAGE_READY
implements: []
imports:
  - src/application/services/DialogHistoryBuffer.js
  - src/config/flags.js
  - src/core/engine/actions.js
  - src/core/engine/effects.js
  - src/core/engine/store.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
  - src/utils/messageFingerprint.js
listens:
  - DIALOG_WIDGET_READY
  - DUALITY_COMPLETED
  - DUALITY_STAGE_STARTED
  - EVENT_MESSAGE_READY
  - GHOST_CHANGE
  - QUEST_STARTED
  - SCREEN_CHANGE
  - USER_PROFILE_SAVED
  - post
owns: []
schemaVersion: 1
source: src/application/services/DialogOrchestratorService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# DialogOrchestratorService

Central coordinator for ghost dialogs. It loads spirit configurations, initializes supporting services, and progresses dialog scenes once the UI widget reports readiness while relaying events through an injected bus (`NullEventBus` fallback) to coordinate with other UI widgets.[^1][^2] `NullLogger` is used as the default so configuration and avatar issues can be reported without binding to infrastructure loggers.[^3]

The orchestrator collaborates with `DualityManager`, `DialogManager`, history and avatar services to enrich stages with fingerprints, avatars, and replay metadata before progression. Buffered history is normalized and merged so restored sessions keep chronological ids and avoid duplicates.[^3][^4] Input advancement funnels through `DialogInputGateService`, while posting is locked until the next `EVENT_MESSAGE_READY` to prevent duplicate submissions; pending posts captured before the widget boots are replayed after readiness.[^5]

Ghost/screen transitions clear buffers, persist history, and reload dialogs—logging missing dialog definitions and resetting capture visibility. Avatar refreshes emit replay events for updated user images once profiles change.[^6][^7] Completion is coordinated with `DualityManager`, ensuring quests advance and finale guards (such as `ReactionFinaleService`) can defer completion.[^8]

[^1]: Constructor wiring, widget readiness, boot orchestration, and bus injection [src/application/services/DialogOrchestratorService.js#L27-L236](../../src/application/services/DialogOrchestratorService.js#L27-L236); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^2]: Event coordination with other services (history observer, finale, overlays) [src/application/services/DialogOrchestratorService.js#L238-L575](../../src/application/services/DialogOrchestratorService.js#L238-L575)
[^3]: Logger default and configuration warnings [src/application/services/DialogOrchestratorService.js#L61-L70](../../src/application/services/DialogOrchestratorService.js#L61-L70); missing dialog logging [src/application/services/DialogOrchestratorService.js#L420-L422](../../src/application/services/DialogOrchestratorService.js#L420-L422); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^3]: Message enrichment and fingerprinting [src/application/services/DialogOrchestratorService.js#L101-L198](../../src/application/services/DialogOrchestratorService.js#L101-L198)
[^4]: History normalization and replay [src/application/services/DialogOrchestratorService.js#L200-L312](../../src/application/services/DialogOrchestratorService.js#L200-L312)
[^5]: Input gate coordination, posting lock, and pending replay [src/application/services/DialogOrchestratorService.js#L314-L515](../../src/application/services/DialogOrchestratorService.js#L314-L515); [src/application/services/DialogInputGateService.js#L24-L69](../../src/application/services/DialogInputGateService.js#L24-L69)
[^6]: Ghost and screen transitions [src/application/services/DialogOrchestratorService.js#L402-L493](../../src/application/services/DialogOrchestratorService.js#L402-L493)
[^7]: Avatar refresh logging [src/application/services/DialogOrchestratorService.js#L232-L274](../../src/application/services/DialogOrchestratorService.js#L232-L274); profile save handling [src/application/services/DialogOrchestratorService.js#L367-L392](../../src/application/services/DialogOrchestratorService.js#L367-L392)
[^8]: Quest completion hooks and duality coordination [src/application/services/DialogOrchestratorService.js#L515-L575](../../src/application/services/DialogOrchestratorService.js#L515-L575); interaction with `ReactionFinaleService` [src/application/services/ReactionFinaleService.js#L21-L118](../../src/application/services/ReactionFinaleService.js#L21-L118)
