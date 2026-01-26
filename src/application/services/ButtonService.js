import IEventBus from '../../ports/IEventBus.js';
import {
  APP_RESET_REQUESTED,
  PROFILE_IMPORT_REQUESTED,
  PROFILE_EXPORT_REQUESTED
} from '../../core/events/constants.js';

export default class ButtonService {
  constructor(templateService, languageManager, profileRegService, bus, persistence = null) {
    /** @type {IEventBus} */
    this.templateService = templateService;
    this.languageManager = languageManager;
    this.profileRegService = profileRegService;
    this.bus = bus;
    this.storage = persistence;

    this._handler = evt => {
      if (evt.type === 'BUTTON_ACTION') {
        this.handleAction(evt);
      }
    };
    this.bus.subscribe(this._handler);
  }

  async boot() {}

  dispose() {
    this.bus.unsubscribe(this._handler);
  }

  async renderButtons(defs = []) {
    const parts = await Promise.all(
      defs.map(d => {
        const data = {
          ...d,
          icon: d.icon || '',
          i18nKey: d.i18n || d.action
        };
        return this.templateService.render(`buttons/${d.template}`, data);
      })
    );
    return parts.join('');
  }

  async init(container, defs) {
    const html = await this.renderButtons(defs);
    this.bus.emit({ type: 'BUTTONS_RENDER', container, html });
  }

  async handleAction(evt) {
    const { action, value } = evt;
    if (action === 'change-language') {
      this.languageManager.setLanguage(value);
      return;
    }
    if (action === 'capture-btn') {
      this.bus.emit({ type: 'capture-btn' });
      return;
    }
    if (action === 'import-profile') {
      this.bus.emit({ type: PROFILE_IMPORT_REQUESTED });
      return;
    }
    if (action === 'export-profile') {
      this.bus.emit({ type: PROFILE_EXPORT_REQUESTED });
      return;
    }
    if (action === 'reset-account') {
      const payload = { source: 'button' };
      if (value && typeof value === 'object') {
        payload.options = value;
      }
      this.bus.emit({ type: APP_RESET_REQUESTED, payload });
      return;
    }
    if (action === 'enter-name' && this.profileRegService) {
      this.profileRegService.setName(value);
      this.bus.emit({
        type: 'NEXT_BUTTON_ENABLE',
        enabled: this.profileRegService.canProceed()
      });
      this.bus.emit({ type: 'enter-name', payload: { value } });
      return;
    }
    const payload = value !== undefined ? { value } : undefined;
    this.bus.emit({ type: action, payload });
  }
}

