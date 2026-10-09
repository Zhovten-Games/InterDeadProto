---
schemaVersion: 1
source: src/camera/detection/detection-worker.js
source_exists: true
runtime_role: detection-worker
contour_primary: camera
role_group: capability_module
imports: []
implements: []
owns: []
listens: []
emits: []
used_by: []
---

# Detection Worker

Classic Worker загружает pinned vendored TF/COCO assets и модель, выбирает CPU backend, выполняет warmup и публикует READY. Очередь inference ограничена; request/result несут protocol и context identity. finally освобождает frame/tensors. URL параметр build ID связывает model/runtime caching с поколением distribution.

Проверки: `browser-worker-cpu-responsive`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/camera/detection/detection-worker.js)
