# composeApplication

`composeApplication` centralises container assembly: it instantiates the dependency `Container`, pairs it with global `config` and `spiritConfigs`, and shares the context across all bootstrap modules.[^1]

Infrastructure, domain, application, and presentation modules are registered in that order to guarantee foundational adapters (event bus, logging, persistence) exist before higher layers request them. Each module exposes a `register` method that mutates the shared container.[^2]

After registration the helper resolves the shared `IEventBus` and logging adapter from the container to construct a `BootManager`, returning the tuple consumed by [`index.js`](index.md) so callers can boot services and emit lifecycle events without re-resolving dependencies.[^3]

[^1]: Container construction and shared context creation [src/infrastructure/bootstrap/composeApplication.js#L13-L16](../../../src/infrastructure/bootstrap/composeApplication.js#L13-L16); [`Container`](../container/Container.md); [`Config`](../../config/index.md)
[^2]: Module instantiation sequence enforcing infrastructure-first registration [src/infrastructure/bootstrap/composeApplication.js#L17-L20](../../../src/infrastructure/bootstrap/composeApplication.js#L17-L20); [`InfrastructureModule`](modules/InfrastructureModule.md); [`DomainModule`](modules/DomainModule.md); [`ApplicationModule`](modules/ApplicationModule.md); [`PresentationModule`](modules/PresentationModule.md)
[^3]: Boot manager creation and returned structure [src/infrastructure/bootstrap/composeApplication.js#L22-L32](../../../src/infrastructure/bootstrap/composeApplication.js#L22-L32); [`BootManager`](BootManager.md)
