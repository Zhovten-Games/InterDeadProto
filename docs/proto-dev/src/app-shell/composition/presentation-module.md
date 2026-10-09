---
domains: []
emits: []
implements: []
imports:
  - src/app-shell/bootstrap/loader.js
  - src/camera/presentation/ai-loader-view.js
  - src/app-shell/presentation/boot-overlay-view.js
  - src/app-shell/overlays/overlay-orchestrator-service.js
  - src/app-shell/overlays/presentation/unified-overlay-view.js
  - src/app-shell/presentation/status-widget.js
  - src/app-shell/controls/button-adapter.js
  - src/app-shell/controls/panel-adapter.js
  - src/reactions/presentation/reaction-overlay-widget.js
  - src/reactions/presentation/ghost-reaction-replay-widget.js
  - src/media/presentation/media-lightbox.js
  - src/app-shell/overlays/presentation/modal-widget.js
  - src/app-shell/presentation/global-view-presenter.js
  - src/app-shell/navigation/view-adapter.js
  - src/messenger/presentation/chat-launcher-widget.js
  - src/app-shell/controls/controls-config.js
listens: []
owns:
  - context
schemaVersion: 1
source: src/app-shell/composition/presentation-module.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: PresentationModule
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# PresentationModule

`PresentationModule` exposes UI-facing adapters and widgets so the loader, panels, overlays, and presenters can be resolved with their event bus, language, and logging collaborators already injected.[^1]

It boots loader-related services first—text field animation, loader name provider, loader view, and status widget—so progress reporting is ready before the application boots other modules.[^2]

Button, panel, and reaction overlay registrations then connect UI components to language services, ghost toggles, spirit configuration, duality state, and the event bus, enabling interactive controls and animated panel effects.[^3]

Finally, the module registers modal, global presenter, view adapter, and loader orchestrator instances, combining templates, panel services, media repositories, logging, and persistence to drive screen rendering and overlay lifecycle management.[^4]

[^1]: Module definition and context [src/app-shell/composition/presentation-module.js#L15-L30](../../../../../proto-dev/src/app-shell/composition/presentation-module.js)

[^2]: Loader, name provider, and status widget registrations [src/app-shell/composition/presentation-module.js#L32-L55](../../../../../proto-dev/src/app-shell/composition/presentation-module.js); [`Loader`](../bootstrap/loader.md)

[^3]: Button, panel effects, panel adapter, and reaction overlay wiring [src/app-shell/composition/presentation-module.js#L57-L104](../../../../../proto-dev/src/app-shell/composition/presentation-module.js); `PanelEffectsWidget` (историческая ссылка отсутствует в baseline; не используется как evidence); [`ReactionOverlayWidget`](../../reactions/presentation/reaction-overlay-widget.md)

[^4]: Modal widget, global presenter, view adapter, and loader registrations [src/app-shell/composition/presentation-module.js#L105-L141](../../../../../proto-dev/src/app-shell/composition/presentation-module.js); [`GlobalViewPresenter`](../presentation/global-view-presenter.md)
