export default class HostModalAdapter {
  constructor({ windowRef = null, documentRef = null, logger = console } = {}) {
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.logger = logger || console;
    this._internal = null;
  }

  open(node) {
    const port = this._getPort();
    if (port?.open) {
      try {
        port.open(node);
        return;
      } catch (err) {
        this.logger?.warn?.('[InterDead][Embed] Host modal open failed', err);
      }
    }
    this._openInternal(node);
  }

  close() {
    const port = this._getPort();
    if (port?.close) {
      try {
        port.close();
        return;
      } catch (err) {
        this.logger?.warn?.('[InterDead][Embed] Host modal close failed', err);
      }
    }
    this._closeInternal();
  }

  _getPort() {
    if (!this.windowRef) return null;
    const direct = this.windowRef.InterdeadPorts?.modal;
    if (direct) return direct;
    if (this.windowRef.parent && this.windowRef.parent !== this.windowRef) {
      try {
        return this.windowRef.parent?.InterdeadPorts?.modal || null;
      } catch (err) {
        this.logger?.warn?.('[InterDead][Embed] Unable to access parent modal port', err);
      }
    }
    return null;
  }

  _openInternal(node) {
    if (!this.documentRef) return;
    if (!this._internal) {
      this._internal = this._createInternalModal();
    }
    const { overlay, content } = this._internal;
    if (node && content.firstChild !== node) {
      content.innerHTML = '';
      content.appendChild(node);
    }
    overlay.classList.add('interdead-launcher-modal--visible');
  }

  _closeInternal() {
    if (!this._internal) return;
    this._internal.overlay.classList.remove('interdead-launcher-modal--visible');
  }

  _createInternalModal() {
    const overlay = this.documentRef.createElement('div');
    overlay.className = 'interdead-launcher-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const content = this.documentRef.createElement('div');
    content.className = 'interdead-launcher-modal__content';
    overlay.appendChild(content);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        this._closeInternal();
      }
    });
    this.documentRef.body.appendChild(overlay);
    return { overlay, content };
  }
}
