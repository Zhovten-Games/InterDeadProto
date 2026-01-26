import NullLogger from '../logging/NullLogger.js';
import { say, awaitUser, quest, overlay, unlock } from './schema.js';

/**
 * Compiles a spirit configuration into an array of DSL steps.
 * Unknown structures are skipped with errors routed through the provided logger.
 * @param {Object} config Spirit configuration object
 * @param {import('../../ports/ILogging.js').default|null} logger Optional logger
 * @returns {Array} Array of DSL step instances
 */
export function compile(config = {}, logger = null) {
  const resolvedLogger = logger ?? new NullLogger();
  const steps = [];
  if (!config || typeof config !== 'object') {
    resolvedLogger.error('Invalid spirit config: expected object');
    return steps;
  }

  const stages = Array.isArray(config.stages) ? config.stages : [];
  for (const stage of stages) {
    const messages = stage?.event?.messages;
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        const author = typeof msg.author === 'string' ? msg.author : 'ghost';
        const text = typeof msg.text === 'string' ? msg.text : '';
        if (author === 'user') steps.push(awaitUser('user_post'));
        steps.push(say(author, text));
      }
    } else if (stage?.event) {
      resolvedLogger.error('Stage event.messages must be an array');
    }

    if (stage?.quest) {
      const target = stage.quest?.requirement?.target || '';
      steps.push(quest(target));
      steps.push(awaitUser('camera_capture'));
      if (stage.quest.overlay) {
        steps.push(overlay(stage.quest.overlay));
      }
    }
  }

  if (config.unlock) {
    steps.push(unlock(config.unlock));
  }

  return steps;
}

export default { compile };
