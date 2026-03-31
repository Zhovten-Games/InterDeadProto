import { OVERLAY_SHOW } from '../../core/events/constants.js';

const MULTI_TAB_GUARD_BYPASS_KEY = 'interdead_disable_multi_tab_guard';

/**
 * Adapts boot overlay events to orchestrator entries.
 */
export default class BootOverlayView {
  constructor(bus, orchestrator) {
    this.bus = bus;
    this.orchestrator = orchestrator;
    this._handler = (evt) => this._handle(evt);
    this._booted = false;
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this.orchestrator.removeEntry('loading');
    this.orchestrator.removeEntry('app_already_open');
    this._booted = false;
  }

  _handle(evt) {
    if (!evt || typeof evt.type !== 'string') return;
    if (evt.type === 'OVERLAY_HIDE') {
      this.orchestrator.applyEventTransition(evt);
      return;
    }
    if (evt.type !== OVERLAY_SHOW) return;
    this._show(evt.i18nKey || 'loading');
  }

  _show(i18nKey) {
    if (i18nKey === 'app_already_open') {
      this.orchestrator.registerEntry('app_already_open', {
        contactKey: 'overlay_contact_blocked',
        statusKey: 'app_already_open',
        warningKey: 'app_already_open_warning',
        actions: [
          {
            kind: 'disable_multi_tab_guard',
            i18nKey: 'app_already_open_disable_guard',
            storageKey: MULTI_TAB_GUARD_BYPASS_KEY,
            storageValue: '1',
            reload: true,
          },
        ],
        visible: true,
        priority: 300,
      });
      this.orchestrator.applyEventTransition({ type: OVERLAY_SHOW, i18nKey });
      return;
    }

    this.orchestrator.registerEntry('loading', {
      contactKey: 'overlay_contact_loading',
      statusKey: i18nKey,
      visible: true,
      actions: [],
      priority: 200,
    });
    this.orchestrator.applyEventTransition({ type: OVERLAY_SHOW, i18nKey });
  }
}
