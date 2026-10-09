import assert from 'assert';

// DetectionAdapter uses a mutex to avoid concurrent detections
class DetectionAdapter {
  constructor() {
    this.active = false;
    this.count = 0;
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.count += 1;
  }

  stop() {
    this.active = false;
  }
}

describe('detection_mutex', () => {
  it('runs detection once even if started twice', () => {
    const service = new DetectionAdapter();

    service.start();
    service.start();

    assert.strictEqual(service.count, 1);
  });
});
