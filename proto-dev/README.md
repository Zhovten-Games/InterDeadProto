# proto-dev

> This application should be perceived as an art prototype for the game world: imperfect, but the original starting point of the whole direction. Learn more: [interdead.phantom-draft.com/about](https://interdead.phantom-draft.com/about/).

InterDeadProto `proto-dev` is a narrative-driven interface prototype (ES6 modules).

## Repository links

- Implementation directory (clean URL): [github.com/Zhovten-Games/InterDeadProto/proto-dev](https://github.com/Zhovten-Games/InterDeadProto/proto-dev)
- Build/deploy target branch: [github.com/Zhovten-Games/InterDeadProto/tree/proto](https://github.com/Zhovten-Games/InterDeadProto/tree/proto)

## Documentation map

- Runtime docs root: [`../docs/proto-dev`](../docs/proto-dev/)
- Application overview: [`../docs/proto-dev/overview/README.md`](../docs/proto-dev/overview/README.md)
- Technical narrative: [`../docs/proto-dev/technical/README.md`](../docs/proto-dev/technical/README.md)
- Source-level implementation docs (mirrors `proto-dev/src`): [`../docs/proto-dev/src`](../docs/proto-dev/src/)
- Tests docs: [`../docs/proto-dev/tests`](../docs/proto-dev/tests/)
- Assets docs: [`../docs/proto-dev/assets`](../docs/proto-dev/assets/)
- Deployment policy and targets: [`../docs/proto-dev/deployment/README.md`](../docs/proto-dev/deployment/README.md)

## Scope notes

- The current version does **not** provide free user-authored communication flow.
- User-visible responses are hard-coded/configured and orchestrated as a deterministic NIRO-like generated flow.
- Related narrative references:
  - [InterDead application article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/InterDead_application.md)
  - [Emoji Protocol article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/Emoji_Protocol.md)
  - [NIRO article](../InterDeadReferenceLibrary/wiki/en/Technologies_and_protocols/Niro.md)

## Chat embedding and host integration

### 1) Generic integration (third-party sites, no InterDead window API)

Use this mode when you only want to embed the prototype and do not depend on host-side InterDead APIs.

- Option A (recommended): embed via iframe and point it to your deployed `proto-dev` URL.
- Option B: open `proto-dev` in a standalone tab/window from your host UI.

Minimal iframe example:

```html
<iframe
  src="https://<your-proto-host>/"
  title="InterDeadProto Chat"
  loading="lazy"
  allow="camera; microphone; geolocation; fullscreen; clipboard-read; clipboard-write"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

Compatibility notes:

- The prototype is not limited to iframe-only launch and can run as a standalone page.
- Camera-dependent stages still require HTTPS (or `localhost`) and browser permission consent.
- In generic mode, host pages should not assume custom window-to-window contracts.

### 2) InterDeadIT host integration (our production path)

Our site uses `InterDeadIT/themes/InterDead/static/js/interdead-proto-loader.js` with data markers in host HTML.

- Host markers define launcher mode (`inline` iframe or `external` tab).
- In inline mode, loader configures iframe permissions and referrer policy.
- In external mode, loader opens a controlled popup/tab and keeps host UI state aligned.

For implementation details see:

- InterDeadIT loader script docs and source map.
- Camera/iframe requirements: `InterDeadIT/docs/ui/interdead-embed-camera.md`.

## Deployment compatibility policy

Deployment compatibility rewrites are intentionally script-driven and are applied only in isolated workspaces/artifacts.
Canonical ES module sources in `src/` must remain unchanged for host-specific path semantics.

`proto-dev` deploys to both Cloudflare and itch.io, therefore path/root differences must be handled in pipeline scripts instead of source-level ad hoc edits.

## Local development

Before every push, run the Local Build Lab pipeline directly from [`./tests/local-build-lab`](./tests/local-build-lab/README.md) and do not rely only on automated CI checks.

```bash
npm ci
npm run dev
npm run build
npm run format:check
```

## Overlay architecture migration note

The project now uses a **single overlay host** (`UnifiedOverlayView`) backed by `OverlayOrchestratorService`.
Boot and AI loaders are state publishers only, and they must never render their own `.app__loader` roots.
This prevents duplicate overlays, keeps priority rules deterministic, and centralizes overlay actions (including multi-tab guard bypass).


## Overlay event-driven transition policy and resilience guards

`OverlayOrchestratorService` now manages an explicit stage lifecycle (`pre_boot`, `boot_done`, `ai_warmup`, `ready`, `blocked`) and applies transition policy from events.

- `OVERLAY_SHOW('loading')` activates `loading`.
- `OVERLAY_HIDE` moves stage beyond boot and hides transient boot card.
- `AI_STATE_CHANGED` keeps `ai_loading` visible until AI reaches `READY`.
- `app_already_open` is a blocker and always preempts other overlay cards until explicitly dismissed.

Reliability guards:

- Idempotent updates with duplicate-event dedup prevent visual oscillation.
- Per-entry diagnostics include `lastUpdatedAt` and global transition timestamps.
- Optional TTL for transient entries (e.g. `loading`) protects against stale visible cards.
- Illegal backward stage transitions are rejected unless a forced transition or explicit `reset()` is used.

Invariant: the app has a single overlay host and deterministic final card state under event storms.


## Overlay contact-line contract

- All overlay contact headers must come from i18n keys.
- Contact headers must use technical style and start with the locale-equivalent of "Contact".
- The no-JavaScript blocker is delivered via the `<noscript>` fallback in `index.html`.
