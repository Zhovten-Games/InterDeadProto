export default class ChatLauncherWidget {
  constructor({ documentRef = null, language = null, logger = console } = {}) {
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.language = language;
    this.logger = logger || console;
    this.root = null;
    this.button = null;
    this._openHandler = null;
  }

  render() {
    if (!this.documentRef || this.root) return;
    this._ensureStyles();
    const container = this.documentRef.createElement('div');
    container.className = 'interdead-launcher';
    const button = this.documentRef.createElement('button');
    button.type = 'button';
    button.className = 'interdead-launcher__button';
    button.setAttribute('data-i18n-title', 'open_messenger');
    button.innerHTML = `
      <span class="interdead-launcher__orb" aria-hidden="true"></span>
      <span class="sr-only" data-i18n="open_messenger"></span>
    `;
    container.appendChild(button);
    this.documentRef.body.appendChild(container);
    this.root = container;
    this.button = button;
    this.language?.applyLanguage?.(this.root);
    if (this._openHandler) {
      this.button.addEventListener('click', this._openHandler);
    }
  }

  onOpen(handler) {
    if (this.button && this._openHandler) {
      this.button.removeEventListener('click', this._openHandler);
    }
    this._openHandler = handler;
    if (this.button && handler) {
      this.button.addEventListener('click', handler);
    }
  }

  setVisible(visible) {
    if (!this.root) return;
    this.root.classList.toggle('interdead-launcher--hidden', !visible);
  }

  dispose() {
    if (this.button && this._openHandler) {
      this.button.removeEventListener('click', this._openHandler);
    }
    this.root?.remove?.();
    this.root = null;
    this.button = null;
    this._openHandler = null;
  }

  _ensureStyles() {
    if (!this.documentRef) return;
    const id = 'interdead-launcher-styles';
    if (this.documentRef.getElementById(id)) return;
    const style = this.documentRef.createElement('style');
    style.id = id;
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      .interdead-launcher {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 2147483000;
        pointer-events: auto;
      }
      .interdead-launcher--hidden {
        display: none;
      }
      .interdead-launcher__button {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 1px solid rgba(138, 229, 144, 0.8);
        background: radial-gradient(circle at 30% 30%, rgba(138, 229, 144, 0.45), rgba(0, 30, 10, 0.8));
        box-shadow: 0 0 18px rgba(138, 229, 144, 0.4);
        display: grid;
        place-items: center;
        cursor: pointer;
      }
      .interdead-launcher__orb {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid rgba(138, 229, 144, 0.9);
        animation: interdead-launcher-pulse 2.2s ease-in-out infinite;
        box-shadow: 0 0 12px rgba(138, 229, 144, 0.6);
      }
      @keyframes interdead-launcher-pulse {
        0%, 100% { transform: scale(0.95); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 1; }
      }
      .interdead-launcher-modal {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2147482990;
      }
      .interdead-launcher-modal--visible {
        display: flex;
      }
      .interdead-launcher-modal__content {
        width: min(960px, 92vw);
        height: min(90vh, 720px);
        background: #0b140c;
        border: 1px solid rgba(138, 229, 144, 0.4);
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
        overflow: hidden;
        position: relative;
      }
      .interdead-launcher-modal__iframe {
        border: 0;
        width: 100%;
        height: 100%;
      }
    `;
    this.documentRef.head?.appendChild(style);
  }
}
