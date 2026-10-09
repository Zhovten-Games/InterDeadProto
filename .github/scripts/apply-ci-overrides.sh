#!/usr/bin/env bash
set -euo pipefail
# Legacy entry point retained as a read-only compatibility validation.
# Runtime fixes are canonical. Full isolated assembly: npm --prefix proto-dev run assemble.
node build/check-source.mjs
