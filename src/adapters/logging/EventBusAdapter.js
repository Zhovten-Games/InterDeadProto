import IEventBus from '../../ports/IEventBus.js';
import Observer from '../../utils/Observer.js';

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

  emit(event) {
    this.observer.emit(event);
  }
}
