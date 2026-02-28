---
domains: []
emits:
  - SCREEN_CHANGE
implements: []
imports: []
listens: []
owns: []
schemaVersion: 1
source: src/infrastructure/bootstrap/FullAppBootstrapper.js
used_by:
  - src/infrastructure/bootstrap/modules/InfrastructureModule.js
---

# FullAppBootstrapper

Bootstraps the full application experience. It installs a `beforeunload` handler to dispose of all boot manager services, starts logging and loader overlays, and then uses the loader to orchestrate boot steps and initialize view/presentation services.[^1]

After booting, it restores persisted state by checking local persistence and falling back to database data. Depending on whether the user has completed capture, it emits `SCREEN_CHANGE` to route to messenger, registration, or welcome screens while keeping local auth readiness in sync.[^2]

[^1]: Boot sequence, loader usage, and screen visibility adjustments [src/infrastructure/bootstrap/FullAppBootstrapper.js#L10-L30](../../../src/infrastructure/bootstrap/FullAppBootstrapper.js#L10-L30)
[^2]: State restoration and screen selection [src/infrastructure/bootstrap/FullAppBootstrapper.js#L33-L70](../../../src/infrastructure/bootstrap/FullAppBootstrapper.js#L33-L70)
