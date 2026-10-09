---
title: GhostReactionReplayWidget
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - DIALOG_WIDGET_READY
  - EVENT_MESSAGE_READY
  - SCREEN_CHANGE
owns:
  - _activeIcon
  - _activeSector
  - _activeTrigger
  - _circleAnimationBackup
  - _currentScreen
  - _handler
  - _lastSystemReaction
  - _overlayLabel
  - _overlayTimer
  - _pendingTimer
  - _revealTimer
  - _scanStopTimer
  - _scanTimer
  - bus
  - dialogSelector
  - document
  - panelSelector
  - screenService
  - window
schemaVersion: 1
source: src/reactions/presentation/ghost-reaction-replay-widget.js
source_exists: true
runtime_role: GhostReactionReplayWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
used_by:
  - src/app-shell/composition/presentation-module.js
---

# GhostReactionReplayWidget

Replays ghost reaction overlays during dialog/history recovery scenarios. Source: `proto-dev/src/reactions/presentation/ghost-reaction-replay-widget.js`.
