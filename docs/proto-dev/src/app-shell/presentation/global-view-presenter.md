---
domains: []
emits:
  - APP_RESET_REQUESTED
  - CAMERA_VIEW_CLOSED
  - CAMERA_VIEW_OPENED
  - DIALOG_WIDGET_READY
  - GHOST_REBOOT_REQUESTED
  - GHOST_RESET_REQUESTED
  - MODAL_HIDE
  - MODAL_SHOW
  - PROFILE_EXPORT_CONFIRMED
  - PROFILE_IMPORT_SELECTED
  - REGISTRATION_NAME_CHANGED
  - STATUS_SHOW
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/messenger/presentation/dialog-widget.js
  - src/camera/presentation/camera-status-widget.js
  - src/messenger/presentation/messenger-posts-widget.js
  - src/identity/presentation/location-status-widget.js
  - src/asset-delivery/paths/assets-base-url.js
  - src/identity/configuration/profile-ui-preferences-config.js
  - src/runtime-events/domain/constants.js
listens: []
owns:
  - _booted
  - _footerRendered
  - _handler
  - _modalNode
  - _previewRevoke
  - _registrationInput
  - _renderRevision
  - bus
  - cameraUi
  - currentScreen
  - detectionService
  - dialogWidget
  - languageManager
  - locationWidget
  - logger
  - mediaRepository
  - panelService
  - persistence
  - postsWidget
  - templateService
  - timeline
schemaVersion: 1
source: src/app-shell/presentation/global-view-presenter.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: GlobalViewPresenter
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# GlobalViewPresenter

UI composition владеет current screen render revision, widget lifecycle, footer/input subscriptions, preview handles и modal DOM. Каждый async template/panel/camera render проверяет revision. Messenger remount подписывается на retained timeline; camera view запрашивает session через event, не запускает отдельную stream ownership path. dispose освобождает UI resources и предотвращает stale rendering.

Проверки: `IDP-WH-RESTORE-001.v1; complete-unit-corpus`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/app-shell/presentation/global-view-presenter.js)
