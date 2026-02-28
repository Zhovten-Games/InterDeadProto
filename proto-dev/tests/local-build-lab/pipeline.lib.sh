#!/usr/bin/env bash

PIPELINE_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_step() {
  printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

ensure_command() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

resolve_repo_root() {
  local script_dir current
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  current="$script_dir"

  while [[ "$current" != "/" ]]; do
    if [[ -f "$current/package.json" ]]; then
      echo "$current"
      return 0
    fi
    current="$(dirname "$current")"
  done

  die "Unable to resolve project root from ${script_dir}"
}

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    log_step "Loading overrides from ${env_file}"
    # shellcheck disable=SC1090
    source "$env_file"
  fi
}

prepare_clean_dir() {
  local dir="$1"
  rm -rf "$dir"
  mkdir -p "$dir"
}

verify_repo_localization_adapter() {
  local project_root="$1"
  local adapter_path="$project_root/src/adapters/ui/LocalizationAdapter.js"

  [[ -f "$adapter_path" ]] || die "Localization adapter not found: ${adapter_path}"

  if grep -q 'import.meta.glob(' "$adapter_path"; then
    die "Repository localization adapter must stay in URL/basePath mode. Found import.meta.glob in ${adapter_path}"
  fi
}

sync_workspace() {
  local project_root="$1"
  local workspace_dir="$2"

  prepare_clean_dir "$workspace_dir"

  log_step "Syncing project to isolated workspace: ${workspace_dir}"
  rsync -a --delete \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.local-dist' \
    --exclude '.local-lab-workspace' \
    --exclude 'tests/local-build-lab/.tmp' \
    "$project_root/" "$workspace_dir/"
}

install_dependencies() {
  local workspace_dir="$1"

  pushd "$workspace_dir" >/dev/null
  if [[ -d node_modules ]]; then
    log_step "Installing dependencies with guarded npm install"
    npm install --no-fund --no-audit
  else
    log_step "Installing dependencies with npm ci"
    npm ci --no-fund --no-audit
  fi
  popd >/dev/null
}

resolve_canonical_ci_override_script() {
  local lab_dir proto_dev_root monorepo_root canonical_script

  lab_dir="$PIPELINE_LIB_DIR"
  proto_dev_root="$(cd "$lab_dir/../.." && pwd)"
  monorepo_root="$(cd "$proto_dev_root/.." && pwd)"
  canonical_script="$monorepo_root/.github/scripts/apply-ci-overrides.sh"

  if [[ -f "$canonical_script" ]]; then
    echo "$canonical_script"
  fi
}

run_canonical_ci_overrides_for_workspace() {
  local workspace_dir="$1"
  local canonical_script="$2"
  local temp_root

  temp_root="$(mktemp -d)"
  ln -s "$workspace_dir" "$temp_root/proto-dev"

  pushd "$temp_root" >/dev/null
  bash "$canonical_script"
  popd >/dev/null

  rm -rf "$temp_root"
}

assert_assetsbaseurl_hotfix() {
  local assets_path="$1/src/config/assetsBaseUrl.js"

  [[ -f "$assets_path" ]] || die "AssetsBaseUrlResolver file not found in isolated workspace: ${assets_path}"

  grep -Fq 'this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1))' "$assets_path" \
    || die "Missing module runtime root normalization marker in ${assets_path}"

  grep -Fq 'const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);' "$assets_path" \
    || die "Missing location runtime root normalization marker in ${assets_path}"

  if grep -q 'if (!fromModule) return normalized;' "$assets_path"; then
    die "Legacy early-return branch is still present in ${assets_path}"
  fi
}

apply_ci_overrides() {
  local workspace_dir="$1"
  local workspace_ci_script="$workspace_dir/.github/scripts/apply-ci-overrides.sh"
  local canonical_ci_script

  [[ "$workspace_dir" == *".local-lab-workspace"* ]] || die "Refusing to apply overrides outside isolated workspace: ${workspace_dir}"

  if [[ -f "$workspace_ci_script" ]]; then
    pushd "$workspace_dir" >/dev/null
    log_step "Applying CI compatibility overrides from workspace script"
    ./.github/scripts/apply-ci-overrides.sh
    popd >/dev/null
  else
    canonical_ci_script="$(resolve_canonical_ci_override_script)"
    [[ -n "$canonical_ci_script" ]] || die "Canonical CI override script was not found in monorepo: .github/scripts/apply-ci-overrides.sh"

    log_step "Applying canonical CI compatibility overrides from monorepo root"
    run_canonical_ci_overrides_for_workspace "$workspace_dir" "$canonical_ci_script"
  fi

  log_step "Verifying AssetsBaseUrl normalization markers"
  assert_assetsbaseurl_hotfix "$workspace_dir"
}

