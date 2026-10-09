---
domains: []
emits:
  - EFFECT_DEFAULTS_SAVED
  - EFFECT_STYLE_UPDATED
implements: []
imports:
  - src/runtime-diagnostics/null-logger.js
  - src/app-shell/visual-effects/effects-config.js
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - APP_RESET_COMPLETED
  - DUALITY_STAGE_STARTED
  - DUALITY_STARTED
  - EFFECT_UPDATE_REQUESTED
  - EVENT_STARTED
  - GHOST_CONTEXT_COMMITTED
owns:
  - _booted
  - _handler
  - activeGhost
  - activeStage
  - baseConfig
  - bus
  - current
  - dualityManager
  - ghostService
  - logger
  - overrides
  - persistence
  - runtimeOverrides
  - spiritConfigs
schemaVersion: 1
source: src/narrative-runtime/effects/effects-manager.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: EffectsManager
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# EffectsManager

Coordinates runtime styling for visual effects such as the electric border around the control panel. On boot it subscribes to the injected event bus (falling back to `NullEventBus`), publishes the current configuration for each registered effect, and resets runtime overrides whenever ghosts, stages, or duality runs change.[^1][^2] A `NullLogger` default captures persistence failures without coupling the service to infrastructure logging.[^3]

`EFFECT_UPDATE_REQUESTED` events merge or replace overrides, optionally persisting them through the shared persistence adapter so player-driven tweaks survive reloads. The manager combines base defaults, per-ghost defaults, stage overrides, persisted values, and transient runtime adjustments before emitting `EFFECT_STYLE_UPDATED` with the resolved configuration.[^3]

Spirit configuration metadata is plumbed in via `setSpiritConfigs`, allowing stage definitions to declare `effects` entries whose overrides are applied automatically (and persisted when marked with `persist`). Reset completion clears overrides and re-emits defaults for the active ghost/stage.[^4]

[^1]: Boot lifecycle and event subscription [src/narrative-runtime/effects/effects-manager.js#L20-L71](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js)

[^2]: Event bus injection and default [src/narrative-runtime/effects/effects-manager.js#L1-L27](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Logger default and persistence warnings [src/narrative-runtime/effects/effects-manager.js#L9-L20](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js); [src/narrative-runtime/effects/effects-manager.js#L131-L167](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js); [docs/core/logging/NullLogger.md](../../runtime-diagnostics/null-logger.md)

[^4]: Update handling and combined config emission [src/narrative-runtime/effects/effects-manager.js#L73-L167](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js)

[^5]: Ghost/stage override resolution and reset handling [src/narrative-runtime/effects/effects-manager.js#L169-L214](../../../../../proto-dev/src/narrative-runtime/effects/effects-manager.js)
