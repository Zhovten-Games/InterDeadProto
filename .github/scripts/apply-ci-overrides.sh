#!/usr/bin/env bash
set -euo pipefail

# CI-only compatibility layer for GitHub Pages bundle.
# This script updates workspace files before build without committing those edits.

cat > proto-dev/src/config/index.js <<'CONFIG_EOF'
import defaultConfig from './default.config.js';
import guideConfig from './spirits/guide.js';
import guest1Config from './spirits/guest1.js';

const spiritModules = {
  guide: guideConfig,
  guest1: guest1Config,
};

const disabledSpirits = new Set();
for (const name of disabledSpirits) {
  if (spiritModules[name]) {
    delete spiritModules[name];
  }
}

const spiritName =
  (typeof window !== 'undefined' && window.APP_SPIRIT) ||
  (import.meta.env?.VITE_APP_SPIRIT) ||
  (typeof process !== 'undefined' && process.env.APP_SPIRIT) ||
  defaultConfig.defaultGhost;

const spiritConfig = spiritModules[spiritName] || {};

export const spiritConfigs = spiritModules;

export default { ...defaultConfig, ...spiritConfig };
CONFIG_EOF

python - <<'PY'
from pathlib import Path

def ensure_once(text: str, needle: str, replacement: str) -> str:
    if replacement in text:
        return text
    return text.replace(needle, replacement)

