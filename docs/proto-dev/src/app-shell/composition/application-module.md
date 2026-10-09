---
domains: []
emits: []
implements: []
imports:
  - src/messenger/history/dialog-timeline.js
  - src/narrative-runtime/configuration/duality-config-service.js
  - src/identity/application/profile-registration-service.js
  - src/spirit-contacts/application/ghost-service.js
  - src/spirit-contacts/application/ghost-switch-service.js
  - src/messenger/persistence/dialog-repository.js
  - src/messenger/history/dialog-history-service.js
  - src/app-shell/navigation/screen-service.js
  - src/app-shell/controls/button-state-service.js
  - src/app-shell/controls/button-visibility-service.js
  - src/app-shell/overlays/modal-service.js
  - src/messenger/application/posts-service.js
  - src/identity/application/avatar-service.js
  - src/app-shell/controls/button-service.js
  - src/app-shell/state/application-state-service.js
  - src/camera/application/camera-orchestrator-service.js
  - src/quests/presentation/item-overlay-service.js
  - src/media/composition/image-composer-service.js
  - src/media/persistence/media-repository.js
  - src/app-shell/controls/drum-layout-service.js
  - src/reactions/application/reaction-mapping-service.js
  - src/reactions/application/reaction-persistence-service.js
  - src/reactions/application/reaction-finale-service.js
  - src/messenger/application/dialog-orchestrator-service.js
  - src/messenger/application/chat-scroll-service.js
  - src/messenger/application/dialog-history-observer-service.js
  - src/identity/application/profile-reset-service.js
  - src/identity/application/profile-transfer-service.js
  - src/narrative-runtime/effects/effects-manager.js
  - src/messenger/application/dialog-input-gate-service.js
  - src/messenger/history/dialog-history-buffer.js
  - src/contact-sessions/checkpoints/ghost-reboot-checkpoint-service.js
  - src/app-shell/navigation/view-service.js
  - src/media/audio/sound-service.js
  - src/identity/authentication/auth-login-resolver.js
  - src/identity/authentication/login-prefill-service.js
  - src/messenger/application/chat-launcher-visibility-service.js
  - src/messenger/application/chat-launcher-service.js
  - src/camera/application/ai-warmup-service.js
listens: []
owns:
  - context
schemaVersion: 1
source: src/app-shell/composition/application-module.js
used_by:
  - src/app-shell/composition/compose-application.js
source_exists: true
runtime_role: ApplicationModule
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# ApplicationModule

Registers application-level services in the DI container, including auth/login helpers, chat launcher visibility, AI warmup, dialog orchestration, camera/reaction services, and reset/profile transfer orchestration.[^1]

Updated wiring includes `GhostRebootCheckpointService` and injection into `DialogOrchestratorService`, enabling ghost reboot checkpoint persistence as part of the runtime composition root.[^2]

[^1]: Service registration map [proto-dev/src/app-shell/composition/application-module.js#L1-L520](../../../../../proto-dev/src/app-shell/composition/application-module.js)

[^2]: Reboot checkpoint registration and orchestrator dependency binding [proto-dev/src/app-shell/composition/application-module.js#L300-L520](../../../../../proto-dev/src/app-shell/composition/application-module.js)
