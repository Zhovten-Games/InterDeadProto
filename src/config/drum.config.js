/**
 * Default emoji drum configuration shared by every spirit.
 * Overrides are stored separately and merged at runtime.
 */
export const DEFAULT_DRUM_LAYOUT = ['🙂', '🤔', '😮', '😢', '😡', '😍'];

const drumConfig = {
  layout: DEFAULT_DRUM_LAYOUT,
  overrides: {
    layout: null,
  },
};

export default drumConfig;
