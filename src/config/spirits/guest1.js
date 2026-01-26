import { resolveAssetUrl } from '../assetsBaseUrl.js';

export default {
  id: 'guest1',
  avatar: resolveAssetUrl('images/static-image.webp'),
  reactions: {
    'guest1-chat-1': ['😮'],
    'guest1-chat-2': ['😍'],
    'guest1-farewell': ['😢']
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
      id: 'guest1-chat-1',
      reactions: ['😮'],
      reactionPreset: '😮',
      event: {
        id: 'chat-1',
        autoStart: true,
        messages: [
          { author: 'user', text: 'guest1.user1' },
          {
            author: 'ghost',
            text: 'guest1.ghost1',
            notes: ['guest1.ghost1.note1', 'guest1.ghost1.note2'],
            noteLayout: 'inline'
          },
          { author: 'user', text: 'guest1.user2' },
          {
            author: 'ghost',
            text: 'guest1.ghost2',
            notes: ['guest1.ghost2.note1', 'guest1.ghost2.note2'],
            noteLayout: 'inline'
          },
          { author: 'user', text: 'guest1.user3' },
          {
            author: 'ghost',
            text: 'guest1.ghost3',
            notes: ['guest1.ghost3.note1', 'guest1.ghost3.note2'],
            noteLayout: 'inline'
          }
        ]
      },
      quest: {
        id: 'find-toilet',
        type: 'camera',
        requirement: { type: 'object', target: 'toilet' }
      },
      effects: {
        electricBorder: {
          speed: 1.2,
          persist: true
        }
      }
    },
    {
      id: 'guest1-chat-2',
      reactions: ['😍'],
      reactionPreset: '😍',
      event: {
        id: 'chat-2',
        autoStart: true,
        messages: [
          {
            author: 'ghost',
            text: 'guest1.ghost4',
            notes: ['guest1.ghost4.note1', 'guest1.ghost4.note2'],
            noteLayout: 'inline'
          },
          { author: 'user', text: 'guest1.user4' }
        ]
      },
      quest: {
        id: 'find-mug',
        type: 'camera',
        requirement: { type: 'object', target: 'cup' }
      },
      effects: {
        electricBorder: {}
      }
    },
    {
      id: 'guest1-farewell',
      reactions: ['😢'],
      reactionPreset: '😢',
      event: {
        id: 'farewell',
        autoStart: true,
        messages: [
          {
            author: 'ghost',
            text: 'guest1.end',
            effects: { reactionFinale: true },
            notes: ['guest1.end.note1', 'guest1.end.note2'],
            noteLayout: 'inline'
          },
          {
            author: 'ghost',
            type: 'youtube',
            youtubeId: 'bM7SZ5SBzyY',
            text: 'guest1.video'
          }
        ]
      },
      effects: {
        electricBorder: {}
      }
    }
  ],
  textAnimation: {
    initial: { effect: 'fx1', speed: 1.5 },
    replay: { effect: 'fx3', speed: 20 }
  },
  unlock: { requires: ['guide'], alwaysVisible: true },
  messenger: {
    post: [{ type: 'always' }],
    'switch-ghost': [{ type: 'always' }],
    'toggle-camera': [{ type: 'always' }],
    'reset-data': [{ type: 'always' }],
    'scroll-up': [{ type: 'always' }],
    'scroll-down': [{ type: 'always' }]
  }
};
