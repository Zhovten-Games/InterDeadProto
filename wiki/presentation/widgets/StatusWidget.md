---
domains: []
emits:
  - log
implements: []
imports:
  - src/core/events/NullEventBus.js
  - src/core/events/constants.js
listens:
  - STATUS_SHOW
owns: []
schemaVersion: 1
source: src/presentation/widgets/StatusWidget.js
used_by:
  - src/infrastructure/bootstrap/modules/PresentationModule.js
---

# StatusWidget

Displays transient status messages by subscribing to `STATUS_SHOW` events over an injected bus (`NullEventBus` fallback) and updating a dedicated container in the DOM[^1][^2]. If no container exists it is created on demand, and each update is logged for diagnostics[^3].

[^1]: Event handling and bus default in [StatusWidget.js](/src/presentation/widgets/StatusWidget.js#L1-L33).
[^2]: [wiki/core/events/NullEventBus.md](../../core/events/NullEventBus.md)
[^3]: Container resolution and logging in [StatusWidget.js](/src/presentation/widgets/StatusWidget.js#L30-L53) and logging task ([`doc/log.md`](../../../doc/log.md#L1275)).
