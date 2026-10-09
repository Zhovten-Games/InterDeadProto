#!/usr/bin/env bash
# Legacy shell import surface: the assembler owns every transformation/copy.
resolve_repo_root() {
  local lab_dir
  lab_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "$lab_dir/../.." && pwd
}
run_shared_assembly() {
  local project_root
  project_root="$(resolve_repo_root)"
  node "$project_root/../build/assemble.mjs" --diagnostic
}
