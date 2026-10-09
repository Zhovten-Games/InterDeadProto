import assert from 'assert';

// Quest class encapsulates quest state
class Quest {
  constructor() {
    this.active = false;
  }
}

// DetectionAdapter only detects when the quest is active
class DetectionAdapter {
  constructor(quest) {
    this.quest = quest;
    this.detected = false;
  }

  detect() {
    if (this.quest.active) {
      this.detected = true;
    }
  }
}

describe('quest_gate', () => {
  it('detects only when quest is active', () => {
    const quest = new Quest();
    const service = new DetectionAdapter(quest);

    service.detect();
    assert.strictEqual(service.detected, false, 'should not detect when inactive');

    quest.active = true;
    service.detect();
    assert.strictEqual(service.detected, true, 'should detect when active');
  });
});
