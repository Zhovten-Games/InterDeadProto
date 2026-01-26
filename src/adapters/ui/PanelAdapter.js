import NullEventBus from '../../core/events/NullEventBus.js';
import {
  BUTTON_VISIBILITY_UPDATED,
  DRUM_LAYOUT_UPDATED,
  GHOST_UNLOCKED
} from '../../core/events/constants.js';
import IPanel from '../../ports/IPanel.js';

export default class PanelService extends IPanel {
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
    panelEffectsWidget = null,
    modalService = null,
    eventBus = new NullEventBus(),
    containerSelector = '[data-js="bottom-panel"]',
    drumLayoutService = null,
    showEmojiDrum = true
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
    this.panelEffectsWidget = panelEffectsWidget;
    this.modalService = modalService;
    this.eventBus = eventBus;
    this.containerSelector = containerSelector;
    this.drumLayoutService = drumLayoutService;
    this.panelContainer = null;
    this.currentScreen = null;
    this.showEmojiDrum = showEmojiDrum;
  }

  boot() {
    this.eventBus.subscribe(async evt => {
      if (!evt || !this.panelContainer) return;
      if (
        evt.type === 'BUTTON_STATE_UPDATED' &&
        evt.screen === this.currentScreen
      ) {
        await this.update(this.panelContainer, { screen: evt.screen });
        return;
      }
      if (
        evt.type === BUTTON_VISIBILITY_UPDATED &&
        evt.screen === this.currentScreen
      ) {
        await this.update(this.panelContainer, { screen: evt.screen });
        return;
      }
      if (evt.type === 'GHOST_CHANGE') {
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
        setTimeout(() => container?.classList.remove('ghost-switcher--highlight'), 1000);
      }
    });
  }

  async load(context = {}) {
    try {
      const html = await this.templateService.render('panel');
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
          this._applyDrumLayout(el);
          this.panelEffectsWidget?.mount?.(el);
          this.languageManager.applyLanguage(container);
        }
      }
    } catch (err) {
      this.templateService.logger?.error(err.message);
    }
  }

  async update(panelContainer, context = {}) {
    if (!panelContainer) return;
    if (context.screen) {
      this.currentScreen = context.screen;
    }

    const drum = panelContainer.querySelector('.panel__mask');
    const showDrum = this.showEmojiDrum && this.currentScreen === 'messenger';
    drum?.classList.toggle(PanelService.HIDDEN_CLASS, !showDrum);
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    root?.style.setProperty(
      '--chat-panel-height',
      showDrum ? 'var(--panel-height)' : 'var(--panel-height-collapsed)'
    );
    this._applyDrumLayout(panelContainer);

    const allKeys = Object.keys(this.controls);
    for (const key of allKeys) {
      const el = panelContainer.querySelector(`[data-js="${key}"]`);
      if (el) el.classList.add(PanelService.HIDDEN_CLASS);
    }

    const keys = this.screenMap?.[context.screen] || [];
    for (const key of keys) {
      const section = panelContainer.querySelector(`[data-js="${key}"]`);
      if (section) {
        section.classList.remove(PanelService.HIDDEN_CLASS);
        const defs = this.controls[key];
        if (defs?.length) {
          await this.buttonService.init(section, defs);
          this.languageManager.applyLanguage(section);
        }
      }
    }

    const langSelect = panelContainer.querySelector('[data-js="language-selector"]');
    if (langSelect) {
      langSelect.value = this.languageManager.current;
    }

    let unlocked = [];
    let selectableGhosts = [];
    const currentGhost = this.ghostService.getCurrentGhost().name;
    if (context.screen === 'messenger') {
      const container = panelContainer.querySelector('[data-js="ghost-switcher-buttons"]');
      const select = container?.querySelector('[data-js="ghost-select"]');
      if (select) {
        select.innerHTML = '';
        selectableGhosts = this.ghostSwitchService.getAvailable(
          this.spiritConfigs,
          currentGhost
        );
        unlocked = this.ghostSwitchService.getUnlocked(this.spiritConfigs);
        for (const name of selectableGhosts) {
          const opt = document.createElement('option');
          opt.value = name;
          opt.textContent = name;
          select.appendChild(opt);
        }
        this.languageManager.applyLanguage(select);
        select.value = currentGhost;
        select.disabled = selectableGhosts.length <= 1;
        select.onchange = evt => {
          const newGhost = evt.target.value;
          this._handleGhostSelection(newGhost, select);
        };
        container?.classList.remove(PanelService.HIDDEN_CLASS);
      }
    }
    this.languageManager.applyLanguage(panelContainer);

    const visMap = this.buttonVisibilityService?.getVisibilityForScreen(this.currentScreen) || {};
    const aliases = { post: 'post-btn', 'capture-btn': 'capture-btn' };
    for (const [name, visible] of Object.entries(visMap)) {
      const jsName = aliases[name] || name;
      const el = panelContainer.querySelector(`[data-js="${jsName}"]`);
      el?.classList.toggle(PanelService.HIDDEN_CLASS, !visible);
    }
    panelContainer.querySelectorAll('[data-action]').forEach(btn => {
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

    this.panelEffectsWidget?.mount?.(panelContainer);
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
}

