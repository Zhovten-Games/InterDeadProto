import { resolveAssetUrl } from '../assetsBaseUrl.js';

export default {
  id: 'guide',
  avatar: resolveAssetUrl('images/artifacts/guide/NIRO.webp'),
  reactions: {
    'guide-intro': ['🙂'],
    'guide-camera': ['🙂'],
    'guide-outro': ['🤔']
  },
  sounds: {
    message: {
      ghost: resolveAssetUrl('audio/ghost_effect.mp3'),
      user: resolveAssetUrl('audio/type_sound.mp3')
    },
    detection: resolveAssetUrl('audio/ghost_effect.mp3')
  },
  stages: [
    {
      id: 'guide-intro',
      reactions: ['🙂'],
      reactionPreset: '🙂',
      event: {
        id: 'intro',
        autoStart: true,
        messages: [
          {
            author: 'ghost',
            text: 'guide.stage1'
          },
          { author: 'user', text: 'guide.user.reply1' },
          { author: 'ghost', text: 'guide.stage2' },
          { author: 'user', text: 'guide.user.reply2' },
          { author: 'ghost', text: 'guide.stage3' },
          { author: 'user', text: 'guide.user.reply3' }
        ]
      }
    },
    {
      id: 'guide-camera',
      reactions: ['🙂'],
      reactionPreset: '🙂',
      event: {
        id: 'camera-stage',
        autoStart: true,
        messages: [{ author: 'ghost', text: 'guide.stage4' }]
      },
      quest: {
        id: 'find-person',
        type: 'camera',
        requirement: { type: 'object', target: 'person' },
        overlay: {
          mode: 'detected-only',
          x: 0,
          y: 0
        }
      }
    },
    {
      id: 'guide-outro',
      reactions: ['🤔'],
      reactionPreset: '🤔',
      event: {
        id: 'outro',
        autoStart: true,
        messages: [
          { author: 'user', text: 'guide.user.reply4' },
          { author: 'ghost', text: 'guide.stage5' },
          { author: 'user', text: 'guide.user.reply5' },
          {
            author: 'ghost',
            text: 'guide.stage6',
            effects: { reactionFinale: true }
          }
        ]
      }
    }
  ],
  unlock: { requires: [] },
  // Messenger rules to keep control panel interactive during the guide flow
  messenger: {
    post: [{ type: 'always' }],
    'switch-ghost': [{ type: 'always' }],
    'toggle-camera': [{ type: 'localAuthReady' }, { type: 'aiReady' }],
    'reset-data': [{ type: 'always' }],
    'scroll-up': [{ type: 'always' }],
    'scroll-down': [{ type: 'always' }]
  }
};
