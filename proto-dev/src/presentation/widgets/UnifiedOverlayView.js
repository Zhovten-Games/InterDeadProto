import { AI_RETRY_REQUESTED } from '../../core/events/constants.js';

const MULTI_TAB_GUARD_BYPASS_KEY = 'interdead_disable_multi_tab_guard';

export default class UnifiedOverlayView {
  constructor(orchestrator, bus, languageManager = null, windowRef = null, documentRef = null) {
    this.orchestrator = orchestrator;
    this.bus = bus;
    this.languageManager = languageManager;
    this.windowRef = windowRef || (typeof window !== 'undefined' ? window : null);
    this.documentRef = documentRef || (typeof document !== 'undefined' ? document : null);
    this.overlayRoot = null;
    this.state = null;
    this.unsubscribe = null;
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
    this.overlayRoot = this._ensureSingleRoot();
    this.unsubscribe = this.orchestrator.subscribe((state) => {
      this.state = state;
      this._render();
    });
  }

  dispose() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this._booted = false;
  }

  _ensureSingleRoot() {
    const doc = this.documentRef;
    const existing = [...doc.querySelectorAll('.app__loader')];
    const container = doc.querySelector('[data-js="global-content"]') || doc.body;

    // Single overlay host invariant: only UnifiedOverlayView may own `.app__loader` root.
    let root = existing[0] || doc.createElement('div');
    if (!existing[0]) {
      root.className = 'app__loader app__loader--ai app__loader--unified';
      container.appendChild(root);
    }

    root.classList.add('app__loader--unified', 'app__loader--ai');
    existing.slice(1).forEach((staleNode) => staleNode.remove());
    return root;
  }

  _render() {
    if (!this.overlayRoot || !this.state) return;
    this.overlayRoot.classList.toggle('app__loader--visible', this.state.visible);
    this.overlayRoot.innerHTML = this.state.visible ? this._buildMarkup() : '';
    this._bindActions();
    this.languageManager?.applyLanguage(this.overlayRoot);
  }

  _buildMarkup() {
    const mode = this.state.mode;
    const cards = this.state.cards;
    const activeCard =
      cards.find((card) => card.id === this.state.activeCardId) || cards[0] || null;

    if (mode === 'single') {
      return activeCard ? this._renderCard(activeCard) : '';
    }

    if (mode === 'tabs') {
      return `
        <div class="app__loader-content app__loader-content--tabs">
          <div class="app__loader-tabs" data-js="overlay-tabs">
            ${cards
              .map(
                (card) => `
                  <button
                    type="button"
                    class="app__loader-button app__loader-tab ${card.id === this.state.activeCardId ? 'app__loader-tab--active' : ''}"
                    data-js="overlay-tab"
                    data-overlay-card-id="${card.id}"
                  >${card.id}</button>
                `,
              )
              .join('')}
          </div>
          ${activeCard ? this._renderCard(activeCard, true) : ''}
        </div>
      `;
    }

    return `
      <div class="app__loader-content app__loader-content--stack">
        ${cards.map((card) => this._renderCard(card, true)).join('')}
      </div>
    `;
  }

  _renderCard(card, nested = false) {
    return `
      <article class="${nested ? 'app__loader-card' : 'app__loader-content'}" data-overlay-card="${card.id}">
        <div class="app__loader-contact" data-js="overlay-contact-${card.id}" ${card.contactKey ? `data-i18n="${card.contactKey}"` : ''}>${card.contactText || ''}</div>
        <div class="app__loader-status" data-js="overlay-status-${card.id}" ${card.statusKey ? `data-i18n="${card.statusKey}"` : ''}>${card.statusText || ''}</div>
        <div class="app__loader-warning ${card.warningKey || card.warningText ? '' : 'app__loader-warning--hidden'}" data-js="overlay-warning-${card.id}" ${card.warningKey ? `data-i18n="${card.warningKey}"` : ''}>${card.warningText || ''}</div>
        <div class="app__loader-actions">
          ${card.actions
            .map(
              (action) => `
                <button
                  class="app__loader-button ${action.hidden ? 'app__loader-button--hidden' : ''}"
                  type="button"
                  data-js="overlay-action"
                  data-action-kind="${action.kind || ''}"
                  data-action-event="${action.eventType || ''}"
                  data-action-storage-key="${action.storageKey || ''}"
                  data-action-storage-value="${action.storageValue || ''}"
                  data-action-reload="${action.reload ? '1' : '0'}"
                  ${action.i18nKey ? `data-i18n="${action.i18nKey}"` : ''}
                >${action.label || ''}</button>
              `,
            )
            .join('')}
        </div>
      </article>
    `;
  }

  _bindActions() {
    this.overlayRoot.querySelectorAll('[data-js="overlay-tab"]').forEach((button) => {
      button.addEventListener('click', () => {
        const cardId = button.getAttribute('data-overlay-card-id');
        this.orchestrator.setActiveCard(cardId);
      });
    });

    this.overlayRoot.querySelectorAll('[data-js="overlay-action"]').forEach((button) => {
      button.addEventListener('click', () => this._handleAction(button));
    });
  }

  _handleAction(button) {
    const kind = button.getAttribute('data-action-kind');
    if (kind === 'retry_ai') {
      this.bus.emit({ type: button.getAttribute('data-action-event') || AI_RETRY_REQUESTED });
      return;
    }

    if (kind === 'disable_multi_tab_guard') {
      const storageKey =
        button.getAttribute('data-action-storage-key') || MULTI_TAB_GUARD_BYPASS_KEY;
      const storageValue = button.getAttribute('data-action-storage-value') || '1';
      try {
        this.windowRef?.localStorage?.setItem(storageKey, storageValue);
      } catch {
        // Ignore storage restrictions and still attempt reload.
      }
      if (button.getAttribute('data-action-reload') === '1') {
        this.windowRef?.location?.reload?.();
      }
    }
  }
}
