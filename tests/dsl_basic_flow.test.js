import assert from 'assert';

// Step is a base class for DSL steps
class Step {
  constructor(name) {
    this.name = name;
  }
  execute(context) {
    context.log.push(this.name);
  }
}

// Specific step implementations
class StartStep extends Step {
  constructor() {
    super('start');
  }
}

class EndStep extends Step {
  constructor() {
    super('end');
  }
}

// DSL engine runs provided steps sequentially
class SimpleDSL {
  run(steps) {
    const context = { log: [] };
    steps.forEach(step => step.execute(context));
    return context.log;
  }
}

describe('dsl_basic_flow', () => {
  it('executes a minimal scenario of steps', () => {
    const dsl = new SimpleDSL();
    const result = dsl.run([new StartStep(), new EndStep()]);
    assert.deepStrictEqual(result, ['start', 'end']);
  });
});
