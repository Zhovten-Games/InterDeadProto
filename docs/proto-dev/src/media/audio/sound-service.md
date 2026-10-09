---
title: SoundService
domains: []
emits: []
implements: []
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/runtime-diagnostics/null-logger.js
  - src/runtime-events/domain/constants.js
listens:
  - CAMERA_VIEW_CLOSED
  - DETECTION_DONE_EVENT
  - DETECTION_SEARCH
  - DETECTION_STOPPED
  - EVENT_MESSAGE_READY
  - generated-beep
  - generated-heartbeat
  - url
owns:
  - _audioContext
  - _handler
  - _loops
  - audio
  - bus
  - contextProvider
  - definition
  - ghostService
  - intervalId
  - logger
  - signature
  - spiritConfigs
  - src
schemaVersion: 1
source: src/media/audio/sound-service.js
source_exists: true
runtime_role: SoundService
contour_primary: INS-BODY
contour_secondary: none
role_group: body_regulation
narrative_role: embodied feedback channel
used_by:
  - src/app-shell/composition/application-module.js
---

# SoundService

Loads and plays configured UI/system sound cues. Source: `proto-dev/src/media/audio/sound-service.js`.
