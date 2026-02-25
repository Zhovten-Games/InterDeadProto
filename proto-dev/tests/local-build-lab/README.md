# InterDeadProto Local Build Lab

Local Build Lab is an isolated, non-production validation harness that reproduces the CI pipeline logic on your machine without polluting `proto-dev/` sources.

## Purpose

- Reproduce the workflow stages from `.github/workflows/proto-pipeline.yml` locally.
- Validate first-load runtime behavior before GitHub Pages deployment.
- Keep local build artifacts disposable and isolated from source directories.

## Boundaries

- `proto-dev/` remains the source of truth and is never rewritten by Local Build Lab scripts.
- All compatibility rewrites (including deploy-only locale bundling substitutions) are applied only inside `.local-lab-workspace/`.
- Deploy workspace applies an additional `AssetsBaseUrlResolver` hotfix to prevent malformed `sassets` joins while keeping repository ES sources untouched.
- Local build output is disposable and isolated in `.local-dist/` by default.
- No deployment side effects: no branch push, no artifact upload, no release tagging.

## Prerequisites

- Node.js + npm available in `PATH`.
- `rsync`, `perl`, and `python3` available in `PATH`.
- Run commands from `InterDeadProto` root.

## One-command usage

### Full local pipeline

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh
```

### Full pipeline + local browser preview

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh --serve
```

### Fast smoke pipeline (build + key file verification)

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh --smoke
```

### Custom preview port

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh --serve --port 4273
```

## Optional local overrides

```bash
cp proto-dev/tests/local-build-lab/config.env.example proto-dev/tests/local-build-lab/config.env
```

Then edit `config.env` to customize output/workspace/port/build id.

## Troubleshooting

### Port is already in use

- Run with a different port:

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh --serve --port 4273
```

### Stale service worker/cache behavior

1. Open DevTools > Application > Service Workers.
2. Click **Unregister** for the local origin.
3. Open DevTools > Application > Storage.
4. Click **Clear site data**.
5. Hard-reload the page (`Ctrl+Shift+R` / `Cmd+Shift+R`).

### npm dependency issues

- Retry dependency installation inside the isolated workspace by rerunning the pipeline with forced mode:

```bash
./proto-dev/tests/local-build-lab/run-local-pipeline.sh --install-mode ci
```

If your npm cache is corrupted:

```bash
npm cache verify
```

## First-load regression checklist

Use this checklist for the issue you observed around first-load runtime behavior:

1. Start preview with `--serve`.
2. Open the reported URL in an incognito/private window.
3. Confirm first screen renders without locale 404 errors.
4. Confirm `assets/models/coco-ssd/model.json` is reachable (network 200).
5. Confirm `sw.js` is reachable and service worker registration does not break boot.
6. Watch console logs for fallback paths and verify no unexpected runtime import errors.
7. Clear service worker/cache and repeat once to ensure reproducibility.