def replace_once_or_raise(text: str, old: str, new: str, error_message: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(error_message)
    return text.replace(old, new, 1)

def ensure_method_exists(text: str, signature: str, method_block: str) -> str:
    if signature in text:
        return text
    insertion_point = "  _stripAssetsPrefix(assetPath) {"
    if insertion_point not in text:
        raise RuntimeError(
            f"Failed to insert helper method {signature}: _stripAssetsPrefix insertion point not found."
        )
    return text.replace(insertion_point, f"{method_block}\n\n{insertion_point}", 1)

def replace_method_or_raise(
    text: str,
    method_signature: str,
    new_method_block: str,
    error_message: str,
) -> str:
    start = text.find(method_signature)
    if start == -1:
        raise RuntimeError(error_message)
    brace_start = text.find("{", start)
    if brace_start == -1:
        raise RuntimeError(error_message)
    depth = 0
    end = None
    for index in range(brace_start, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                end = index + 1
                break
    if end is None:
        raise RuntimeError(error_message)
    return text[:start] + new_method_block + text[end:]

state_path = Path('proto-dev/src/application/services/StateService.js')
state_text = state_path.read_text()
state_text = state_text.replace(
    "import { spiritConfigs } from '../../config/index.js';\nimport { spiritConfigs } from '../../config/index.js';\n",
    "import { spiritConfigs } from '../../config/index.js';\n",
)
state_text = ensure_once(
    state_text,
    "import defaultConfig from '../../config/button-state.config.js';\n",
    "import defaultConfig from '../../config/button-state.config.js';\nimport { spiritConfigs } from '../../config/index.js';\n",
)
state_text = state_text.replace(
    """  async _loadGhostConfig(name) {
    try {
      const mod = await import(
        new URL(`../../config/spirits/${name}.js`, import.meta.url)
      );
      this.config = deepMerge(this.config, mod.default);
    } catch (err) {
      this.logger?.warn?.(`No override for ghost: ${name}`);
    }
  }
""",
    """  async _loadGhostConfig(name) {
    const spiritConfig = spiritConfigs?.[name];
    if (!spiritConfig) {
      this.logger?.warn?.(`No override for ghost: ${name}`);
      return;
    }

    this.config = deepMerge(this.config, spiritConfig);
  }
""",
)
state_path.write_text(state_text)


dialog_path = Path('proto-dev/src/application/services/DialogOrchestratorService.js')
dialog_text = dialog_path.read_text()
dialog_text = dialog_text.replace(
    """  async _loadConfig(name) {
    const mod = await import(
      new URL(`../../config/spirits/${name}.js`, import.meta.url)
    );
    return mod.default;
  }
""",
    """  async _loadConfig(name) {
    return this.spiritConfigs?.[name] || {};
  }
""",
)
dialog_path.write_text(dialog_text)

assets_path = Path('proto-dev/src/config/assetsBaseUrl.js')
assets_text = assets_path.read_text()

assets_text = ensure_method_exists(
    assets_text,
    '_ensureTrailingSlash(path)',
    """  _ensureTrailingSlash(path) {
    if (!path) return '/';
    return path.endsWith('/') ? path : `${path}/`;
    }
""",
)

assets_text = ensure_method_exists(
    assets_text,
    '_normalizeRuntimeRoot(path)',
    """  _normalizeRuntimeRoot(path) {
    const normalized = this._ensureTrailingSlash(path);
    if (normalized === '/s/') return '/';
    return normalized;
  }
""",
)

if "const appRoot = this._ensureTrailingSlash(url.pathname.slice(0, sourceIndex + 1));" in assets_text:
    assets_text = replace_once_or_raise(
        assets_text,
        "const appRoot = this._ensureTrailingSlash(url.pathname.slice(0, sourceIndex + 1));",
        "const appRoot = this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1));",
        "Failed to rewrite module URL runtime root normalization usage.",
    )
if "const appRoot = this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1));" not in assets_text:
    assets_text = replace_once_or_raise(
        assets_text,
        "const appRoot = url.pathname.slice(0, sourceIndex + 1);",
        "const appRoot = this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1));",
        "Failed to rewrite legacy module URL appRoot computation.",
    )

if "const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);" not in assets_text:
    assets_text = replace_once_or_raise(
        assets_text,
        "if (url.origin === 'null') return `${directoryPath}assets/`;\n      return `${url.origin}${directoryPath}assets/`;",
        "const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);\n      if (url.origin === 'null') return `${normalizedDirectory}assets/`;\n      return `${url.origin}${normalizedDirectory}assets/`;",
        "Failed to rewrite location URL runtime root normalization usage.",
    )

desired_normalize_base_url_method = """  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return 'assets/';
    const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (this._isAbsolute(normalized) || normalized.startsWith('/')) return normalized;
    if (normalized === 'assets/') return normalized;

    const fromModule = this._resolveFromModuleUrl();
    if (fromModule) {
      try {
        return new URL(normalized, fromModule).toString();
      } catch (_error) {
        // Fallback to location-based resolution.
      }
    }

    const fromLocation = this._resolveFromLocationUrl();
    if (fromLocation) {
      try {
        return new URL(normalized, fromLocation).toString();
      } catch (_error) {
        // Keep original relative path as the final fallback.
      }
    }

    return normalized;
  }"""
if desired_normalize_base_url_method not in assets_text:
    assets_text = replace_method_or_raise(
        assets_text,
        "  _normalizeBaseUrl(baseUrl) {",
        desired_normalize_base_url_method,
        'Failed to replace _normalizeBaseUrl method in workspace override script.',
    )

if 'if (!fromModule) return normalized;' in assets_text:
    raise RuntimeError('AssetsBaseUrlResolver hotfix was not applied in workspace override script.')

if "if (normalized === 'assets/') return normalized;" not in assets_text:
    raise RuntimeError("Explicit assets/ base preservation was not applied in workspace override script.")

if 'const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);' not in assets_text:
    raise RuntimeError('Runtime root normalization hotfix for location URL was not applied.')

if 'this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1))' not in assets_text:
    raise RuntimeError('Runtime root normalization hotfix for module URL was not applied.')

if 'this._normalizeRuntimeRoot(' in assets_text and '_normalizeRuntimeRoot(path)' not in assets_text:
    raise RuntimeError('_normalizeRuntimeRoot helper is missing after patch application.')

assets_path.write_text(assets_text)

db_path = Path('proto-dev/src/adapters/database/DatabaseAdapter.js')
db_text = db_path.read_text()
db_text = ensure_once(
    db_text,
    "      const initOptions = {\n        locateFile: (file) => `${basePath}${file}`,\n      };\n",
    "      const initOptions = {\n        locateFile: (file) => `${basePath}${file}`,\n      };\n      this.logger?.info?.(`[DatabaseService] SQL.js base path: ${basePath}`);\n",
)
db_text = ensure_once(
    db_text,
    "      if (!this._initSqlJs && this._isBrowserRuntime()) {\n        initOptions.wasmBinary = await this._fetchWasmBinary(`${basePath}sql-wasm.wasm`);\n      }\n",
    "      if (!this._initSqlJs && this._isBrowserRuntime()) {\n        const wasmUrl = `${basePath}sql-wasm.wasm`;\n        this.logger?.info?.(`[DatabaseService] SQL.js wasm URL: ${wasmUrl}`);\n        initOptions.wasmBinary = await this._fetchWasmBinary(wasmUrl);\n      }\n",
)
db_path.write_text(db_text)

PY

echo "CI compatibility overrides applied."
