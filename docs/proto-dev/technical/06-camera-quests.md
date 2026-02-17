# 6. Camera quests and artifact capture

This section implements the narrative “Artifacts” and “Operation algorithm” steps where a response can be an image or object.

## 6.1 Quest activation

- When a dialog stage completes, `DialogOrchestratorService` calls `dualityManager.completeCurrentEvent()`.
- The duality manager activates a quest, and `DialogInputGateService` switches to `kind=camera_capture`.
- `ControlPanel` highlights the camera button to guide the user to the quest screen.

## 6.2 Capture and overlay

When the user opens the camera:

- `ViewService` starts a **quest camera strategy** and listens for `DETECTION_DONE_EVENT`.
- On successful detection, `CameraSectionManager.captureOverlay()` applies quest overlays and stores the result.
- The final output is treated like an artifact: it can be replayed in dialog history or stored in media repositories.

**Next:** [7. History, persistence, and recovery](07-history.md)
