import { resolveAssetUrl } from '../assetsBaseUrl.js';

export default {
  id: 'guide',
  avatar: resolveAssetUrl('images/pencil.png'),
  reactions: {
    'guide-intro': ['🙂'],
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
            text: 'guide.start',
            notes: ['guide.start.note1', 'guide.start.note2'],
            noteLayout: 'inline'
          },
          { author: 'user', text: 'guide.reply' }
        ]
      },
      quest: {
        id: 'find-person',
        type: 'camera',
        requirement: { type: 'object', target: 'person' },
        overlay: {
          background: {
            color: '#ff0000',
            width: 640,
            height: 480
          },
          x: 0,
          y: 0,
          width: 200,
          height: 200
        }
      },
      effects: {
        electricBorder: {
          speed: 1.2,
          persist: true
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
          {
            author: 'ghost',
            text: 'guide.end',
            effects: { reactionFinale: true },
            notes: ['guide.end.note1', 'guide.end.note2'],
            noteLayout: 'inline'
          }
        ]
      },
      effects: {
        electricBorder: {}
      }
    }
  ],
  textAnimation: {
    initial: { effect: 'fx1', speed: 2 },
    replay: { effect: 'fx3', speed: 18 }
  },
  unlock: { requires: [] },
  // Messenger rules to keep control panel interactive during the guide flow
  messenger: {
    post: [{ type: 'always' }],
    'switch-ghost': [{ type: 'always' }],
    'toggle-camera': [{ type: 'always' }],
    'reset-data': [{ type: 'always' }],
    'scroll-up': [{ type: 'always' }],
    'scroll-down': [{ type: 'always' }]
  }
};
