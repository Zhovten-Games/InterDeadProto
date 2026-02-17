import assert from 'assert';
import CameraOrchestratorService from '../../../src/application/services/CameraOrchestratorService.js';

describe('CameraOrchestratorService overlay mode resolution', () => {
  it('respects explicit mode and keeps backward compatibility for collage flag', () => {
    const service = Object.create(CameraOrchestratorService.prototype);

    assert.strictEqual(service._resolveOverlayMode({ mode: 'detected-only' }), 'detected-only');
    assert.strictEqual(service._resolveOverlayMode({ collage: false }), 'background-only');
    assert.strictEqual(service._resolveOverlayMode({}), 'collage');
  });
});
