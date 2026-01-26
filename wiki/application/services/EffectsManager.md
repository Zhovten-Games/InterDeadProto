---
domains: []
emits:
  - EFFECT_DEFAULTS_SAVED
  - EFFECT_STYLE_UPDATED
implements: []
imports:
  - src/config/effects.config.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/core/logging/NullLogger.js
listens:
  - APP_RESET_COMPLETED
  - DUALITY_STAGE_STARTED
  - DUALITY_STARTED
  - EFFECT_UPDATE_REQUESTED
  - EVENT_STARTED
  - GHOST_CHANGE
owns: []
schemaVersion: 1
source: src/application/services/EffectsManager.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# EffectsManager

Coordinates runtime styling for visual effects such as the electric border around the control panel. On boot it subscribes to the injected event bus (falling back to `NullEventBus`), publishes the current configuration for each registered effect, and resets runtime overrides whenever ghosts, stages, or duality runs change.[^1][^2] A `NullLogger` default captures persistence failures without coupling the service to infrastructure logging.[^3]

`EFFECT_UPDATE_REQUESTED` events merge or replace overrides, optionally persisting them through the shared persistence adapter so player-driven tweaks survive reloads. The manager combines base defaults, per-ghost defaults, stage overrides, persisted values, and transient runtime adjustments before emitting `EFFECT_STYLE_UPDATED` with the resolved configuration.[^3]

Spirit configuration metadata is plumbed in via `setSpiritConfigs`, allowing stage definitions to declare `effects` entries whose overrides are applied automatically (and persisted when marked with `persist`). Reset completion clears overrides and re-emits defaults for the active ghost/stage.[^4]

[^1]: Boot lifecycle and event subscription [src/application/services/EffectsManager.js#L20-L71](../../src/application/services/EffectsManager.js#L20-L71)
[^2]: Event bus injection and default [src/application/services/EffectsManager.js#L1-L27](../../src/application/services/EffectsManager.js#L1-L27); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Logger default and persistence warnings [src/application/services/EffectsManager.js#L9-L20](../../src/application/services/EffectsManager.js#L9-L20); [src/application/services/EffectsManager.js#L131-L167](../../src/application/services/EffectsManager.js#L131-L167); [wiki/core/logging/NullLogger.md](../../core/logging/NullLogger.md)
[^4]: Update handling and combined config emission [src/application/services/EffectsManager.js#L73-L167](../../src/application/services/EffectsManager.js#L73-L167)
[^5]: Ghost/stage override resolution and reset handling [src/application/services/EffectsManager.js#L169-L214](../../src/application/services/EffectsManager.js#L169-L214)
