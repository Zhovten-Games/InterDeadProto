import assert from 'assert';

// Base class for services
class Service {
  constructor() {
    this.replicas = 0;
  }
}

// GhostService tracks the number of replicas created
class GhostService extends Service {
  replicate() {
    this.replicas += 1;
  }
}

// ProgressDriver triggers ghost replication on click
class ProgressDriver {
  constructor(ghostService) {
    this.ghostService = ghostService;
  }

  click() {
    this.ghostService.replicate();
  }
}

describe('single_progress_driver', () => {
  it('creates exactly one ghost replica per click', () => {
    const ghost = new GhostService();
    const driver = new ProgressDriver(ghost);

    driver.click();

    assert.strictEqual(ghost.replicas, 1);
  });
});
