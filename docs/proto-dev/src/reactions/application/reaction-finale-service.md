---
domains: []
emits:
  - REACTION_FINALE_STATE_UPDATED
implements: []
imports:
  - src/runtime-diagnostics/null-logger.js
  - src/runtime-events/domain/null-event-bus.js
  - src/reactions/configuration/reaction-finale-config.js
  - src/runtime-events/domain/constants.js
listens:
  - DIALOG_CLEAR
  - DUALITY_COMPLETED
  - EVENT_MESSAGE_READY
  - REACTION_FINALE_RECALCULATE_REQUESTED
  - REACTION_SELECTED
owns:
  - _finaleMessages
  - _handler
  - _messageStage
  - _pendingCompletion
  - _requirements
  - _stageProgress
  - bus
  - config
  - dualityManager
  - ghostService
  - logger
  - spiritConfigs
schemaVersion: 1
source: src/reactions/application/reaction-finale-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: ReactionFinaleService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ReactionFinaleService

Guards duality completion until required reactions are collected and the finale message renders. The service registers itself as a completion guard on `DualityManager`, subscribes to dialog/reaction events through an injected bus (`NullEventBus` fallback), and tracks stage coverage per ghost.[^1][^2]

`EVENT_MESSAGE_READY` captures fingerprints and stage identifiers, marking finale messages and emitting `REACTION_FINALE_STATE_UPDATED` with pending or complete payloads. Reaction selections update stage progress; recalculation requests recompute missing stages and resume deferred completion when requirements are satisfied.[^2]

Pending completion callbacks supplied by `DualityManager` are stored and invoked once requirements are met. Errors raised during resume are logged via the injected logger, which defaults to `NullLogger`.[^3]

[^1]: Guard setup and event subscription [src/reactions/application/reaction-finale-service.js#L17-L71](../../../../../proto-dev/src/reactions/application/reaction-finale-service.js); interaction with `DualityManager` [src/narrative-runtime/sequence/duality-manager.js#L54-L118](../../../../../proto-dev/src/narrative-runtime/sequence/duality-manager.js)

[^2]: Event bus injection and default [src/reactions/application/reaction-finale-service.js#L1-L28](../../../../../proto-dev/src/reactions/application/reaction-finale-service.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Finale tracking and state emission [src/reactions/application/reaction-finale-service.js#L73-L173](../../../../../proto-dev/src/reactions/application/reaction-finale-service.js)

[^4]: Completion resume and logging [src/reactions/application/reaction-finale-service.js#L175-L238](../../../../../proto-dev/src/reactions/application/reaction-finale-service.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)
