---
domains: []
emits: []
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/runtime-events/domain/constants.js
used_by:
  - src/camera/detection/detection-adapter.js
  - src/notifications/browser/notification-adapter.js
  - src/app-shell/controls/panel-adapter.js
  - src/app-shell/navigation/view-adapter.js
  - src/camera/application/ai-warmup-service.js
  - src/app-shell/controls/button-service.js
  - src/app-shell/controls/button-state-service.js
  - src/app-shell/controls/button-visibility-service.js
  - src/camera/detection/camera-detection-strategy.js
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/dialog-history-observer-service.js
  - src/messenger/application/dialog-input-gate-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/app-shell/controls/drum-layout-service.js
  - src/narrative-runtime/effects/effects-manager.js
  - src/app-shell/overlays/modal-service.js
  - src/identity/application/profile-registration-service.js
  - src/identity/application/profile-transfer-service.js
  - src/reactions/application/reaction-finale-service.js
  - src/reactions/application/reaction-persistence-service.js
  - src/identity/application/profile-reset-service.js
  - src/media/audio/sound-service.js
  - src/app-shell/state/application-state-service.js
  - src/app-shell/navigation/view-service.js
  - src/narrative-runtime/dialog/dialog-manager.js
  - src/runtime-events/domain/event.js
  - src/quests/domain/quest.js
  - src/narrative-runtime/sequence/duality-manager.js
  - src/app-shell/presentation/global-view-presenter.js
  - src/media/presentation/media-lightbox.js
  - src/camera/presentation/ai-loader-view.js
  - src/app-shell/presentation/boot-overlay-view.js
  - src/camera/presentation/camera-status-widget.js
  - src/messenger/presentation/chat-scroll-widget.js
  - src/app-shell/controls/presentation/control-panel-widget.js
  - src/messenger/presentation/dialog-widget.js
  - src/reactions/presentation/ghost-reaction-replay-widget.js
  - src/app-shell/overlays/presentation/modal-widget.js
  - src/reactions/presentation/reaction-overlay-widget.js
  - src/app-shell/presentation/status-widget.js
  - src/app-shell/overlays/presentation/unified-overlay-view.js
  - src/messenger/history/dialog-timeline.js
source_exists: true
runtime_role: DUALITY_STARTED
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Event constants

Defines the canonical event names used across the app and exports `ALL_EVENTS` as an immutable registry.[^1]

Recent additions include ghost reboot events (`GHOST_REBOOT_REQUESTED`, `GHOST_REBOOT_COMPLETED`), reset/profile-transfer lifecycle events, dialog-widget readiness events, and UI transport events for modal/overlay/media flows.[^1]

[^1]: Event list and `ALL_EVENTS` registry [proto-dev/src/runtime-events/domain/constants.js#L1-L160](../../../../../proto-dev/src/runtime-events/domain/constants.js)
