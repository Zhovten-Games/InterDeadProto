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
PY

echo "CI compatibility overrides applied."
