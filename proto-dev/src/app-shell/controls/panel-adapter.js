import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import {
  AI_STATE_CHANGED,
  BUTTON_VISIBILITY_UPDATED,
  DRUM_LAYOUT_UPDATED,
  GHOST_UNLOCKED,
} from '../../runtime-events/domain/constants.js';
import IPanel from '../ports/panel-port.js';
import ButtonLabelTruncator from './presentation/button-label-truncator.js';

export default class PanelAdapter extends IPanel {
  static HIDDEN_CLASS = 'panel--hidden';
  constructor(
    templateService,
    buttonService,
    languageManager,
    controls,
    screenMap,
    profileRegService,
    stateService,
    buttonStateService,
    buttonVisibilityService,
    ghostService,
    ghostSwitchService,
    spiritConfigs,
    dualityManager,
    modalService = null,
    eventBus = new NullEventBus(),
    containerSelector = '[data-js="bottom-panel"]',
    drumLayoutService = null,
    showEmojiDrum = true,
  ) {
    super();
    this.templateService = templateService;
    this.buttonService = buttonService;
    this.languageManager = languageManager;
    this.controls = controls;
    this.screenMap = screenMap;
    this.profileRegService = profileRegService;
    this.stateService = stateService;
    this.buttonStateService = buttonStateService;
    this.buttonVisibilityService = buttonVisibilityService;
    this.ghostService = ghostService;
    this.ghostSwitchService = ghostSwitchService;
    this.spiritConfigs = spiritConfigs || {};
    this.dualityManager = dualityManager;
    this.modalService = modalService;
    this.eventBus = eventBus;
    this.containerSelector = containerSelector;
    this.drumLayoutService = drumLayoutService;
    this.panelContainer = null;
    this.currentScreen = null;
    this.showEmojiDrum = showEmojiDrum;
    this.labelTruncator = new ButtonLabelTruncator({
      documentRef: typeof document !== 'undefined' ? document : null,
      getLanguage: () => this.languageManager?.current || '',
    });
  }

  boot() {
    if (this._handler) return;
    this._handler = async (evt) => {
      if (!evt || !this.panelContainer) return;
      if (evt.type === 'BUTTON_STATE_UPDATED' && evt.screen === this.currentScreen) {
        await this.update(this.panelContainer, { screen: evt.screen });
        return;
      }
      if (evt.type === BUTTON_VISIBILITY_UPDATED && evt.screen === this.currentScreen) {
        await this.update(this.panelContainer, { screen: evt.screen });
        return;
      }
      if (evt.type === AI_STATE_CHANGED) {
        await this.update(this.panelContainer, { screen: this.currentScreen });
        return;
      }
      if (evt.type === 'GHOST_CONTEXT_COMMITTED') {
        await this.update(this.panelContainer, { screen: this.currentScreen });
        return;
      }
      if (evt.type === DRUM_LAYOUT_UPDATED) {
        const layout = Array.isArray(evt.layout)
          ? evt.layout
          : this.drumLayoutService?.getLayout?.();
        this._applyDrumLayout(this.panelContainer, layout);
        return;
      }
      if (evt.type === 'QUEST_STARTED') {
        const req = this.dualityManager?.getRequirement?.();
        if (req && (req.type === 'object' || req.type === 'presence')) {
          const camBtn = this.panelContainer.querySelector('[data-js="toggle-camera"]');
          camBtn?.classList.add('active');
        }
        return;
      }
      if (evt.type === 'QUEST_COMPLETED') {
        const camBtn = this.panelContainer.querySelector('[data-js="toggle-camera"]');
        camBtn?.classList.remove('active');
        return;
      }
      if (evt.type === GHOST_UNLOCKED) {
        await this.update(this.panelContainer, { screen: this.currentScreen });
        const container = this.panelContainer.querySelector('[data-js="ghost-switcher-buttons"]');
        container?.classList.add('ghost-switcher--highlight');
        clearTimeout(this._highlightTimer);
        this._highlightTimer = setTimeout(
          () => container?.classList.remove('ghost-switcher--highlight'),
          1000,
        );
      }
    };
    this.eventBus.subscribe(this._handler);
  }

  dispose() {
    if (this._handler) this.eventBus.unsubscribe(this._handler);
    this._handler = null;
    clearTimeout(this._highlightTimer);
    this._loadRevision = (this._loadRevision || 0) + 1;
    this._updateRevision = (this._updateRevision || 0) + 1;
    this.labelTruncator.dispose?.();
  }

