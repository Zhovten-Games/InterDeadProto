# Application Overview

InterDeadProto is a **narrative-driven interface prototype**. The active implementation in this mono-repo is located under `proto-dev/`, and its runtime remains deterministic and configuration-driven.

## What this implementation is (and is not)

- **Implemented:** staged dialog orchestration, gated input handling, reaction acknowledgements, camera quests, reboot/reset flows, and persistence-backed recovery.
- **Not implemented:** a universal protocol validator or free-form two-human chat channel.
- **Hard-configured behavior:** UI states and stage logic are authored in `proto-dev/src/config/`.

## How to navigate the docs

1. **Technical narrative:** [`docs/proto-dev/technical/README.md`](../technical/README.md).
2. **Implementation reference:** file-level docs under [`docs/proto-dev/src/`](../src/) (for example [`docs/proto-dev/src/application`](../src/application/) and [`docs/proto-dev/src/presentation`](../src/presentation/)).
3. **Runtime entry points:** [`docs/proto-dev/index.md`](../index.md) and [`docs/proto-dev/sw.md`](../sw.md).
4. **Narrative materials:** [`InterDeadReferenceLibrary/wiki/en`](../../../InterDeadReferenceLibrary/wiki/en/).


## Current proto limitations

- Direct free-form user messaging is intentionally disabled in this prototype runtime.
- Dialog responses are deterministic and hard-coded/configured as NIRO-style generated output.
