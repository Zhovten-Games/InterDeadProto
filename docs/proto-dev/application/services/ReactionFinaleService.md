---
domains: []
emits:
  - REACTION_FINALE_STATE_UPDATED
  - status
implements: []
imports:
  - src/config/reactionFinale.config.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens:
  - DIALOG_CLEAR
  - DUALITY_COMPLETED
  - EVENT_MESSAGE_READY
  - REACTION_FINALE_RECALCULATE_REQUESTED
  - REACTION_SELECTED
owns: []
schemaVersion: 1
source: src/application/services/ReactionFinaleService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# ReactionFinaleService

Guards duality completion until required reactions are collected and the finale message renders. The service registers itself as a completion guard on `DualityManager`, subscribes to dialog/reaction events through an injected bus (`NullEventBus` fallback), and tracks stage coverage per ghost.[^1][^2]

`EVENT_MESSAGE_READY` captures fingerprints and stage identifiers, marking finale messages and emitting `REACTION_FINALE_STATE_UPDATED` with pending or complete payloads. Reaction selections update stage progress; recalculation requests recompute missing stages and resume deferred completion when requirements are satisfied.[^2]

Pending completion callbacks supplied by `DualityManager` are stored and invoked once requirements are met. Errors raised during resume are logged via the injected logger, which defaults to `NullLogger`.[^3]

[^1]: Guard setup and event subscription [src/application/services/ReactionFinaleService.js#L17-L71](../../src/application/services/ReactionFinaleService.js#L17-L71); interaction with `DualityManager` [src/core/sequence/DualityManager.js#L54-L118](../../src/core/sequence/DualityManager.js#L54-L118)
[^2]: Event bus injection and default [src/application/services/ReactionFinaleService.js#L1-L28](../../src/application/services/ReactionFinaleService.js#L1-L28); [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Finale tracking and state emission [src/application/services/ReactionFinaleService.js#L73-L173](../../src/application/services/ReactionFinaleService.js#L73-L173)
[^4]: Completion resume and logging [src/application/services/ReactionFinaleService.js#L175-L238](../../src/application/services/ReactionFinaleService.js#L175-L238); [docs/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
