---
domains: []
emits: []
implements: []
imports:
  - src/config/chat.config.js
listens: []
owns: []
schemaVersion: 1
source: src/config/default.config.js
used_by:
  - src/config/index.js
---

# Default Application Configuration

Defines baseline runtime settings such as log level, chat batching, and the default ghost selection. The `textAnimation` block supplies initial/replay effects for dialog rendering, while `controlPanel.showEmojiDrum` toggles the emoji drum in the bottom panel.[^1]

Launcher and reset behavior are configured here as well: `launcher.visibility` controls whether the chat launcher is hidden until authentication, and the `reset` block governs the screen and storage/database clearing strategy for `ResetService`.[^2]

AI warmup defaults live under `ai`, including the COCO-SSD fallback model URL and warmup gating flags that drive `AiWarmupService` and `DetectionAdapter` behavior.[^3]

[^1]: Chat display defaults, ghost fallback, animations, and control panel flag [src/config/default.config.js#L1-L17](../../src/config/default.config.js#L1-L17)
[^2]: Launcher visibility and reset policy [src/config/default.config.js#L18-L25](../../src/config/default.config.js#L18-L25)
[^3]: AI warmup and fallback model settings [src/config/default.config.js#L26-L31](../../src/config/default.config.js#L26-L31)
