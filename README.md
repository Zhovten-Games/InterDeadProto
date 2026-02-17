# InterDeadProto

InterDeadProto is a narrative-driven interface prototype.

> **Status note:** this project is an active prototype and may contain known issues. The current implementation is provided primarily to demonstrate gameplay-oriented interaction flow and protocol-driven UX behavior.

## Monorepo structure

The repository is part of a monorepo. The active implementation of InterDeadProto is located in:

- `proto-dev/` — runtime implementation (source code, tests, build setup).
- `docs/proto-dev/` — implementation documentation for `proto-dev/`.

Related narrative/source materials are located in sibling monorepo packages, for example:

- `../InterDeadReferenceLibrary/wiki/en`

## Build and deployment

- Production artifacts are built into `dist/` from `proto-dev/` via Vite.
- The CI workflow `.github/workflows/proto-pipeline.yml` deploys `dist/` to the `proto` branch on pushes to `main`.
- The deployed app entry point is `index.html`, with assets served from `assets/`.

## Embedding on a third-party site

Yes — embedding is supported. The current runtime has two integration modes.

### 1) Full app in an iframe (recommended for external sites)

Use a plain iframe that points to your deployed `index.html` from the `proto` branch:

```html
<iframe
  src="https://<your-host>/InterDeadProto/index.html"
  title="InterDead Messenger"
  loading="lazy"
  allow="camera; microphone"
  style="width: 100%; min-height: 720px; border: 0;"
></iframe>
```

### 2) Launcher mode (same pattern used in InterDeadIT)

Use a bootstrap script tag with launcher data attributes. This creates a floating launcher button and opens the app in a modal iframe:

```html
<script
  type="module"
  src="https://<your-host>/InterDeadProto/src/infrastructure/bootstrap/index.js"
  data-interdead-embed="launcher"
  data-interdead-src="https://<your-host>/InterDeadProto/index.html"
  data-interdead-assets-base="https://<your-host>/InterDeadProto/assets/"
  data-interdead-allow="camera; microphone"
></script>
```

Notes:

- `data-interdead-embed="launcher"` switches bootstrap into launcher mode.
- `data-interdead-src` defines the iframe URL opened by the launcher.
- `data-interdead-assets-base` makes asset URL resolution explicit in embed mode.
- `data-interdead-allow` is optional; if omitted, camera and microphone are enabled by default.

## Documentation index

- **Overview:** `docs/proto-dev/overview/README.md`
- **Technical narrative (sequential):** `docs/proto-dev/technical/README.md`
- **Entry points:**
  - `docs/proto-dev/index.md`
  - `docs/proto-dev/sw.md`
- **File-level reference docs:** `docs/proto-dev/`

## Migration note (from legacy README)

Yes — the large technical narrative that previously lived in this README is now split into the sequential technical documents under `docs/proto-dev/technical/`.

Legacy README narrative mapping:

- Scope and trust model → `docs/proto-dev/technical/00-scope.md`
- Boot sequence → `docs/proto-dev/technical/01-boot-sequence.md`
- Configuration and DI → `docs/proto-dev/technical/02-configuration-and-di.md`
- Registration pipeline → `docs/proto-dev/technical/03-registration-pipeline.md`
- Dialog orchestration → `docs/proto-dev/technical/04-dialog-orchestration.md`
- Emoji protocol realization → `docs/proto-dev/technical/05-emoji-protocol.md`
- Camera quests and artifacts → `docs/proto-dev/technical/06-camera-quests.md`
- History and persistence → `docs/proto-dev/technical/07-history.md`
- Ghost switching and completion → `docs/proto-dev/technical/08-ghost-switching.md`
- Reset flow → `docs/proto-dev/technical/09-reset-flow.md`
- Narrative cross-references → `docs/proto-dev/technical/10-cross-references.md`
- Reading order for newcomers → `docs/proto-dev/technical/11-reading-order.md`

## Local development

```bash
npm ci
npm run dev
npm run build
npm run format:check
```

## Notes

- Runtime behavior is deterministic and config-driven.
- Contract data for spirits/stages is authored in `proto-dev/src/config/spirits/`.
- The current protocol realization focuses on gated flow and authored configuration, not on free-form chat validation.
