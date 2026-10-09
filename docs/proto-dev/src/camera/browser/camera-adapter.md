---
domains: []
emits: []
implements:
  - ICamera
imports:
  - src/camera/ports/camera-port.js
listens: []
owns:
  - _generation
  - _pausedContainer
  - _session
  - _stream
  - _streamStart
  - _videoEl
  - documentRef
  - logger
  - navigatorRef
  - state
  - timeoutMs
schemaVersion: 1
source: src/camera/browser/camera-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: CameraAdapter
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# CameraAdapter

Browser boundary владеет полученным MediaStream сразу после permission; stopStream отменяет metadata/play/frame/blob waiters и освобождает tracks/video. Позднее permission разрешается с остановкой tracks. Metadata, play, frame и encode ограничены 10 секундами; пользовательский permission prompt ждёт решения и остаётся отменяемым. Идемпотентный teardown сохраняет recoverable idle.

Проверки: `IDP-WH-CAMERA-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/camera/browser/camera-adapter.js)
