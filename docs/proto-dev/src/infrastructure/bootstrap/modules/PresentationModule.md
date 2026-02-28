---
domains: []
emits: []
implements: []
imports:
  - src/adapters/ui/ButtonAdapter.js
  - src/adapters/ui/PanelAdapter.js
  - src/adapters/ui/ViewAdapter.js
  - src/config/controls.config.js
  - src/infrastructure/bootstrap/Loader.js
  - src/presentation/adapters/GlobalViewPresenter.js
  - src/presentation/components/forms/TextFieldAnimator.js
  - src/presentation/components/loader/LoaderModuleNameProvider.js
  - src/presentation/widgets/LoaderView.js
  - src/presentation/widgets/Modal/index.js
  - src/presentation/widgets/PanelEffectsWidget.js
  - src/presentation/widgets/ReactionOverlayWidget.js
  - src/presentation/widgets/StatusWidget.js
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/modules/PresentationModule.js
used_by:
  - src/infrastructure/bootstrap/composeApplication.js
---

# PresentationModule

`PresentationModule` exposes UI-facing adapters and widgets so the loader, panels, overlays, and presenters can be resolved with their event bus, language, and logging collaborators already injected.[^1]

It boots loader-related services first—text field animation, loader name provider, loader view, and status widget—so progress reporting is ready before the application boots other modules.[^2]

Button, panel, and reaction overlay registrations then connect UI components to language services, ghost toggles, spirit configuration, duality state, and the event bus, enabling interactive controls and animated panel effects.[^3]

Finally, the module registers modal, global presenter, view adapter, and loader orchestrator instances, combining templates, panel services, media repositories, logging, and persistence to drive screen rendering and overlay lifecycle management.[^4]

[^1]: Module definition and context [src/infrastructure/bootstrap/modules/PresentationModule.js#L15-L30](../../../../src/infrastructure/bootstrap/modules/PresentationModule.js#L15-L30)
[^2]: Loader, name provider, and status widget registrations [src/infrastructure/bootstrap/modules/PresentationModule.js#L32-L55](../../../../src/infrastructure/bootstrap/modules/PresentationModule.js#L32-L55); [`Loader`](../Loader.md)
[^3]: Button, panel effects, panel adapter, and reaction overlay wiring [src/infrastructure/bootstrap/modules/PresentationModule.js#L57-L104](../../../../src/infrastructure/bootstrap/modules/PresentationModule.js#L57-L104); [`PanelEffectsWidget`](../../../presentation/widgets/PanelEffectsWidget.md); [`ReactionOverlayWidget`](../../../presentation/widgets/ReactionOverlayWidget.md)
[^4]: Modal widget, global presenter, view adapter, and loader registrations [src/infrastructure/bootstrap/modules/PresentationModule.js#L105-L141](../../../../src/infrastructure/bootstrap/modules/PresentationModule.js#L105-L141); [`GlobalViewPresenter`](../../../presentation/adapters/GlobalViewPresenter.md)
