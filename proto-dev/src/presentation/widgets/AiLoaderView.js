import {
  AI_RETRY_REQUESTED,
  AI_STATE_CHANGED
} from '../../core/events/constants.js';

const STATE_LABELS = {
  IDLE: 'ai_loading_status',
  LOADING_RUNTIME: 'ai_loading_status',
  LOADING_MODEL: 'ai_loading_status',
  WARMUP: 'ai_loading_status',
  READY: 'ai_ready_status',
  FAILED: 'ai_failed_status'
};

export default class AiLoaderView {
  constructor(bus, languageManager = null) {
    this.bus = bus;
    this.languageManager = languageManager;
    this.overlay = this._createOverlay();
    this._handler = evt => this._handle(evt);
    this._retryHandler = () => this.bus.emit({ type: AI_RETRY_REQUESTED });
    this.aiState = 'IDLE';
    this._contactAnimating = false;
  }

  boot() {
    this.bus.subscribe(this._handler);
    this._bindActions();
    this._render();
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this._unbindActions();
  }

  _createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'app__loader app__loader--ai';
    overlay.innerHTML = `
      <div class="app__loader-content">
        <div class="app__loader-contact" data-js="ai-contact"></div>
        <div class="app__loader-status" data-js="ai-status" data-i18n="ai_loading_status"></div>
        <div class="app__loader-actions">
          <button class="app__loader-button app__loader-button--retry app__loader-button--hidden" type="button" data-js="ai-retry" data-i18n="ai_retry"></button>
        </div>
      </div>
    `;
    const container = document.querySelector('[data-js="global-content"]') || document.body;
    container.appendChild(overlay);
    this.languageManager?.applyLanguage(overlay);
    return overlay;
  }

  _bindActions() {
    const retryBtn = this.overlay.querySelector('[data-js="ai-retry"]');
    retryBtn?.addEventListener('click', this._retryHandler);
  }

  _unbindActions() {
    const retryBtn = this.overlay.querySelector('[data-js="ai-retry"]');
    retryBtn?.removeEventListener('click', this._retryHandler);
  }

  _handle(evt) {
    if (!evt || typeof evt.type !== 'string') return;
    if (evt.type === AI_STATE_CHANGED) {
      if (evt.state) {
        this.aiState = evt.state;
        this._render();
      }
      return;
    }
  }

  _render() {
    const shouldShow = this.aiState !== 'READY';
    this.overlay.classList.toggle('app__loader--visible', shouldShow);
    this._renderStatus();
    this._renderRetry();
    if (shouldShow) {
      this._animateContact();
    }
  }

  _renderStatus() {
    const statusEl = this.overlay.querySelector('[data-js="ai-status"]');
    if (!statusEl) return;
    const key = STATE_LABELS[this.aiState] || STATE_LABELS.IDLE;
    statusEl.setAttribute('data-i18n', key);
    this.languageManager?.applyLanguage(statusEl);
  }

  _renderRetry() {
    const retryBtn = this.overlay.querySelector('[data-js="ai-retry"]');
    if (!retryBtn) return;
    const showRetry = this.aiState === 'FAILED';
    retryBtn.classList.toggle('app__loader-button--hidden', !showRetry);
    this.languageManager?.applyLanguage(retryBtn);
  }

  async _animateContact() {
    if (this._contactAnimating) return;
    const contactEl = this.overlay.querySelector('[data-js="ai-contact"]');
    if (!contactEl) return;
    this._contactAnimating = true;
    const label = await this.languageManager?.translate?.('ai_contact_line', 'ui');
    const text = label || 'CONTACT ...';
    contactEl.textContent = text;
    this._contactAnimating = false;
  }
}
