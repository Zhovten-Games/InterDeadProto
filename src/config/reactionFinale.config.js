import { resolveAssetUrl } from './assetsBaseUrl.js';

export default {
  guest1: {
    excludedStages: ['guest1-farewell'],
    pending: {
      messageKey: 'reactions.finale.pending',
      buttonKey: 'reactions.finale.recalculate'
    },
    success: {
      titleKey: 'reactions.finale.guest1.title',
      messageKey: 'reactions.finale.guest1.message',
      imageUrl: resolveAssetUrl('images/static-image.webp'),
      imageAltKey: 'reactions.finale.guest1.image_alt'
    }
  },
  guide: {
    excludedStages: ['guide-outro'],
    pending: {
      messageKey: 'reactions.finale.pending',
      buttonKey: 'reactions.finale.recalculate'
    },
    success: {
      titleKey: 'reactions.finale.guide.title',
      messageKey: 'reactions.finale.guide.message',
      imageUrl: resolveAssetUrl('images/pencil.png'),
      imageAltKey: 'reactions.finale.guide.image_alt'
    }
  }
};
