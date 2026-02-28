#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/pipeline.lib.sh"

PROJECT_ROOT="$(resolve_repo_root)"
LAB_ROOT="$PROJECT_ROOT/tests/local-build-lab"
WORKSPACE_DIR="$PROJECT_ROOT/.local-lab-workspace"
OUTPUT_DIR="$PROJECT_ROOT/.local-dist"
ENV_FILE="$LAB_ROOT/config.env"
PORT="4173"
SERVE="0"
SMOKE="0"
INSTALL_MODE="auto"

usage() {
  cat <<USAGE
Usage: tests/local-build-lab/run-local-pipeline.sh [options]

Options:
  --serve                 Start local preview server after build
  --smoke                 Fast mode: install + build + verify only
  --port <port>           Preview server port (default: 4173)
  --output <dir>          Isolated output directory (default: .local-dist)
  --workspace <dir>       Isolated workspace directory (default: .local-lab-workspace)
  --env-file <file>       Optional env override file (default: tests/local-build-lab/config.env)
  --install-mode <mode>   auto|ci|install (default: auto)
  --help                  Show this help message
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --serve)
      SERVE="1"
      shift
      ;;
    --smoke)
      SMOKE="1"
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --workspace)
      WORKSPACE_DIR="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --install-mode)
      INSTALL_MODE="$2"
      shift 2
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ "$INSTALL_MODE" =~ ^(auto|ci|install)$ ]] || die "Invalid install mode: $INSTALL_MODE"

ensure_command npm
ensure_command perl
ensure_command rsync

load_env_file "$ENV_FILE"

BUILD_ID="${VITE_CACHE_BUILD_ID:-local-$(date +%Y%m%d%H%M%S)}"
PORT="${LOCAL_BUILD_PORT:-$PORT}"
OUTPUT_DIR="${LOCAL_BUILD_OUTPUT_DIR:-$OUTPUT_DIR}"
WORKSPACE_DIR="${LOCAL_BUILD_WORKSPACE_DIR:-$WORKSPACE_DIR}"

log_step "Local pipeline started"
log_step "Project root: $PROJECT_ROOT"
log_step "Workspace dir: $WORKSPACE_DIR"
log_step "Output dir: $OUTPUT_DIR"

[[ "$WORKSPACE_DIR" == *".local-lab-workspace"* ]] || die "Workspace must be an isolated .local-lab-workspace path"
verify_repo_localization_adapter "$PROJECT_ROOT"

sync_workspace "$PROJECT_ROOT" "$WORKSPACE_DIR"

if [[ "$INSTALL_MODE" == "ci" ]]; then
  log_step "Installing dependencies with forced npm ci"
  (cd "$WORKSPACE_DIR" && npm ci --no-fund --no-audit)
elif [[ "$INSTALL_MODE" == "install" ]]; then
  log_step "Installing dependencies with forced npm install"
  (cd "$WORKSPACE_DIR" && npm install --no-fund --no-audit)
else
  install_dependencies "$WORKSPACE_DIR"
fi

apply_ci_overrides "$WORKSPACE_DIR"
run_build "$WORKSPACE_DIR" "$BUILD_ID"

prepare_clean_dir "$OUTPUT_DIR"
cp -R "$WORKSPACE_DIR/dist/." "$OUTPUT_DIR/"

if [[ "$SMOKE" == "0" ]]; then
  mirror_static_assets "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_runtime_libs "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_coco_model "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_templates "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_i18n "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_service_worker "$WORKSPACE_DIR" "$OUTPUT_DIR"
  ensure_favicon "$WORKSPACE_DIR" "$OUTPUT_DIR"
  patch_output_paths "$OUTPUT_DIR"
  verify_key_files "$OUTPUT_DIR"
else
  log_step "Smoke mode enabled: running build + smoke verification only"
  if [[ "$SERVE" == "1" ]]; then
    log_step "Preparing minimal runtime files required for preview health checks"
    ensure_coco_model "$WORKSPACE_DIR" "$OUTPUT_DIR"
    ensure_service_worker "$WORKSPACE_DIR" "$OUTPUT_DIR"
  fi
  verify_smoke_files "$OUTPUT_DIR"
fi
log_step "Local pipeline completed successfully"

if [[ "$SERVE" == "1" ]]; then
  serve_output "$OUTPUT_DIR" "$PORT"
else
  echo
  echo "Output is ready in: $OUTPUT_DIR"
  echo "Run with --serve to launch a local preview server."
fi