run_build() {
  local workspace_dir="$1"
  local build_id="$2"

  pushd "$workspace_dir" >/dev/null
  log_step "Building with VITE_CACHE_BUILD_ID=${build_id}"
  VITE_CACHE_BUILD_ID="$build_id" npm run build:deploy
  popd >/dev/null
}

mirror_static_assets() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Mirroring static assets into isolated output"
  mkdir -p "$output_dir/assets"
  cp -R "$workspace_dir/assets/." "$output_dir/assets/"

  test -f "$output_dir/assets/images/logo.png"
  test -f "$output_dir/assets/audio/ghost_effect.mp3"
}

ensure_runtime_libs() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Ensuring runtime libraries"
  mkdir -p "$output_dir/assets/libs/db"

  if [[ ! -f "$output_dir/assets/libs/db/sql-wasm.wasm" ]]; then
    if [[ -f "$workspace_dir/assets/libs/db/sql-wasm.wasm" ]]; then
      cp "$workspace_dir/assets/libs/db/sql-wasm.wasm" "$output_dir/assets/libs/db/sql-wasm.wasm"
    elif [[ -f "$workspace_dir/node_modules/sql.js/dist/sql-wasm.wasm" ]]; then
      cp "$workspace_dir/node_modules/sql.js/dist/sql-wasm.wasm" "$output_dir/assets/libs/db/sql-wasm.wasm"
    else
      die "sql-wasm.wasm not found"
    fi
  fi

  for lib in tf.min.js coco-ssd.min.js; do
    if [[ ! -f "$output_dir/assets/libs/${lib}" ]]; then
      if [[ -f "$workspace_dir/assets/libs/${lib}" ]]; then
        cp "$workspace_dir/assets/libs/${lib}" "$output_dir/assets/libs/${lib}"
      else
        die "${lib} not found"
      fi
    fi
  done
}

ensure_coco_model() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Ensuring COCO-SSD model files"
  [[ -d "$workspace_dir/assets/models/coco-ssd" ]] || die "COCO-SSD model folder not found"

  mkdir -p "$output_dir/assets/models/coco-ssd"
  cp -R "$workspace_dir/assets/models/coco-ssd/." "$output_dir/assets/models/coco-ssd/"
  test -f "$output_dir/assets/models/coco-ssd/model.json"
}

ensure_templates() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Ensuring HTML templates"
  [[ -d "$workspace_dir/src/presentation/templates" ]] || die "templates source folder not found"

  rm -rf "$output_dir/src/presentation/templates"
  mkdir -p "$output_dir/src/presentation/templates"
  cp -R "$workspace_dir/src/presentation/templates/." "$output_dir/src/presentation/templates/"
  test -f "$output_dir/src/presentation/templates/welcome.html"
}

ensure_i18n() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Mirroring i18n locales into isolated output"
  [[ -d "$workspace_dir/src/i18n/locales" ]] || die "i18n locales source folder not found"

  rm -rf "$output_dir/i18n" "$output_dir/src/i18n" "$output_dir/assets/i18n"
  mkdir -p "$output_dir/i18n/locales" "$output_dir/src/i18n/locales" "$output_dir/assets/i18n/locales"

  cp -R "$workspace_dir/src/i18n/locales/." "$output_dir/i18n/locales/"
  cp -R "$workspace_dir/src/i18n/locales/." "$output_dir/src/i18n/locales/"
  cp -R "$workspace_dir/src/i18n/locales/." "$output_dir/assets/i18n/locales/"

  test -f "$output_dir/src/i18n/locales/en/ui.json"
}

ensure_service_worker() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Ensuring service worker"
  if [[ ! -f "$output_dir/sw.js" ]]; then
    [[ -f "$workspace_dir/sw.js" ]] && cp "$workspace_dir/sw.js" "$output_dir/sw.js"
  fi

  test -f "$output_dir/sw.js"
}

