import IEventBus from '../../ports/IEventBus.js';

/**
 * Null object implementation of the event bus port.
 * Useful for tests or scenarios where event propagation is optional.
 */
export default class NullEventBus extends IEventBus {
  subscribe() {}
  unsubscribe() {}
  emit() {}
}
