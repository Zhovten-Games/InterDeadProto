# InterDeadProto Local Build Lab

Local Build Lab is an isolated, non-production validation harness that reproduces the CI pipeline logic on your machine without polluting source files.

## Purpose

- Reproduce the workflow stages from `.github/workflows/proto-pipeline.yml` locally.
- Validate first-load runtime behavior before GitHub Pages deployment.
- Keep local build artifacts disposable and isolated from source directories.
- Attach local InterDeadCore packages selectively or in bulk for integration checks inside the isolated workspace.

## Why path rewrites are script-driven (intentional policy)

- Environment-specific path compatibility fixes are intentionally applied by shell scripts on build workspace/artifacts.
- Canonical ES module sources in `proto-dev/src` are intentionally left unchanged for deployment-host differences.
- This is not an accidental workaround; it is a stability policy to prevent source drift and make compatibility behavior auditable.
- The same policy is used to guard against recurring malformed runtime paths (including historical `sassets/...` regressions).

## Boundaries

- Project root remains the source of truth and is never rewritten by Local Build Lab scripts.
- All compatibility rewrites (including deploy-only locale bundling substitutions) are applied only inside `.local-lab-workspace/`.
- Local Build Lab executes the canonical CI override script from monorepo root (`.github/scripts/apply-ci-overrides.sh`) against the isolated workspace, even when that script is outside the synced `proto-dev` subtree.
- This guarantees behavioral parity with CI for `AssetsBaseUrlResolver` runtime root normalization and prevents malformed `sassets/libs/...` requests while keeping repository ES sources untouched.
- Local build output is disposable and isolated in `.local-dist/` by default.
- No deployment side effects: no branch push, no artifact upload, no release tagging.

## Prerequisites

- Node.js + npm available in `PATH`.
- `rsync`, `perl`, and `python3` available in `PATH`.
- Run commands from `InterDeadProto/proto-dev` root.

## One-command usage

### Full local pipeline

```bash
./tests/local-build-lab/run-local-pipeline.sh
```

### Full pipeline + local browser preview

```bash
./tests/local-build-lab/run-local-pipeline.sh --serve
```

### Fast smoke pipeline (build + key file verification)

```bash
./tests/local-build-lab/run-local-pipeline.sh --smoke
```

### Custom preview port

```bash
./tests/local-build-lab/run-local-pipeline.sh --serve --port 4273
```

## Optional local overrides

```bash
cp tests/local-build-lab/config.env.example tests/local-build-lab/config.env
```

Then edit `config.env` to customize output/workspace/port/build id.

## Troubleshooting

### Port is already in use

- Run with a different port:

```bash
./tests/local-build-lab/run-local-pipeline.sh --serve --port 4273
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
./tests/local-build-lab/run-local-pipeline.sh --install-mode ci
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

## FAQ

### `sassets` appears in runtime requests again

1. Re-run the pipeline and inspect override logs for these steps: `Applying canonical CI compatibility overrides from monorepo root` and `Verifying AssetsBaseUrl normalization markers`.
2. Open `.local-lab-workspace/src/config/assetsBaseUrl.js` and confirm normalization markers are present:
   - `this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1))`
   - `const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);`
3. If markers are missing, verify `.github/scripts/apply-ci-overrides.sh` exists at monorepo root and that local lab can resolve it.

## Local package workspace (analog of local-auth-overlay flow)

Local Build Lab now supports a local package workflow similar to `InterDeadIT/tests/local-auth-overlay`:

1. Resolve packages from `--local-packages-root` (default `../../InterDeadCore`) and `--local-package-map` overrides.
2. Prepare package copies/symlinks in `tests/local-build-lab/packages-workspace` (or custom workspace).
3. Optionally install/build each selected package when `dist/` is missing (or force with explicit flag).
4. Temporarily link prepared packages into isolated workspace `node_modules`.
5. Automatically restore original workspace dependencies on exit (success or failure).

Priority rule: CLI flags override values from `tests/local-build-lab/config.env`.

### Local package options

- `--local-packages all`
- `--local-packages @interdead/framework,@interdead/identity-core`
- `--local-packages-root <path>`
- `--local-packages-workspace <path>`
- `--local-packages-prepare-mode <copy|link>` (default: `copy`)
- `--local-package-map <name>=<path>` (can be repeated)
- `--skip-local-package-build` (never builds; fails if `dist/` is missing)
- `--force-local-package-build`
- `--cleanup-local-packages-workspace` (cleanup runs during restore, after links are removed)

### Example: run pipeline with all local packages

```bash
./tests/local-build-lab/run-local-pipeline.sh \
  --local-packages all \
  --local-packages-root ../../InterDeadCore
```

### Example: attach a single local package from a custom path

```bash
./tests/local-build-lab/run-local-pipeline.sh \
  --local-packages @interdead/framework \
  --local-package-map @interdead/framework=../../../InterDeadCore/framework
```


### Optional env shortcuts

`config.env` can also include:

- `LOCAL_PACKAGES`
- `LOCAL_PACKAGES_ROOT`
- `LOCAL_PACKAGES_WORKSPACE_DIR` (or `LOCAL_PACKAGES_WORKSPACE`)
- `LOCAL_PACKAGE_MAP` as comma-separated values (for example: `name=path,name2=path2`)

If no package names/maps are provided, local package flow is intentionally skipped even when a root path is set.
