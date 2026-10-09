---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - CAMERA_STATUS
  - CAMERA_TOGGLE
  - DETECTION_SEARCH
  - DETECTION_STOPPED
  - EVENT_MESSAGE_READY
  - OVERLAY_SHOW
  - QUEST_ITEM_OVERLAY_READY
  - REACTION_OVERLAY_REQUESTED
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/narrative-runtime/engine/store.js
  - src/narrative-runtime/engine/actions.js
  - src/narrative-runtime/engine/effects.js
  - src/runtime-configuration/feature-flags.js
  - src/runtime-events/domain/constants.js
  - src/camera/detection/camera-detection-strategy.js
listens:
  - CAMERA_DETECT
  - CAMERA_VIEW_CLOSED
  - CAMERA_VIEW_OPENED
  - QUEST_COMPLETED
  - QUEST_STARTED
  - object
  - presence
owns:
  - _capturePromise
  - _captureSession
  - _handler
  - _msgSeq
  - _operationRevision
  - _requirementHandler
  - _retryTimer
  - _runningToken
  - _sessionRevision
  - active
  - avatarService
  - bus
  - buttonStateService
  - buttonVisibilityService
  - cameraOpen
  - cameraService
  - canvasFactory
  - captured
  - detectionBusy
  - detectionService
  - dialogManager
  - dualityManager
  - effectHandlers
  - engineEnabled
  - imageComposer
  - inputGate
  - lastCameraType
  - lastContainer
  - lastForce
  - lastOnDetected
  - lastRequirement
  - logger
  - mediaRepository
  - overlayService
  - questStrategy
  - registrationStrategy
  - sessionState
  - stateService
  - store
  - timeline
schemaVersion: 1
source: src/camera/application/camera-orchestrator-service.js
used_by:
  - src/app-shell/composition/application-module.js
source_exists: true
runtime_role: CameraOrchestratorService
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# CameraOrchestratorService

Единственный camera session owner для UI/quest/registration. open/closeSession управляют generation и состояниями opening/active/closing/idle/error через CameraAdapter. startDetection разрешает одну операцию, каждый await проверяет session/operation. Старые inference/finally/retry не изменяют presence, Post, capture, quest или нового духа. captureOverlay coalesces только внутри актуальной session, сохраняет media и canonical timeline перед публичным completion; stale/error освобождают handles и orphan media. Contact/reset/host hide закрывают session.

Проверки: `IDP-WH-CAMERA-001.v1; IDP-WH-CAMERA-002.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/camera/application/camera-orchestrator-service.js)
