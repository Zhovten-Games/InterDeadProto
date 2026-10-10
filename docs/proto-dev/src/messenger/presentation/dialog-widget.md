---
domains: []
emits:
  - CHAT_LOAD_OLDER
  - MEDIA_OPEN
  - OVERLAY_SHOW
  - REACTION_FINALE_RECALCULATE_REQUESTED
  - REACTION_OVERLAY_REQUESTED
  - log
implements: []
imports:
  - src/messenger/presentation/animations/text-animation-manager.js
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-events/domain/constants.js
  - src/app-shell/composition/configuration-index.js
  - src/messenger/configuration/chat-config.js
  - src/messenger/presentation/message-deduplicator.js
  - src/messenger/presentation/new-messages-indicator.js
  - src/media/video/youtube.js
listens:
  - CHAT_LOAD_OLDER
  - DIALOG_CLEAR
  - DIALOG_HISTORY_REPLACED
  - EVENT_MESSAGE_READY
  - REACTION_FINALE_STATE_UPDATED
  - REACTION_REMINDER_READY
  - REACTION_SELECTED
  - image
  - youtube
owns:
  - _booted
  - _dedupe
  - _firstUnreadMessageId
  - _ghost
  - _handler
  - _isBatchMode
  - _mediaHandles
  - _msgSeq
  - _newMessagesIndicator
  - _noteSelections
  - _pendingReactions
  - _renderLock
  - _scrollListener
  - _snapshotRevision
  - _unsubscribeTimeline
  - _viewRevision
  - animations
  - batchSize
  - bus
  - container
  - displayMode
  - language
  - lastRenderedIndex
  - mediaRepository
  - messages
  - renderCount
  - scrollContainer
  - scrollMode
  - timeline
  - tpl
schemaVersion: 1
source: src/messenger/presentation/dialog-widget.js
used_by:
  - src/app-shell/presentation/global-view-presenter.js
source_exists: true
runtime_role: DialogWidget
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
---

# DialogWidget

UI projection retained timeline с view/snapshot revision. boot подписывается на timeline и events; replaceMessages заменяет историю без live animations/sounds/effects. Render lock сериализует операции, stale template/media await не дописывает старый DOM. DOM message содержит stable fingerprint и dialog-message-id. Widget освобождает только собственные media handles; clear/dispose сохраняют handles иных consumers. TextAnimationManager владеет generation/timers typewriter.

Каждая render generation владеет своей очередью и неизменным диапазоном сообщений.
После animation await проверяется актуальность generation до изменения счётчиков
или scroll. Replacement не ждёт старые template/media/translation promises.
renderOlder выполняется в одной очереди с renderLatest, сохраняет newest cursor и
уже загруженное окно истории при поступлении live сообщения.

Проверки: `IDP-WH-RESTORE-001.v1; complete-unit-corpus; browser-profile-reload-subpath`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/messenger/presentation/dialog-widget.js)
