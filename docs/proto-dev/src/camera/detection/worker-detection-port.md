---
schemaVersion: 1
source: src/camera/detection/worker-detection-port.js
source_exists: true
runtime_role: WorkerDetectionPort
contour_primary: camera
role_group: capability_module
imports: []
implements: []
owns:
  - activeFrame
  - nextId
  - onState
  - readyPromise
  - requests
  - timeoutMs
  - worker
  - workerFactory
listens:
  - state
emits: []
used_by:
  - src/camera/detection/detection-adapter.js
---

# WorkerDetectionPort

Владеет Worker, request IDs, bounded in-flight requests и 60-second timers. Protocol version 1 включает session/context и структурированный result/error. Отмена завершает waiters и отбрасывает late response; transferable bitmap закрывается при ошибке/завершении. Несовместимый protocol или worker failure дают явный отказ.

Проверки: `IDP-WH-AI-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/camera/detection/worker-detection-port.js)
