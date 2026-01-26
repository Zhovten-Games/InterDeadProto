export default class ButtonAdapter {
  /**
   * @param {import('../../ports/IEventBus.js').default} bus
   * @param {object} languageManager
   */
  constructor(bus, languageManager) {
    this.bus = bus;
    this.languageManager = languageManager;
    this.bus.subscribe(evt => {
      if (evt.type === 'BUTTONS_RENDER') {
        this.render(evt.container, evt.html);
      }
    });
  }

  render(container, html) {
    if (!container) return;
    container.innerHTML = html;
    this.languageManager.applyLanguage(container);
    this.attach(container);
  }

  attach(container) {
    container.querySelectorAll('[data-action]').forEach(el => {
      const action = el.getAttribute('data-action');
      let evtName = 'click';
      if (action === 'change-language' && el.tagName === 'SELECT') {
        evtName = 'change';
      } else if (el.tagName === 'INPUT') {
        evtName = 'input';
      }
      el.addEventListener(evtName, () => {
        const value = el.value || el.getAttribute('data-lang');
        this.bus.emit({ type: 'BUTTON_ACTION', action, value });
      });
    });
  }
}

