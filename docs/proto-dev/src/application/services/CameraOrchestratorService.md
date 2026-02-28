---
domains: []
emits:
  - BUTTON_STATE_UPDATED
  - CAMERA_STATUS
  - CAMERA_TOGGLE
  - DETECTION_SEARCH
  - EVENT_MESSAGE_READY
  - OVERLAY_SHOW
  - QUEST_ITEM_OVERLAY_READY
  - REACTION_REMINDER_READY
implements: []
imports:
  - src/application/services/CameraDetectionStrategy.js
  - src/config/flags.js
  - src/core/engine/actions.js
  - src/core/engine/effects.js
  - src/core/engine/store.js
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
  - src/ports/IEventBus.js
listens:
  - CAMERA_VIEW_CLOSED
  - CAMERA_VIEW_OPENED
  - QUEST_COMPLETED
  - QUEST_STARTED
  - handler
owns: []
schemaVersion: 1
source: src/application/services/CameraOrchestratorService.js
used_by:
  - src/infrastructure/bootstrap/modules/ApplicationModule.js
---

# CameraOrchestratorService

Coordinates camera streaming, detection, UI state, and quest progression. An injected event bus (defaulting to `NullEventBus`) delivers camera view lifecycle events so the orchestrator can start or stop streams, adjust button visibility, reset capture state, and guard against reopening logic when the view closes mid initialization.[^1][^10] Quest signals drive re-evaluation of requirements and reset state so capture buttons reflect current quests and messenger toggles stay in sync.[^2]

Detection relies on strategy objects (`RegistrationCameraStrategy` and `QuestCameraStrategy`) which wrap quest requirements and
delay searches until prerequisites are met.[^3] The orchestrator collaborates with `ButtonVisibilityService` and
`ButtonStateService` to reflect camera availability in the UI, toggling messenger/capture controls whenever quests start,
complete, or the camera closes.[^4]

### Detection flow
1. `start()` chooses a strategy, logs the selected requirement, and enables detection only when a quest is active or the
   registration camera needs a person target; otherwise it skips detection.[^5]
2. `startDetection()` guards against parallel runs, waits for requirement satisfaction, and dispatches a `detectionStart` action
to the engine.[^6]
3. `_runDetection()` captures a frame, delegates to the detection service, pauses the stream on success, and schedules retries
when no match is found.[^7]
4. `resumeDetection()` restarts streaming, optionally hides the frozen preview, and re-evaluates the requirement before
relaunching detection.[^8]
5. `captureOverlay()` composes quest overlays, persists media, and posts an image message with stage metadata. It emits
`EVENT_MESSAGE_READY` for dialog rendering plus `REACTION_REMINDER_READY` so the reaction overlay can highlight the new message
before completing the quest.[^9]

[^1]: Camera view open/close handling, force/quest gating, and visibility toggles [src/application/services/CameraOrchestratorService.js#L70-L187](../../src/application/services/CameraOrchestratorService.js#L70-L187)
[^2]: Quest start/completion reactions resetting capture state [src/application/services/CameraOrchestratorService.js#L188-L209](../../src/application/services/CameraOrchestratorService.js#L188-L209)
[^3]: Strategy selection and requirement helpers [src/application/services/CameraOrchestratorService.js#L211-L259](../../src/application/services/CameraOrchestratorService.js#L211-L259)
[^4]: Visibility/state adjustments for camera and messenger buttons [src/application/services/CameraOrchestratorService.js#L142-L183](../../src/application/services/CameraOrchestratorService.js#L142-L183)
[^5]: Strategy gating and requirement logging [src/application/services/CameraOrchestratorService.js#L211-L259](../../src/application/services/CameraOrchestratorService.js#L211-L259)
[^6]: Detection guards and engine dispatch [src/application/services/CameraOrchestratorService.js#L261-L338](../../src/application/services/CameraOrchestratorService.js#L261-L338)
[^7]: Detection loop and retry scheduling [src/application/services/CameraOrchestratorService.js#L297-L338](../../src/application/services/CameraOrchestratorService.js#L297-L338)
[^8]: Resume logic after pauses or manual interactions [src/application/services/CameraOrchestratorService.js#L340-L383](../../src/application/services/CameraOrchestratorService.js#L340-L383)
[^9]: Overlay composition, quest metadata, and reaction reminder emission [src/application/services/CameraOrchestratorService.js#L384-L509](../../src/application/services/CameraOrchestratorService.js#L384-L509)
[^10]: Bus injection and quest strategy wiring [src/application/services/CameraOrchestratorService.js#L1-L71](../../src/application/services/CameraOrchestratorService.js#L1-L71); [docs/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
