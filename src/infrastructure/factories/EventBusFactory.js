import EventBusAdapter from '../../adapters/logging/EventBusAdapter.js';
import Observer from '../../utils/Observer.js';

/**
 * Factory responsible for producing event bus instances.
 * Consumers receive the port implementation without depending on the adapter singleton.
 */
export default class EventBusFactory {
  /**
   * Create a new event bus backed by the shared observer implementation.
   * @param {Observer} observer Optional observer replacement used for testing.
   * @returns {import('../../ports/IEventBus.js').default}
   */
  create(observer = new Observer()) {
    return new EventBusAdapter(observer);
  }
}
