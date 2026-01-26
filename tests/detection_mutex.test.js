import assert from 'assert';

// DetectionService uses a mutex to avoid concurrent detections
class DetectionService {
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
    const service = new DetectionService();

    service.start();
    service.start();

    assert.strictEqual(service.count, 1);
  });
});
