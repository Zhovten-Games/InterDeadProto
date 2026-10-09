import { cameraPort } from '../../fixtures/port-contracts.js';
import assert from 'assert';
import CameraOrchestratorService from '../../../src/camera/application/camera-orchestrator-service.js';

describe('CameraOrchestratorService dependency validation', () => {
  const baseArgs = [
    {}, // cameraService
    {}, // detectionService
    { error() {} }, // logger
    null,
    null,
    null,
    { subscribe() {}, unsubscribe() {}, emit() {} },
    null,
    null,
    null,
    null,
    null,
  ];

  it('throws when imageComposer is missing', () => {
    assert.throws(
      () => new CameraOrchestratorService(...baseArgs, null, {}),
      /missing imageComposer/,
    );
  });

  it('throws when mediaRepository is missing', () => {
    assert.throws(
      () => new CameraOrchestratorService(...baseArgs, { compose() {} }, null),
      /missing mediaRepository/,
    );
  });
});