ensure_favicon() {
  local workspace_dir="$1"
  local output_dir="$2"

  log_step "Ensuring favicon"
  if [[ ! -f "$output_dir/favicon.ico" ]]; then
    if [[ -f "$workspace_dir/assets/favicons/favicon.ico" ]]; then
      cp "$workspace_dir/assets/favicons/favicon.ico" "$output_dir/favicon.ico"
    elif [[ -f "$workspace_dir/favicon.ico" ]]; then
      cp "$workspace_dir/favicon.ico" "$output_dir/favicon.ico"
    fi
  fi

  test -f "$output_dir/favicon.ico"
}

patch_output_paths() {
  local output_dir="$1"

  log_step "Applying safe path fixes and removing sourcemaps"
  shopt -s globstar nullglob
  local targets=("$output_dir"/**/*.js "$output_dir/index.html")

  perl -pi -e 's|"/src/|"src/|g; s|'\''/src/|'\''src/|g' "${targets[@]}" || true
  perl -pi -e 's|\.\./i18n/|i18n/|g; s|\.\.i18n/|i18n/|g' "${targets[@]}" || true
  perl -pi -e 's|href="/favicon\.ico"|href="favicon.ico"|g; s|href='\''/favicon\.ico'\''|href='\''favicon.ico'\''|g' "$output_dir/index.html" || true
  perl -pi -e 's@^\s*//# sourceMappingURL=.*$@@mg; s@/\*# sourceMappingURL=.*?\*/@@g' "$output_dir"/**/*.js || true
  rm -f "$output_dir"/**/*.map || true
}

verify_smoke_files() {
  local output_dir="$1"

  log_step "Verifying smoke build files"
  test -f "$output_dir/index.html"
  test -d "$output_dir/src"
  find "$output_dir/src" -maxdepth 1 -type f -name 'index-*.js' | grep -q .
}

verify_key_files() {
  local output_dir="$1"

  log_step "Verifying key runtime files"
  test -f "$output_dir/index.html"
  test -f "$output_dir/assets/libs/db/sql-wasm.wasm"
  test -f "$output_dir/assets/libs/tf.min.js"
  test -f "$output_dir/assets/libs/coco-ssd.min.js"
  test -f "$output_dir/assets/models/coco-ssd/model.json"
  test -f "$output_dir/src/presentation/templates/welcome.html"
  test -f "$output_dir/src/i18n/locales/en/ui.json"
  test -f "$output_dir/i18n/locales/en/ui.json"
  test -f "$output_dir/assets/images/logo.png"
  test -f "$output_dir/sw.js"
  test -f "$output_dir/favicon.ico"
}

serve_output() {
  local output_dir="$1"
  local port="$2"

  ensure_command python3
  ensure_command curl

  log_step "Starting static preview server on port ${port}"
  python3 -m http.server "$port" --directory "$output_dir" >"$output_dir/.preview.log" 2>&1 &
  PREVIEW_SERVER_PID=$!

  cleanup_server() {
    if [[ -n "${PREVIEW_SERVER_PID:-}" ]] && kill -0 "$PREVIEW_SERVER_PID" >/dev/null 2>&1; then
      kill "$PREVIEW_SERVER_PID" >/dev/null 2>&1 || true
    fi
  }
  trap cleanup_server EXIT INT TERM

  local base_url="http://127.0.0.1:${port}"
  local health_paths=(
    "/index.html"
    "/assets/models/coco-ssd/model.json"
    "/sw.js"
  )

  for path in "${health_paths[@]}"; do
    local ok=""
    for _ in {1..40}; do
      if curl -fsS "${base_url}${path}" >/dev/null; then
        ok="1"
        break
      fi
      sleep 0.25
    done
    [[ -n "$ok" ]] || die "Health check failed for ${base_url}${path}"
  done

  echo
  echo "Local preview is ready."
  echo "URL: ${base_url}"
  echo
  echo "Recommended first-load validation steps:"
  echo "1) Open an incognito/private window and navigate to ${base_url}"
  echo "2) Use hard reload (Ctrl+Shift+R / Cmd+Shift+R)"
  echo "3) In DevTools > Application > Service Workers, click 'Unregister'"
  echo "4) In DevTools > Application > Storage, clear site data before re-check"
  echo
  echo "Press Ctrl+C to stop the local preview server."

  wait "$PREVIEW_SERVER_PID"
}
