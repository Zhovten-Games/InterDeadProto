---
domains: []
emits: []
implements:
  - IEventBus
imports:
  - src/runtime-events/ports/event-bus-port.js
listens: []
owns: []
schemaVersion: 1
source: src/runtime-events/domain/null-event-bus.js
used_by:
  - src/camera/detection/detection-adapter.js
  - src/notifications/browser/notification-adapter.js
  - src/localization/browser/language-adapter.js
  - src/app-shell/controls/panel-adapter.js
  - src/app-shell/navigation/view-adapter.js
  - src/camera/application/camera-orchestrator-service.js
  - src/messenger/application/chat-scroll-service.js
  - src/messenger/application/dialog-history-observer-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/app-shell/controls/drum-layout-service.js
  - src/narrative-runtime/effects/effects-manager.js
  - src/spirit-contacts/application/ghost-switch-service.js
  - src/app-shell/overlays/modal-service.js
  - src/identity/application/profile-registration-service.js
  - src/identity/application/profile-transfer-service.js
  - src/reactions/application/reaction-finale-service.js
  - src/reactions/application/reaction-persistence-service.js
  - src/identity/application/profile-reset-service.js
  - src/media/audio/sound-service.js
  - src/app-shell/navigation/view-service.js
  - src/app-shell/presentation/global-view-presenter.js
  - src/media/presentation/media-lightbox.js
  - src/camera/presentation/camera-status-widget.js
  - src/messenger/presentation/chat-scroll-widget.js
  - src/app-shell/controls/presentation/control-panel-widget.js
  - src/messenger/presentation/dialog-widget.js
  - src/reactions/presentation/ghost-reaction-replay-widget.js
  - src/app-shell/overlays/presentation/modal-widget.js
  - src/reactions/presentation/reaction-overlay-widget.js
  - src/app-shell/presentation/status-widget.js
source_exists: true
runtime_role: NullEventBus
contour_primary: SAL-SWITCH
contour_secondary: none
role_group: salience_threat
narrative_role: salience routing switch
---

# NullEventBus

Null object implementation of the event bus port. It satisfies `IEventBus` while performing no operations, allowing services and adapters to opt into pub/sub semantics without requiring an actual bus during tests or offline flows.[^1][^2]

[^1]: [`NullEventBus.js`](../../../../../proto-dev/src/runtime-events/domain/null-event-bus.js)

[^2]: [`IEventBus.js`](../../../../../proto-dev/src/runtime-events/ports/event-bus-port.js)
