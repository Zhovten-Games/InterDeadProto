import EventBusAdapter from '../adapters/event-bus-adapter.js';
import Observer from '../subscriptions/observer.js';

/**
 * Factory responsible for producing event bus instances.
 * Consumers receive the port implementation without depending on the adapter singleton.
 */
export default class EventBusFactory {
  /**
   * Create a new event bus backed by the shared observer implementation.
   * @param {Observer} observer Optional observer replacement used for testing.
   * @returns {import('../ports/event-bus-port.js').default}
   */
  create(observer = new Observer()) {
    return new EventBusAdapter(observer);
  }
}
