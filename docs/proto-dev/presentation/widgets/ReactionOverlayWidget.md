---
domains: []
emits: []
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - DIALOG_CLEAR
  - REACTION_OVERLAY_REQUESTED
  - REACTION_SELECTED
owns: []
schemaVersion: 1
source: src/presentation/widgets/ReactionOverlayWidget.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# ReactionOverlayWidget

Controls the emoji drum overlay, countdown, and manual rotation handling when a reaction is requested. The constructor wires DOM selectors, countdown timings, rotation speed, and event bus dependencies (defaulting to `NullEventBus`) so the widget can mount itself once the panel renders.[^1][^2] `boot`/`dispose` manage the subscription to reaction events.[^3]

When `REACTION_OVERLAY_REQUESTED` arrives it caches the request, locates panel elements, highlights the target dialog message, shows a fullscreen overlay, displays the countdown badge, and switches the drum to manual rotation while tracking the current angle.[^4] Pointer events allow users to drag the drum, temporarily pausing rotation; badge clicks or the countdown confirm the selection by emitting `REACTION_SELECTED` with message identifiers and revision flags.[^5]

Cleanup tears down event listeners, hides the badge and overlay, restores drum animation, removes highlight classes, and resets internal state so subsequent requests start fresh.[^6]

[^1]: Constructor configuration and defaults [src/presentation/widgets/ReactionOverlayWidget.js#L12-L58](../../../src/presentation/widgets/ReactionOverlayWidget.js#L12-L58)
[^2]: `NullEventBus` fallback [src/presentation/widgets/ReactionOverlayWidget.js#L1-L40](../../../src/presentation/widgets/ReactionOverlayWidget.js#L1-L40); [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Lifecycle subscriptions [src/presentation/widgets/ReactionOverlayWidget.js#L60-L104](../../../src/presentation/widgets/ReactionOverlayWidget.js#L60-L104)
[^4]: Overlay activation, message highlighting, and badge setup [src/presentation/widgets/ReactionOverlayWidget.js#L110-L207](../../../src/presentation/widgets/ReactionOverlayWidget.js#L110-L207)
[^5]: Pointer drag, countdown updates, and selection emission [src/presentation/widgets/ReactionOverlayWidget.js#L208-L360](../../../src/presentation/widgets/ReactionOverlayWidget.js#L208-L360)
[^6]: Teardown and state reset [src/presentation/widgets/ReactionOverlayWidget.js#L180-L207](../../../src/presentation/widgets/ReactionOverlayWidget.js#L180-L207)