  async load(context = {}) {
    const revision = (this._loadRevision = (this._loadRevision || 0) + 1);
    try {
      const html = await this.templateService.render('panel');
      if (revision !== this._loadRevision) return;
      const container =
        typeof this.containerSelector === 'string'
          ? document.querySelector(this.containerSelector)
          : this.containerSelector;
      if (container) {
        container.innerHTML = html;
        const el = container.querySelector('[data-js="panel-controls"]');
        if (el) {
          this.panelContainer = el;
          this.currentScreen = context.screen;
          await this.update(el, context);
          if (revision !== this._loadRevision) return;
          this._applyDrumLayout(el);
          this.languageManager.applyLanguage(container);
        }
      }
    } catch (err) {
      this.templateService.logger?.error(err.message);
    }
  }

  async update(panelContainer, context = {}) {
    if (!panelContainer) return;
    const revision = (this._updateRevision = (this._updateRevision || 0) + 1);
    if (context.screen) {
      this.currentScreen = context.screen;
    }

    const drum = panelContainer.querySelector('.panel__mask');
    const showDrum = this.showEmojiDrum && this.currentScreen === 'messenger';
    drum?.classList.toggle(PanelAdapter.HIDDEN_CLASS, !showDrum);
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    root?.style.setProperty(
      '--chat-panel-height',
      showDrum ? 'var(--panel-height)' : 'var(--panel-height-collapsed)',
    );
    this._applyDrumLayout(panelContainer);

    const allKeys = Object.keys(this.controls);
    for (const key of allKeys) {
      const el = panelContainer.querySelector(`[data-js="${key}"]`);
      if (el) el.classList.add(PanelAdapter.HIDDEN_CLASS);
    }

    const keys = this.screenMap?.[context.screen] || [];
    for (const key of keys) {
      const section = panelContainer.querySelector(`[data-js="${key}"]`);
      if (section) {
        section.classList.remove(PanelAdapter.HIDDEN_CLASS);
        const defs = this.controls[key];
        if (defs?.length) {
          await this.buttonService.init(section, defs);
          if (revision !== this._updateRevision) return;
          this.languageManager.applyLanguage(section);
        }
      }
    }

    const langSelect = panelContainer.querySelector('[data-js="language-selector"]');
    if (langSelect) {
      langSelect.value = this.languageManager.current;
    }

    let selectableGhosts = [];
    const currentGhost = this.ghostService.getCurrentGhost().name;
    if (context.screen === 'messenger') {
      const container = panelContainer.querySelector('[data-js="ghost-switcher-buttons"]');
      const select = container?.querySelector('[data-js="ghost-select"]');
      if (select) {
        select.innerHTML = '';
        selectableGhosts = this.ghostSwitchService.getAvailable(this.spiritConfigs, currentGhost);
        for (const name of selectableGhosts) {
          const ghostConfig = this.spiritConfigs?.[name] || {};
          const label = ghostConfig.displayName || name;
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = label;
          select.appendChild(opt);
        }
        this.languageManager.applyLanguage(select);
        select.value = currentGhost;
        select.disabled = selectableGhosts.length <= 1;
        select.onchange = (evt) => {
          const newGhost = evt.target.value;
          this._handleGhostSelection(newGhost, select);
        };
        container?.classList.remove(PanelAdapter.HIDDEN_CLASS);
      }
    }
    this.languageManager.applyLanguage(panelContainer);

    const visMap = this.buttonVisibilityService?.getVisibilityForScreen(this.currentScreen) || {};
    const aliases = { post: 'post-btn', 'capture-btn': 'capture-btn' };
    for (const [name, visible] of Object.entries(visMap)) {
      const jsName = aliases[name] || name;
      const el = panelContainer.querySelector(`[data-js="${jsName}"]`);
      el?.classList.toggle(PanelAdapter.HIDDEN_CLASS, !visible);
    }
    panelContainer.querySelectorAll('[data-action]').forEach((btn) => {
      const action = btn.getAttribute('data-action');
      const enabled =
        this.stateService.isButtonEnabled(this.currentScreen, action) &&
        this.buttonStateService.isActive(action, this.currentScreen);
      let disabled = !enabled;
      if (action === 'switch-ghost') {
        disabled = disabled || selectableGhosts.length <= 1;
      }
      btn.disabled = disabled;
      btn.classList.toggle('button--disabled', disabled);
    });

    this._applyAiCameraState(panelContainer);
    this.labelTruncator.apply(panelContainer);
  }

