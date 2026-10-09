import NullEventBus from '../../runtime-events/domain/null-event-bus.js';
import { STATUS_SHOW } from '../../runtime-events/domain/constants.js';
import INotification from '../ports/notification-port.js';

/**
 * Emits status messages instead of using browser notifications.
 */
export default class NotificationAdapter extends INotification {
  constructor(bus = new NullEventBus()) {
    super();
    this.bus = bus;
  }

  /**
   * Emit a status event with the provided message.
   * @param {string} message Text to display.
   * @param {object} [options] Additional data.
   */
  showNotification(message, options = {}) {
    this.bus.emit({ type: STATUS_SHOW, message, options });
  }
}
