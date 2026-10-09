---
domains: []
emits:
  - AI_STATE_CHANGED
implements:
  - IDetection
imports:
  - src/runtime-events/domain/null-event-bus.js
  - src/camera/ports/detection-port.js
  - src/asset-delivery/paths/assets-base-url.js
  - src/asset-delivery/cache/cache-build-id.js
  - src/runtime-events/domain/constants.js
  - src/camera/detection/worker-detection-port.js
listens: []
owns:
  - _bootPromise
  - busy
  - config
  - detectionThreshold
  - eventBus
  - generation
  - infrastructureGeneration
  - logger
  - model
  - port
  - state
schemaVersion: 1
source: src/camera/detection/detection-adapter.js
used_by:
  - src/app-shell/composition/infrastructure-module.js
source_exists: true
runtime_role: DetectionAdapter
contour_primary: THAL-GATE
contour_secondary: none
role_group: sensory_ingress
narrative_role: sensory ingress gateway
---

# DetectionAdapter

Публичный model readiness/detection contract делегирует CPU runtime, warmup и inference WorkerDetectionPort. boot/load/retry coalesce; READY следует успешному warmup. detectTarget возвращает нормализованный результат, bounds threshold 0.1–0.95, default 0.5. cancelPending инвалидирует requests без выгрузки модели; dispose завершает Worker. Main-thread inference fallback отсутствует.

Проверки: `IDP-WH-AI-001.v1; browser-worker-cpu-responsive`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/camera/detection/detection-adapter.js)
