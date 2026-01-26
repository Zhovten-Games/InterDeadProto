import NullEventBus from '../../../core/events/NullEventBus.js';
import {
  CHAT_SCROLL_UP,
  CHAT_SCROLL_DOWN,
  DIALOG_AWAITING_INPUT_CHANGED
} from '../../../core/events/constants.js';
import { scrollControls } from '../../../config/controls.config.js';

export default class ControlPanel {
  static HIDDEN_CLASS = 'panel--hidden';
  constructor(
    controlsConfig,
    screenMap,
    buttonService,
    languageService,
    selector = '[data-js="bottom-panel"]',
    bus = new NullEventBus(),
    showEmojiDrum = true
  ) {
    this.controls = controlsConfig;
    this.screenMap = screenMap;
    this.buttonService = buttonService;
    this.languageService = languageService;
    this.selector = selector;
    this.bus = bus;
    this.showEmojiDrum = showEmojiDrum;
    this.templateUrl = '/src/presentation/templates/panel.html';
    this.currentScreen = null;
    this._awaiting = { awaits: false };
    this._handler = evt => {
      if (evt.type === 'SCREEN_CHANGE') {
        this.render(evt.screen);
      }
      if (evt.type === DIALOG_AWAITING_INPUT_CHANGED && this._panel) {
        this._awaiting = evt;
        this._updateNavHighlight();
      }
      if (evt.type === 'CAMERA_TOGGLE' && this._panel) {
        // Deprecated: camera/messenger buttons are now screen-specific.
      }
    };
    this._scrollUpHandler = () => this.bus.emit({ type: CHAT_SCROLL_UP });
    this._scrollDownHandler = () => this.bus.emit({ type: CHAT_SCROLL_DOWN });
    this._scrollUpBtn = null;
    this._scrollDownBtn = null;
  }

  init() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this._scrollUpBtn?.removeEventListener('click', this._scrollUpHandler);
    this._scrollDownBtn?.removeEventListener('click', this._scrollDownHandler);
    this._scrollUpBtn = null;
    this._scrollDownBtn = null;
  }

  async loadTemplate() {
    if (!this._template) {
      const res = await fetch(this.templateUrl);
      this._template = await res.text();
    }
    return this._template;
  }

  async render(currentScreen) {
    const container = typeof this.selector === 'string' ? document.querySelector(this.selector) : this.selector;
    if (!container) return;
    this._scrollUpBtn?.removeEventListener('click', this._scrollUpHandler);
    this._scrollDownBtn?.removeEventListener('click', this._scrollDownHandler);
    const html = await this.loadTemplate();
    container.innerHTML = html;
    const panel = container.querySelector('[data-js="panel-controls"]');
    if (!panel) return;
    this._panel = panel;
    this.currentScreen = currentScreen;
    // Toggle emoji drum visibility per screen
    const drum = panel.querySelector('.panel__mask');
    const showDrum = this.showEmojiDrum && currentScreen === 'messenger';
    drum?.classList.toggle(ControlPanel.HIDDEN_CLASS, !showDrum);
    const root = document.documentElement;
    root.style.setProperty(
      '--chat-panel-height',
      showDrum ? 'var(--panel-height)' : 'var(--panel-height-collapsed)'
    );
    // hide all sections
    Object.keys(this.controls).forEach(key => {
      const el = panel.querySelector(`[data-js="${key}"]`);
      if (el) el.classList.add(ControlPanel.HIDDEN_CLASS);
    });
    const sections = this.screenMap[currentScreen] || [];
    for (const key of sections) {
      const section = panel.querySelector(`[data-js="${key}"]`);
      if (!section) continue;
      section.classList.remove(ControlPanel.HIDDEN_CLASS);
      const defs = this.controls[key] || [];
      await this.buttonService.init(section, defs);
    }
    const scrollUp = panel.querySelector(`[data-js="${scrollControls.up}"]`);
    const scrollDown = panel.querySelector(`[data-js="${scrollControls.down}"]`);
    // Delegate scroll requests to ChatScrollService via the EventBus.
    scrollUp?.addEventListener('click', this._scrollUpHandler);
    scrollDown?.addEventListener('click', this._scrollDownHandler);
    this._scrollUpBtn = scrollUp;
    this._scrollDownBtn = scrollDown;
    this.languageService.applyLanguage(container);
    this._updateNavHighlight();
  }

  _updateNavHighlight() {
    if (!this._panel) return;
    const { awaits, targetScreen } = this._awaiting;
    const needHighlight =
      awaits && targetScreen && targetScreen !== this.currentScreen;
    const camBtn = this._panel.querySelector('[data-js="toggle-camera"]');
    const msgBtn = this._panel.querySelector('[data-js="toggle-messenger"]');
    if (targetScreen === 'camera') {
      camBtn?.classList.toggle('active', needHighlight);
      msgBtn?.classList.remove('active');
    } else if (targetScreen === 'messenger') {
      msgBtn?.classList.toggle('active', needHighlight);
      camBtn?.classList.remove('active');
    } else {
      camBtn?.classList.remove('active');
      msgBtn?.classList.remove('active');
    }
  }
}
