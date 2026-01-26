import NullEventBus from '../../core/events/NullEventBus.js';
import ChatScrollWidget from '../../presentation/widgets/ChatScrollWidget.js';

/**
 * Service responsible for wiring scroll buttons to the chat container.
 * It reuses {@link ChatScrollWidget} so scrolling logic stays in one
 * place and the service simply boots and disposes the widget.
 */
export default class ChatScrollService extends ChatScrollWidget {
  /**
   * @param {HTMLElement|string} selector Scroll container or CSS selector.
   * Uses the same container as DialogWidget by default.
   * @param {import('../../ports/IEventBus.js').default} bus Event bus.
   */
  constructor(selector = '[data-js="dialog-list"]', bus = new NullEventBus()) {
    super(selector, bus);
  }

  /** Initialize the underlying widget. */
  boot() {
    super.boot();
  }
}
