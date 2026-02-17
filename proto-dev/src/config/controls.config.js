import config from './index.js';
import { chatDisplayModes } from './chat.config.js';

export const controlPanelOptions = Object.freeze({
  showEmojiDrum: Boolean(config.controlPanel?.showEmojiDrum ?? true)
});

export const sections = {
  'landing-buttons': [
    { template: 'button', type: 'is-link', action: 'next', i18n: 'continue', icon: '➡️' },
    {
      template: 'language-selector',
      action: 'change-language'
    }
  ],
  'registration-buttons': [
    { template: 'import-button', action: 'import-profile', i18n: 'import', icon: '⬇️' },
    { template: 'button', type: 'is-link', action: 'next', disabled: true, i18n: 'next', icon: '➡️' }
  ],
  'registration-complete-buttons': [
    { template: 'export-button', action: 'export-profile', i18n: 'export', icon: '⬆️' },
    { template: 'button', type: 'warning', action: 'reset-account', i18n: 'resetAccount', icon: '♻️' },
    { template: 'button', type: 'is-success', action: 'finish', disabled: false, i18n: 'finish', icon: '✅' }
  ],
  'apartment-plan-buttons': [
    { template: 'button', type: 'is-link', action: 'detect-geo', disabled: false, i18n: 'detect_location', icon: '📍' },
    { template: 'button', type: 'is-link', action: 'next', disabled: true, i18n: 'next', icon: '➡️' }
  ],
  'selfie-buttons': [
    { template: 'button', action: 'finish', disabled: true, i18n: 'finish', icon: '✅' }
  ],
  'messenger-buttons': [
    { template: 'button', type: 'is-primary', action: 'post', i18n: 'post', icon: '✉️' },
    { template: 'button', action: 'toggle-camera', i18n: 'open_camera', icon: '📷' },
    { template: 'button', type: 'is-danger', action: 'reset-data', i18n: 'reset', icon: '♻️' }
  ],
  'camera-buttons': [
    { template: 'button', action: 'capture-btn', i18n: 'start_analysis', icon: '🔍' },
    { template: 'button', action: 'toggle-messenger', i18n: 'open_messenger', icon: '💬' }
  ],
  'ghost-switcher-buttons': [
    { template: 'ghost-switcher', action: 'switch-ghost', i18n: 'select_ghost' }
  ],
  // Scroll arrows are treated as independent sections so the panel
  // can toggle them per screen.
  'scroll-up': [],
  'scroll-down': []
};

export const scrollControls = {
  up: 'scroll-up',
  down: 'scroll-down'
};

const resolveScrollSections = () => {
  const mode = (config.chatDisplay?.mode || '').toLowerCase();
  return mode === chatDisplayModes.BATCH ? ['scroll-up', 'scroll-down'] : [];
};

export const createScreenMap = () => {
  const scrollSections = resolveScrollSections();
  return {
    welcome: ['landing-buttons'],
    registration: ['registration-buttons'],
    'apartment-plan': ['apartment-plan-buttons'],
    'registration-camera': ['selfie-buttons'],
    camera: ['camera-buttons'],
    // Messenger and main screens expose scroll controls for navigating
    // chat history.
    messenger: ['messenger-buttons', 'ghost-switcher-buttons', ...scrollSections],
    main: [...scrollSections]
  };
};

export const screenMap = createScreenMap();

export default sections;
