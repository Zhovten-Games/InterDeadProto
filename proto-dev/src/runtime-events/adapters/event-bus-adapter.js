import IEventBus from '../ports/event-bus-port.js';
import Observer from '../subscriptions/observer.js';

export default class EventBusAdapter extends IEventBus {
  constructor(observer = new Observer()) {
    super();
    this.observer = observer;
  }

  subscribe(handler) {
    this.observer.subscribe(handler);
  }

  unsubscribe(handler) {
    this.observer.unsubscribe(handler);
  }

  settled() {
    return this.observer.settled();
  }

  emit(event) {
    this.observer.emit(event);
  }
}
