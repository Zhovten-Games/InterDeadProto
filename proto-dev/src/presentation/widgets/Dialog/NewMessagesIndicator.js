/**
 * Lightweight controller for the "new messages" CTA shown above the bottom panel.
 * It keeps DOM concerns isolated from DialogWidget so message rendering stays focused.
 */
export default class NewMessagesIndicator {
  constructor(container, languageService, i18nKey = 'chat_new_messages') {
    this.container = container;
    this.language = languageService;
    this.i18nKey = i18nKey;
    this.button = null;
    this._clickHandler = null;
  }

  async ensure() {
    if (this.button || !this.container) return this.button;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dialog__new-messages dialog__new-messages--hidden';
    button.setAttribute('data-js', 'dialog-new-messages');
    button.setAttribute('data-i18n', this.i18nKey);
    this.container.appendChild(button);
    this.button = button;

    if (typeof this.language?.translate === 'function') {
      const localized = await this.language.translate(this.i18nKey, 'ui');
      if (typeof localized === 'string' && localized.trim().length > 0) {
        button.textContent = localized;
      }
    }

    if (typeof this.language?.applyLanguage === 'function') {
      await this.language.applyLanguage(button);
    }

    if (!button.textContent || button.textContent.trim().length === 0) {
      button.textContent = 'New messages';
    }

    return this.button;
  }

  async show(onClick) {
    const button = await this.ensure();
    if (!button) return;

    if (this._clickHandler) {
      button.removeEventListener('click', this._clickHandler);
    }

    this._clickHandler = typeof onClick === 'function' ? onClick : null;
    if (this._clickHandler) {
      button.addEventListener('click', this._clickHandler);
    }

    button.classList.remove('dialog__new-messages--hidden');
  }

  hide() {
    if (!this.button) return;
    if (this._clickHandler) {
      this.button.removeEventListener('click', this._clickHandler);
      this._clickHandler = null;
    }
    this.button.classList.add('dialog__new-messages--hidden');
  }

  dispose() {
    if (!this.button) return;
    this.hide();
    this.button.remove();
    this.button = null;
  }
}
