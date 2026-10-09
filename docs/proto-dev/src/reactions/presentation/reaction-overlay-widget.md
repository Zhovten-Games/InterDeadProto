---
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
listens:
  - DIALOG_CLEAR
  - REACTION_OVERLAY_REQUESTED
  - REACTION_SELECTED
owns:
  - _activeEmoji
  - _badge
  - _badgeBound
  - _circle
  - _countdownNode
  - _currentAngle
  - _dragOffset
  - _dragPointerId
  - _handler
  - _isDragging
  - _lastTick
  - _messageNode
  - _onBadgeClick
  - _onPointerDown
  - _onPointerMove
  - _onPointerUp
  - _overlayNode
  - _panel
  - _raf
  - _state
  - _tickRef
  - bus
  - config
  - document
  - window
schemaVersion: 1
source: src/reactions/presentation/reaction-overlay-widget.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: ReactionOverlayWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# ReactionOverlayWidget

Controls the emoji drum overlay, countdown, and manual rotation handling when a reaction is requested. The constructor wires DOM selectors, countdown timings, rotation speed, and event bus dependencies (defaulting to `NullEventBus`) so the widget can mount itself once the panel renders.[^1][^2] `boot`/`dispose` manage the subscription to reaction events.[^3]

When `REACTION_OVERLAY_REQUESTED` arrives it caches the request, locates panel elements, highlights the target dialog message, shows a fullscreen overlay, displays the countdown badge, and switches the drum to manual rotation while tracking the current angle.[^4] Pointer events allow users to drag the drum, temporarily pausing rotation; badge clicks or the countdown confirm the selection by emitting `REACTION_SELECTED` with message identifiers and revision flags.[^5]

Cleanup tears down event listeners, hides the badge and overlay, restores drum animation, removes highlight classes, and resets internal state so subsequent requests start fresh.[^6]

[^1]: Constructor configuration and defaults [src/reactions/presentation/reaction-overlay-widget.js#L12-L58](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js)

[^2]: `NullEventBus` fallback [src/reactions/presentation/reaction-overlay-widget.js#L1-L40](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js); [docs/core/events/NullEventBus.md](../../runtime-events/domain/null-event-bus.md)

[^3]: Lifecycle subscriptions [src/reactions/presentation/reaction-overlay-widget.js#L60-L104](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js)

[^4]: Overlay activation, message highlighting, and badge setup [src/reactions/presentation/reaction-overlay-widget.js#L110-L207](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js)

[^5]: Pointer drag, countdown updates, and selection emission [src/reactions/presentation/reaction-overlay-widget.js#L208-L360](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js)

[^6]: Teardown and state reset [src/reactions/presentation/reaction-overlay-widget.js#L180-L207](../../../../../proto-dev/src/reactions/presentation/reaction-overlay-widget.js)
