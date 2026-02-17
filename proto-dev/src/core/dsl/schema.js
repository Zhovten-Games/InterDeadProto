/**
 * DSL step schema with minimal step implementations.
 * Each step is represented by a dedicated class inheriting from `Step`.
 */

export const StepTypes = {
  SAY: 'say',
  AWAIT: 'await',
  QUEST: 'quest',
  OVERLAY: 'overlay',
  UNLOCK: 'unlock'
};

class Step {
  constructor(type) {
    this.type = type;
  }
}

export class SayStep extends Step {
  constructor(author = 'ghost', text = '', key = null) {
    super(StepTypes.SAY);
    this.author = author;
    if (key) this.key = key;
    if (text) this.text = text;
  }
}

export class AwaitStep extends Step {
  constructor(kind = 'user_post') {
    super(StepTypes.AWAIT);
    this.kind = kind;
  }
}

export class QuestStep extends Step {
  constructor(target = '') {
    super(StepTypes.QUEST);
    // keep both legacy `target` field and new detection.target
    this.target = target;
    this.detection = { target };
  }
}

export class OverlayStep extends Step {
  constructor(compose = {}) {
    super(StepTypes.OVERLAY);
    this.compose = compose;
  }
}

export class UnlockStep extends Step {
  constructor(data = {}) {
    super(StepTypes.UNLOCK);
    Object.assign(this, data);
  }
}

// Factory helpers ---------------------------------------------------------

export const say = (author, text, key) => new SayStep(author, text, key);
export const awaitUser = kind => new AwaitStep(kind);
export const quest = target => new QuestStep(target);
export const overlay = compose => new OverlayStep(compose);
export const unlock = data => new UnlockStep(data);

export default {
  StepTypes,
  Step,
  SayStep,
  AwaitStep,
  QuestStep,
  OverlayStep,
  UnlockStep,
  say,
  awaitUser,
  quest,
  overlay,
  unlock
};