  _handleGhostSelection(newGhost, select) {
    const currentGhost = this.ghostService.getCurrentGhost().name;
    if (!newGhost || newGhost === currentGhost) {
      return;
    }
    if (this._shouldConfirmGuideExit(currentGhost, newGhost)) {
      if (select) {
        select.value = currentGhost;
      }
      if (this.modalService) {
        this._showGuideSwitchModal(newGhost, currentGhost, select);
        return;
      }
    }
    this._performGhostSwitch(newGhost);
  }

  _shouldConfirmGuideExit(currentGhost, newGhost) {
    if (currentGhost !== 'guide') return false;
    if (newGhost === 'guide') return false;
    return !this.ghostSwitchService?.isCompleted?.('guide');
  }

  _showGuideSwitchModal(newGhost, currentGhost, select) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ghost-switch-modal';

    const title = document.createElement('h2');
    title.className = 'ghost-switch-modal__title';
    title.setAttribute('data-i18n', 'ghost_switch.title');
    wrapper.appendChild(title);

    const message = document.createElement('p');
    message.className = 'ghost-switch-modal__message';
    message.setAttribute('data-i18n', 'ghost_switch.message');
    wrapper.appendChild(message);

    const actions = document.createElement('div');
    actions.className = 'ghost-switch-modal__actions';

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'ghost-switch-modal__button ghost-switch-modal__button--confirm';
    confirm.setAttribute('data-i18n', 'ghost_switch.confirm');
    confirm.onclick = () => {
      this.modalService?.hide?.();
      this._performGhostSwitch(newGhost);
    };

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'ghost-switch-modal__button ghost-switch-modal__button--cancel';
    cancel.setAttribute('data-i18n', 'ghost_switch.cancel');
    cancel.onclick = () => {
      this.modalService?.hide?.();
      if (select) {
        select.value = currentGhost;
      }
    };

    actions.appendChild(confirm);
    actions.appendChild(cancel);
    wrapper.appendChild(actions);

    this.modalService?.show?.(wrapper);
  }

  _performGhostSwitch(newGhost) {
    this.ghostService.setCurrentGhost(newGhost);
    this.eventBus.emit({ type: 'GHOST_CHANGE', payload: { name: newGhost } });
  }

  _applyDrumLayout(panelContainer, explicitLayout = null) {
    if (!panelContainer || !this.drumLayoutService) return;
    const drum = panelContainer.querySelector('.panel__mask');
    if (!drum) return;
    const layout = Array.isArray(explicitLayout)
      ? explicitLayout
      : this.drumLayoutService.getLayout();
    const slots = drum.querySelectorAll('.panel__sector-emoji');
    slots.forEach((slot, index) => {
      const emoji = layout[index] ?? '⬜';
      slot.textContent = emoji;
      slot.removeAttribute?.('data-filled');
    });
  }

  _applyAiCameraState(panelContainer) {
    if (!panelContainer || !this.stateService) return;
    const camBtn = panelContainer.querySelector('[data-action="toggle-camera"]');
    if (!camBtn) return;
    const aiState = this.stateService.getAiState?.() || 'IDLE';
    const aiReady = this.stateService.isAiReady?.() === true;
    // The loader hide mechanism was removed, so the AI loading badge has no trigger and stays off.
    const showBadge = false;
    camBtn.classList.toggle('control-button--ai-loading', showBadge);
    const badge = camBtn.querySelector('[data-js="control-badge"]');
    if (badge) {
      if (showBadge) {
        badge.setAttribute('data-i18n', 'ai_loading_badge');
        this.languageManager.applyLanguage(badge);
      } else {
        badge.removeAttribute('data-i18n');
        badge.textContent = '';
      }
    }
    if (!aiReady) {
      const key = aiState === 'FAILED' ? 'ai_failed_camera' : 'ai_loading_camera';
      camBtn.setAttribute('data-i18n-title', key);
    } else {
      camBtn.setAttribute('data-i18n-title', 'open_camera');
    }
    this.languageManager.applyLanguage(camBtn);
  }
}
