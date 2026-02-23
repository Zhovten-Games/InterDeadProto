import assert from 'assert';
import DetectionService from './../../../src/adapters/ai/DetectionAdapter.js';

describe('DetectionAdapter.js', () => {
  it('uses default threshold when config is missing', () => {
    const service = new DetectionService({ info() {}, warn() {}, error() {} });
    assert.strictEqual(service.getDetectionThreshold(), 0.5);
  });

  it('uses configured threshold when it is valid', () => {
    const service = new DetectionService({ info() {}, warn() {}, error() {} }, null, null, {
      ai: { detectionThreshold: 0.7 },
    });
    assert.strictEqual(service.getDetectionThreshold(), 0.7);
  });

  it('clamps threshold updates to configured range', () => {
    const service = new DetectionService({ info() {}, warn() {}, error() {} });

    assert.strictEqual(service.setDetectionThreshold(0.01), 0.1);
    assert.strictEqual(service.getDetectionThreshold(), 0.1);

    assert.strictEqual(service.setDetectionThreshold(0.99), 0.95);
    assert.strictEqual(service.getDetectionThreshold(), 0.95);
  });
});
