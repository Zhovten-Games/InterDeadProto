import assert from 'assert';

export async function assertPortContract(PortCtor, methods) {
  const port = new PortCtor();
  for (const method of methods) {
    const { name, async: isAsync = false, args = [] } = method;
    assert.strictEqual(
      typeof port[name],
      'function',
      `Expected method "${name}" to be defined on ${PortCtor.name}`,
    );
    if (isAsync) {
      await assert.rejects(
        () => port[name](...args),
        err => err instanceof Error && /must be implemented/i.test(err.message),
        `Expected async method "${name}" to reject with a not-implemented error`,
      );
    } else {
      assert.throws(
        () => port[name](...args),
        err => err instanceof Error && /must be implemented/i.test(err.message),
        `Expected method "${name}" to throw a not-implemented error`,
      );
    }
  }
}
