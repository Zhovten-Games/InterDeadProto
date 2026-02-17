import defaultConfig from './default.config.js';

let spiritModules = {};

if (typeof window === 'undefined') {
  // Node environment – load modules from filesystem
  const fs = await import('fs');
  const path = await import('path');
  const dir = new URL('./spirits', import.meta.url);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = await import(new URL(`./spirits/${file}`, import.meta.url));
    const name = path.basename(file, '.js');
    spiritModules[name] = mod.default;
  }
} else if (import.meta.glob) {
  // Bundler environment – eager glob import
  const modules = import.meta.glob('./spirits/*.js', { eager: true });
  spiritModules = Object.fromEntries(
    Object.entries(modules).map(([p, m]) => [p.match(/\.\/spirits\/(.*)\.js$/)[1], m.default])
  );
} else {
  // Browser without build step – explicitly import known spirits
  const names = ['guide', 'guest1'];
  for (const name of names) {
    try {
      const mod = await import(new URL(`./spirits/${name}.js`, import.meta.url));
      spiritModules[name] = mod.default;
    } catch {
      /* no-op */
    }
  }
}

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
