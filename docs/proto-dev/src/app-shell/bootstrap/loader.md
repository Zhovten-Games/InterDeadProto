---
domains: []
emits:
  - OVERLAY_HIDE
  - OVERLAY_SHOW
implements: []
imports: []
listens:
  - BOOT_COMPLETE
  - BOOT_DONE
  - BOOT_START
  - LEADER_ACK
  - LEADER_PING
owns:
  - _attached
  - _channelHandler
  - _leaderCleanup
  - _leaderTimer
  - _loadPromise
  - _storageHandler
  - _unloadHandler
  - bcHeartbeat
  - bootHandler
  - bootState
  - bus
  - channel
  - generation
  - heartbeat
  - heartbeatInterval
  - isLeader
  - logger
  - multiTabGuardBypassed
  - storage
  - storageOk
  - tabId
  - timeout
  - unloadHandlerRegistered
schemaVersion: 1
source: src/app-shell/bootstrap/loader.js
used_by:
  - src/app-shell/composition/presentation-module.js
source_exists: true
runtime_role: Loader
contour_primary: FPN-COMMAND
contour_secondary: none
role_group: executive_control
narrative_role: executive coordination hub
---

# Loader

Constructor только принимает ports. boot владеет host/window subscriptions, timers и BroadcastChannel; dispose удаляет их идемпотентно. load выполняет объявленную startup task и связывает completion с текущим lifecycle. Процент загрузки — presentation state, authoritative readiness приходит от bootstrap и AI lifecycle.

Проверки: `IDP-WH-BOOT-001.v1`. Public exports, методы, imports, state fields и consumers
зафиксированы в source-topology.json; путь пересматривается по IDP-DEV-010.

[Canonical source](../../../../../proto-dev/src/app-shell/bootstrap/loader.js)
