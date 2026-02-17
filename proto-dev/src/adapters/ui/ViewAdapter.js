import NullEventBus from '../../core/events/NullEventBus.js';
import coreStore from '../../core/engine/store.js';
import { selectAwaiting } from '../../core/engine/selectors.js';
import { BUTTON_STATE_UPDATED } from '../../core/events/constants.js';
import IView from '../../ports/IView.js';

/**
 * Thin UI adapter translating EventBus signals to DOM updates.
 * It also observes core state and relays button enablement changes
 * via BUTTON_STATE_UPDATED events.
 */
export default class ViewAdapter extends IView {
  constructor(
    bus = new NullEventBus(),
    historyService = null,
    ghostService = null,
    store = coreStore
  ) {
    super();
    this.bus = bus;
    this.historyService = historyService;
    this.ghostService = ghostService;
    this.store = store;
    this._booted = false;
    this._awaiting = selectAwaiting(this.store.getState());
    this._origDispatch = null;
    this._nextButtonHandler = evt => {
      if (evt.type !== 'NEXT_BUTTON_ENABLE') return;
      const btn = document.querySelector('[data-action="next"]');
      if (btn) {
        btn.disabled = !evt.enabled;
        btn.classList.toggle('button--disabled', !evt.enabled);
      }
    };
    this._screenHandler = evt => {
      if (evt.type === 'SCREEN_CHANGE' && evt.screen !== 'camera') {
        this.bus.emit({ type: 'CAMERA_STATUS', status: 'hidden' });
      }
      // History replay is now handled exclusively by DialogOrchestratorService.
      // When entering the messenger screen we only acknowledge the screen
      // change without emitting message events.
    };
  }

  boot() {
    if (this._booted) return;
    this._booted = true;
    this.bus.subscribe(this._nextButtonHandler);
    this.bus.subscribe(this._screenHandler);
    this._origDispatch = this.store.dispatch.bind(this.store);
    this.store.dispatch = action => {
      const effects = this._origDispatch(action);
      this._evaluateAwaiting();
      return effects;
    };
    this._evaluateAwaiting();
  }

  dispose() {
    if (!this._booted) return;
    this.bus.unsubscribe(this._nextButtonHandler);
    this.bus.unsubscribe(this._screenHandler);
    if (this._origDispatch) {
      this.store.dispatch = this._origDispatch;
      this._origDispatch = null;
    }
    this._booted = false;
  }

  _evaluateAwaiting() {
    const next = selectAwaiting(this.store.getState());
    if (
      next.awaits === this._awaiting.awaits &&
      next.kind === this._awaiting.kind &&
      next.targetScreen === this._awaiting.targetScreen
    ) {
      return;
    }
    this._awaiting = next;
    const postActive =
      next.awaits &&
      next.kind === 'user_text' &&
      next.targetScreen === 'messenger';
    const captureActive =
      next.awaits &&
      next.kind === 'camera_capture' &&
      next.targetScreen === 'camera';
    this.bus.emit({
      type: BUTTON_STATE_UPDATED,
      button: 'post',
      active: postActive,
      screen: 'messenger'
    });
    this.bus.emit({
      type: BUTTON_STATE_UPDATED,
      button: 'capture-btn',
      active: captureActive,
      screen: 'camera'
    });
  }
}
