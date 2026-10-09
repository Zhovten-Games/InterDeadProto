import FullAppBootstrapper from '../../src/app-shell/bootstrap/full-app-bootstrapper.js';
import EventBus from '../../src/runtime-events/adapters/event-bus-adapter.js';
export function bootstrapContext({ saved = {}, user = null } = {}) {
  const bus = new EventBus(),
    events = [],
    records = new Map(Object.entries(saved));
  bus.subscribe((event) => events.push(event));
  const persistence = {
    load: (key) => records.get(key),
    save: (key, value) => records.set(key, value),
  };
  const calls = { phases: [], complete: 0, disposal: 0, cleared: 0 };
  const bootManager = {
    bootPhase: async (names) => calls.phases.push(names),
    bootAll: async () => {},
    completeBoot: () => {
      calls.complete++;
    },
    disposeAll: async () => {
      calls.disposal++;
    },
  };
  const services = {
    IPersistence: persistence,
    DatabaseAdapter: {
      loadUser: async () => user,
      clearAll: () => {
        calls.cleared++;
      },
    },
    Loader: { load: async (task) => task(), dispose() {} },
    ButtonVisibilityService: { setScreenVisibility() {} },
    StateService: { markCaptured() {}, setLocalAuthReady() {} },
    GhostService: {},
    PostsService: {},
  };
  const container = {
    resolve: (name) => {
      if (!(name in services)) throw new Error(`Unregistered fixture port: ${name}`);
      return services[name];
    },
  };
  const bootstrapper = new FullAppBootstrapper({
    container,
    bootManager,
    eventBus: bus,
    logger: { error() {} },
    windowRef: { addEventListener() {}, removeEventListener() {} },
  });
  return { bootstrapper, bus, events, calls, records };
}
