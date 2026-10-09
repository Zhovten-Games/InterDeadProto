import defaultConfig from '../configuration/default-config.js';
import guideConfig from '../../spirit-contacts/configuration/guide.js';
import guest1Config from '../../spirit-contacts/configuration/guest1.js';

// The registry is canonical in Node, unbundled browsers and production builds.
export const spiritConfigs = Object.freeze({ guide: guideConfig, guest1: guest1Config });
const spiritName =
  (typeof window !== 'undefined' && window.APP_SPIRIT) ||
  import.meta.env?.VITE_APP_SPIRIT ||
  (typeof process !== 'undefined' && process.env.APP_SPIRIT) ||
  defaultConfig.defaultGhost;
export default { ...defaultConfig, ...(spiritConfigs[spiritName] || {}) };
