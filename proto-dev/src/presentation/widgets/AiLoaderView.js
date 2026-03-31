import { AI_RETRY_REQUESTED, AI_STATE_CHANGED } from '../../core/events/constants.js';

const STATE_LABELS = {
  IDLE: 'ai_loading_status',
  LOADING_RUNTIME: 'ai_loading_status',
  LOADING_MODEL: 'ai_loading_status',
  WARMUP: 'ai_loading_status',
  READY: 'ai_ready_status',
  FAILED: 'ai_failed_status',
};

export default class AiLoaderView {
  constructor(bus, orchestrator) {
    this.bus = bus;
    this.orchestrator = orchestrator;
    this._handler = (evt) => this._handle(evt);
    this.aiState = 'IDLE';
  }

  boot() {
    this.bus.subscribe(this._handler);
    this._publish();
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this.orchestrator.removeEntry('ai_loading');
  }

  _handle(evt) {
    if (!evt || typeof evt.type !== 'string') return;
    if (evt.type === AI_STATE_CHANGED && evt.state) {
      this.aiState = evt.state;
      this._publish();
    }
  }

  _publish() {
    const isVisible = this.aiState !== 'READY';
    const showRetry = this.aiState === 'FAILED';
    this.orchestrator.registerEntry('ai_loading', {
      visible: isVisible,
      contactKey: 'overlay_contact_ai',
      statusKey: STATE_LABELS[this.aiState] || STATE_LABELS.IDLE,
      actions: [
        {
          kind: 'retry_ai',
          i18nKey: 'ai_retry',
          eventType: AI_RETRY_REQUESTED,
          hidden: !showRetry,
        },
      ],
      priority: 100,
    });
    this.orchestrator.applyEventTransition({ type: AI_STATE_CHANGED, state: this.aiState });
  }
}
