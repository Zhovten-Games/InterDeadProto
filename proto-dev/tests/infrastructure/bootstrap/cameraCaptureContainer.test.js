import assert from 'assert';
import Container from '../../../src/infrastructure/container/Container.js';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';
import MediaRepository from '../../../src/infrastructure/repositories/MediaRepository.js';

describe('container wiring for camera capture', () => {
  it('provides dependencies for captureOverlay without crashing', async () => {
    const container = new Container();
    const bus = { subscribe() {}, unsubscribe() {}, emit() {} };
    container.register('CameraService', () => ({ takeSelfie: async () => new Blob(['c']) }));
    container.register('DetectionService', () => ({ detectTarget: async () => ({ ok: true }) }));
    container.register('Logger', () => ({ error() {} }));
    container.register('StateService', () => ({ markCaptured() {} }));
    container.register('DualityManager', () => ({}));
    container.register('DialogManager', () => ({ dialog: { messages: [], index: 0 } }));
    container.register('IEventBus', () => bus);
    container.register('ButtonStateService', () => ({ setScreenState() {} }));
    container.register('ButtonVisibilityService', () => ({}));
    container.register('ItemOverlayService', () => ({ compose: async () => ({
      width: 1,
      height: 1,
      getContext: () => ({ drawImage() {}, fillRect() {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) }),
      toBlob: cb => cb(new Blob(['f'])),
      toDataURL: () => 'data:image/png;base64,'
    }) }));
    container.register('AvatarService', () => ({ getUserAvatar: async () => '' }));
    container.register('DialogInputGateService', () => ({ advanceToUserTurn() {} }));
    container.register('ImageComposerService', () => ({
      compose: async () => ({
        blobs: { thumb: new Blob(['t']), full: new Blob(['f']) },
        meta: {}
      })
    }));
    container.register('MediaRepository', () => new MediaRepository());
    container.register('ICanvasFactory', () => ({ create: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage() {}, fillRect() {}, getImageData: () => ({ data: new Uint8ClampedArray(4) }) }),
      toBlob: cb => cb(new Blob(['t'])),
      toDataURL: () => 'data:image/png;base64,'
    }) }));
    container.register(
      'CameraSectionManager',
      () =>
        new CameraOrchestratorService(
          container.resolve('CameraService'),
          container.resolve('DetectionService'),
          container.resolve('Logger'),
          container.resolve('StateService'),
          container.resolve('DualityManager'),
          container.resolve('DialogManager'),
          container.resolve('IEventBus'),
          container.resolve('ButtonStateService'),
          container.resolve('ButtonVisibilityService'),
          container.resolve('ItemOverlayService'),
          container.resolve('AvatarService'),
          container.resolve('DialogInputGateService'),
          container.resolve('ImageComposerService'),
          container.resolve('MediaRepository'),
          container.resolve('ICanvasFactory')
        )
    );

    const origCreate = global.URL.createObjectURL;
    global.URL.createObjectURL = () => 'blob:';

    const manager = container.resolve('CameraSectionManager');
    await assert.doesNotReject(async () => {
      await manager.captureOverlay({ x: 0, y: 0, width: 1, height: 1, background: { width: 1, height: 1 } });
    });

    global.URL.createObjectURL = origCreate;
  });
});

