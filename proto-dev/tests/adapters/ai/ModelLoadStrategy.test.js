import assert from 'assert';
import ModelLoadStrategy from '../../../src/adapters/ai/ModelLoadStrategy.js';

describe('ModelLoadStrategy', () => {
  it('loads primary model when first attempt succeeds', async () => {
    const strategy = new ModelLoadStrategy({
      loadModel: async (url) => ({ url }),
      retryDelaysMs: [],
      sleep: async () => {},
    });

    const result = await strategy.loadWithFallback({
      primaryUrl: 'https://example.com/primary/model.json',
      fallbackUrl: 'https://example.com/fallback/model.json',
    });

    assert.strictEqual(result.source, 'https://example.com/primary/model.json');
    assert.strictEqual(result.model.url, 'https://example.com/primary/model.json');
  });

  it('retries primary and succeeds before using fallback', async () => {
    let attempts = 0;
    const strategy = new ModelLoadStrategy({
      loadModel: async (url) => {
        attempts += 1;
        if (attempts < 2) {
          throw new Error('Temporary primary error');
        }
        return { url };
      },
      retryDelaysMs: [0],
      sleep: async () => {},
    });

    const result = await strategy.loadWithFallback({
      primaryUrl: 'https://example.com/primary/model.json',
      fallbackUrl: 'https://example.com/fallback/model.json',
    });

    assert.strictEqual(attempts, 2);
    assert.strictEqual(result.source, 'https://example.com/primary/model.json');
  });

  it('uses fallback when primary fails after all retries', async () => {
    const strategy = new ModelLoadStrategy({
      loadModel: async (url) => {
        if (url.includes('/primary/')) {
          throw new Error('Primary unavailable');
        }
        return { url };
      },
      retryDelaysMs: [0, 0],
      sleep: async () => {},
    });

    const result = await strategy.loadWithFallback({
      primaryUrl: 'https://example.com/primary/model.json',
      fallbackUrl: 'https://example.com/fallback/model.json',
    });

    assert.strictEqual(result.source, 'https://example.com/fallback/model.json');
    assert.strictEqual(result.model.url, 'https://example.com/fallback/model.json');
  });

  it('throws when both primary and fallback fail', async () => {
    const strategy = new ModelLoadStrategy({
      loadModel: async () => {
        throw new Error('All sources unavailable');
      },
      retryDelaysMs: [0],
      sleep: async () => {},
    });

    await assert.rejects(
      strategy.loadWithFallback({
        primaryUrl: 'https://example.com/primary/model.json',
        fallbackUrl: 'https://example.com/fallback/model.json',
      }),
      /All sources unavailable/,
    );
  });
});
