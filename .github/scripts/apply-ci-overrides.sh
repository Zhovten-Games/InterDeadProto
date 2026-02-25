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

if '_ensureTrailingSlash(path)' not in assets_text:
    assets_text = assets_text.replace(
        """    const sourceMarker = '/src/';
    const sourceIndex = url.pathname.lastIndexOf(sourceMarker);
    if (sourceIndex !== -1) {
      const appRoot = url.pathname.slice(0, sourceIndex + 1);
      if (url.origin === 'null') return `${appRoot}assets/`;
      return `${url.origin}${appRoot}assets/`;
    }
""",
        """    const sourceMarker = '/src/';
    const sourceIndex = url.pathname.lastIndexOf(sourceMarker);
    if (sourceIndex !== -1) {
      const appRoot = this._ensureTrailingSlash(url.pathname.slice(0, sourceIndex + 1));
      if (url.origin === 'null') return `${appRoot}assets/`;
      return `${url.origin}${appRoot}assets/`;
    }
""",
    )

    assets_text = assets_text.replace(
        """  _stripAssetsPrefix(assetPath) {
""",
        """  _ensureTrailingSlash(path) {
    if (!path) return '/';
    return path.endsWith('/') ? path : `${path}/`;
  }

  _normalizeRuntimeRoot(path) {
    const normalized = this._ensureTrailingSlash(path);
    if (normalized === '/s/') return '/';
    return normalized;
  }

  _stripAssetsPrefix(assetPath) {
""",
    )

if 'this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1))' not in assets_text:
    assets_text = assets_text.replace(
        """    const sourceMarker = '/src/';
    const sourceIndex = url.pathname.lastIndexOf(sourceMarker);
    if (sourceIndex !== -1) {
      const appRoot = this._ensureTrailingSlash(url.pathname.slice(0, sourceIndex + 1));
      if (url.origin === 'null') return `${appRoot}assets/`;
      return `${url.origin}${appRoot}assets/`;
    }
""",
        """    const sourceMarker = '/src/';
    const sourceIndex = url.pathname.lastIndexOf(sourceMarker);
    if (sourceIndex !== -1) {
      const appRoot = this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1));
      if (url.origin === 'null') return `${appRoot}assets/`;
      return `${url.origin}${appRoot}assets/`;
    }
""",
    )

if 'const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);' not in assets_text:
    assets_text = assets_text.replace(
        """      const directoryPath = hasTrailingSlash
        ? pathname
        : looksLikeFile
          ? pathname.slice(0, pathname.lastIndexOf('/') + 1)
          : `${pathname}/`;
      if (url.origin === 'null') return `${directoryPath}assets/`;
      return `${url.origin}${directoryPath}assets/`;
""",
        """      const directoryPath = hasTrailingSlash
        ? pathname
        : looksLikeFile
          ? pathname.slice(0, pathname.lastIndexOf('/') + 1)
          : `${pathname}/`;
      const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);
      if (url.origin === 'null') return `${normalizedDirectory}assets/`;
      return `${url.origin}${normalizedDirectory}assets/`;
""",
    )

if 'if (!fromModule) return normalized;' in assets_text:
    assets_text = assets_text.replace(
        """  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return 'assets/';
    const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (this._isAbsolute(normalized) || normalized.startsWith('/')) return normalized;

    const fromModule = this._resolveFromModuleUrl();
    if (!fromModule) return normalized;

    if (normalized === 'assets/' && fromModule.endsWith('/assets/')) {
      return fromModule;
    }

    try {
      return new URL(normalized, fromModule).toString();
    } catch (_error) {
      return normalized;
    }

    const fromLocation = this._resolveFromLocationUrl();
    if (fromLocation) {
      if (normalized === 'assets/' && fromLocation.endsWith('/assets/')) {
        return fromLocation;
      }
      try {
        return new URL(normalized, fromLocation).toString();
      } catch (_error) {
        // Keep original relative path as the final fallback.
      }
    }

    return normalized;
  }
""",
        """  _normalizeBaseUrl(baseUrl) {
    if (!baseUrl) return 'assets/';
    const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    if (this._isAbsolute(normalized) || normalized.startsWith('/')) return normalized;

    const fromModule = this._resolveFromModuleUrl();
    if (fromModule) {
      if (normalized === 'assets/' && fromModule.endsWith('/assets/')) {
        return fromModule;
      }
      try {
        return new URL(normalized, fromModule).toString();
      } catch (_error) {
        // Fallback to location-based resolution.
      }
    }

    const fromLocation = this._resolveFromLocationUrl();
    if (fromLocation) {
      if (normalized === 'assets/' && fromLocation.endsWith('/assets/')) {
        return fromLocation;
      }
      try {
        return new URL(normalized, fromLocation).toString();
      } catch (_error) {
        // Keep original relative path as the final fallback.
      }
    }

    return normalized;
  }
""",
    )

if 'if (!fromModule) return normalized;' in assets_text:
    raise RuntimeError('AssetsBaseUrlResolver hotfix was not applied in workspace override script.')

if 'const normalizedDirectory = this._normalizeRuntimeRoot(directoryPath);' not in assets_text:
    raise RuntimeError('Runtime root normalization hotfix for location URL was not applied.')

if 'this._normalizeRuntimeRoot(url.pathname.slice(0, sourceIndex + 1))' not in assets_text:
    raise RuntimeError('Runtime root normalization hotfix for module URL was not applied.')

assets_path.write_text(assets_text)

PY

echo "CI compatibility overrides applied."
