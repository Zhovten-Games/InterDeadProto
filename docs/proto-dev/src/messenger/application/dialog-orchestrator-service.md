---
domains: []
emits:
  - GHOST_CONTEXT_COMMITTED
  - GHOST_REBOOT_COMPLETED
  - GHOST_RESET_COMPLETED
  - STATUS_SHOW
implements: []
imports:
  - src/contact-sessions/application/contact-transition-controller.js
  - src/messenger/history/dialog-timeline.js
  - src/runtime-diagnostics/null-logger.js
  - src/runtime-events/domain/null-event-bus.js
  - src/messenger/history/dialog-history-buffer.js
  - src/narrative-runtime/engine/store.js
  - src/narrative-runtime/dialog/auto-reply-builder.js
  - src/narrative-runtime/engine/actions.js
  - src/narrative-runtime/engine/effects.js
  - src/runtime-configuration/feature-flags.js
  - src/messenger/identity/message-fingerprint.js
  - src/runtime-events/domain/constants.js
listens:
  - APP_RESET_COMPLETED
  - APP_RESET_REQUESTED
  - DUALITY_COMPLETED
  - DUALITY_STAGE_STARTED
  - EVENT_MESSAGE_READY
  - GHOST_CHANGE
  - GHOST_REBOOT_REQUESTED
  - GHOST_RESET_REQUESTED
  - QUEST_STARTED
  - SCREEN_CHANGE
  - USER_PROFILE_SAVED
  - image
  - post
  - youtube
owns:
  - _handler
  - _hasAdvanced
  - _lastReplayedIndex
  - _pendingAvatarRefresh
  - _pendingPosts
  - _readyHandler
  - _replayedFingerprints
  - _widgetReady
  - autoReplyBuilder
  - avatarService
  - awaitingAvatar
  - bus
  - buttonStateService
  - buttonVisibilityService
  - currentGhost
  - dialogManager
  - dualityManager
  - effectHandlers
  - engineEnabled
  - ghostService
  - ghostSwitchService
  - historyBuffer
  - historyService
  - initializedGhosts
  - inputGate
  - logger
  - onMessenger
  - postLocked
  - rebootCheckpointService
  - spiritConfigs
  - started
  - store
  - timeline
  - transitions
  - userAvatar
  - waitingForWidget
schemaVersion: 1
source: src/messenger/application/dialog-orchestrator-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: DialogOrchestratorService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# DialogOrchestratorService

Оркестрирует narrative progression текущего committed spirit через ContactTransitionController. Сначала подготавливает config/history/avatar/stage в локальном candidate, затем одним актуальным revision commits dialog/duality/snapshot. requested и committed ghost различаются. Legacy occurrence сопоставляется по stage/content один раз с сохранением исходной identity; live accepted occurrence не переписывается по равному тексту. Готовый widget получает snapshot, а Post выводится из фактического await-user state.

Проверки: `IDP-WH-SWITCH-001.v1; IDP-WH-RESTORE-001.v1; browser-profile-reload-subpath`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/messenger/application/dialog-orchestrator-service.js)
