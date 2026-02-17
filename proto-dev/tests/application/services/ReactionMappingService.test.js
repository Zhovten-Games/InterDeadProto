import assert from 'assert';
import ReactionMappingService from '../../../src/application/services/ReactionMappingService.js';

/** @description Ensures reaction mappings resolve per ghost stage. */
describe('ReactionMappingService', () => {
  it('returns mapped reactions for the current stage', () => {
    const ghostService = { getCurrentGhost: () => ({ name: 'guide' }) };
    const dualityManager = {
      getStageConfig: () => ({ id: 'guide-intro' }),
    };
    const spiritConfigs = {
      guide: {
        reactions: {
          'guide-intro': ['🙂', '🤝'],
        },
      },
    };
    const service = new ReactionMappingService(ghostService, dualityManager, spiritConfigs);
    assert.deepStrictEqual(service.getReactionsForCurrentStage(), ['🙂', '🤝']);
  });

  it('falls back to quest or event identifiers', () => {
    const ghostService = { getCurrentGhost: () => ({ name: 'guest1' }) };
    const dualityManager = {
      getStageConfig: () => ({ quest: { id: 'find-mug' } }),
    };
    const spiritConfigs = {
      guest1: {
        reactions: {
          'find-mug': ['😍'],
        },
      },
    };
    const service = new ReactionMappingService(ghostService, dualityManager, spiritConfigs);
    assert.deepStrictEqual(service.getReactionsForCurrentStage(), ['😍']);
  });

  it('filters invalid values when returning reactions for a stage', () => {
    const service = new ReactionMappingService(null, null, {
      guide: {
        reactions: {
          'guide-intro': ['🙂', '', null],
        },
      },
    });
    assert.deepStrictEqual(service.getReactionsForStage('guide', 'guide-intro'), ['🙂']);
    assert.deepStrictEqual(service.getReactionsForStage('guide', 'unknown'), []);
    assert.deepStrictEqual(service.getReactionsForStage('unknown', 'guide-intro'), []);
  });
});
