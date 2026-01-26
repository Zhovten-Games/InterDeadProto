---
domains: []
emits:
  - CAMERA_VIEW_CLOSED
  - CAMERA_VIEW_OPENED
  - DIALOG_WIDGET_READY
  - MODAL_HIDE
  - MODAL_SHOW
  - PROFILE_EXPORT_CONFIRMED
  - PROFILE_IMPORT_SELECTED
  - REGISTRATION_NAME_CHANGED
  - STATUS_SHOW
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/presentation/components/forms/TextFieldAnimator.js
  - src/presentation/widgets/CameraStatusWidget.js
  - src/presentation/widgets/Dialog/index.js
  - src/presentation/widgets/LocationStatusWidget.js
  - src/presentation/widgets/MessengerPostsWidget.js
listens:
  - APP_RESET_COMPLETED
  - CAMERA_PREVIEW_CLEARED
  - CAMERA_PREVIEW_READY
  - CAMERA_VIEW_CLOSED
  - DIALOG_CLEAR
  - DIALOG_WIDGET_READY
  - EVENT_MESSAGE_READY
  - GEO_STATUS_UPDATED
  - INIT
  - MESSENGER_POSTS_READY
  - PROFILE_EXPORT_READY
  - PROFILE_EXPORT_REQUESTED
  - PROFILE_IMPORT_COMPLETED
  - PROFILE_IMPORT_REQUESTED
  - PROFILE_TRANSFER_FAILED
  - QUEST_ITEM_OVERLAY_READY
  - SCREEN_CHANGE
  - VIEW_CAMERA_RENDER_REQUESTED
  - VIEW_RENDER_REQUESTED
owns: []
schemaVersion: 1
source: src/presentation/adapters/GlobalViewPresenter.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# GlobalViewPresenter

Bridges application events to DOM updates by listening on the injected event bus (defaulting to `NullEventBus`), instantiating widgets for dialogs, camera status, posts, geo indicators, and profile transfer modals. The presenter now owns a `TextFieldAnimator` so registration labels can animate with the same typewriter effect used in dialogs.[^1][^2]

Boot subscribes to the bus and `dispose` tears down widgets, camera overlays, registration listeners, and any active text animation so resets leave no lingering UI state.[^2]

`VIEW_RENDER_REQUESTED` loads the requested template, hydrates messenger and registration screens, mounts `DialogWidget`, and kicks off the registration label animation while caching the inline input for change events; `VIEW_CAMERA_RENDER_REQUESTED` sets up `CameraStatusWidget`, mounts the panel, and emits `CAMERA_VIEW_OPENED` so upstream services can start streams.[^3]

Profile transfer events drive a modal builder that renders localized forms, validates input, dispatches `PROFILE_IMPORT_SELECTED`/`PROFILE_EXPORT_CONFIRMED`, and surfaces translated success or failure statuses via `STATUS_SHOW`. Camera preview events manage blob URL lifecycles, and dialog-related events now rely on widget recreation since the empty-state placeholder flow was removed, leaving `_handleDialogState` as a no-op.[^4]

[^1]: Event routing and dependencies, including `TextFieldAnimator` wiring [src/presentation/adapters/GlobalViewPresenter.js#L1-L86](../../../src/presentation/adapters/GlobalViewPresenter.js#L1-L86)
[^2]: `NullEventBus` fallback [src/presentation/adapters/GlobalViewPresenter.js#L1-L44](../../../src/presentation/adapters/GlobalViewPresenter.js#L1-L44); [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Boot/dispose lifecycle and reset handling [src/presentation/adapters/GlobalViewPresenter.js#L62-L321](../../../src/presentation/adapters/GlobalViewPresenter.js#L62-L321)
[^4]: Screen rendering, messenger hydration, registration animation, and camera hand-off [src/presentation/adapters/GlobalViewPresenter.js#L127-L218](../../../src/presentation/adapters/GlobalViewPresenter.js#L127-L218); dialog placeholder removal note [src/presentation/adapters/GlobalViewPresenter.js#L288-L293](../../../src/presentation/adapters/GlobalViewPresenter.js#L288-L293)
[^5]: Profile transfer modal workflow, status updates, and preview management [src/presentation/adapters/GlobalViewPresenter.js#L249-L416](../../../src/presentation/adapters/GlobalViewPresenter.js#L249-L416)
