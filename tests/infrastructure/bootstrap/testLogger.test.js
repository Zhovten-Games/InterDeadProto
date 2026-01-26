import assert from 'assert';
import Logger from '../../../src/infrastructure/bootstrap/Logger.js';

describe('Logger.js', () => {
  it('normalizes level and respects shouldLog', () => {
    const log = new Logger('INFO');
    assert.strictEqual(log.level, 'info');
    assert.ok(log.shouldLog('warn'));
    assert.ok(!log.shouldLog('debug'));
  });

  it('formats messages with timestamp and level', () => {
    const log = new Logger();
    const out = log.format('debug', 'hello');
    assert.ok(/\[DEBUG\]/.test(out));
    assert.ok(/hello$/.test(out));
  });

  it('log methods honour current level', () => {
    const messages = [];
    const orig = console.log;
    console.log = msg => messages.push(msg);
    const logger = new Logger('info');
    logger.debug('hidden');
    logger.info('visible');
    console.log = orig;
    assert.strictEqual(messages.length, 1);
    assert.ok(messages[0].includes('visible'));
  });

  it('implements boot/dispose required by logging port', async () => {
    const logger = new Logger();
    await logger.boot();
    assert.strictEqual(logger.booted, true);
    await logger.dispose();
    assert.strictEqual(logger.booted, false);
  });
});
