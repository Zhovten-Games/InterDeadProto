export default {
  welcome: {
    next: [{ type: 'always' }],
    'change-language': [{ type: 'always' }],
    'import-profile': [{ type: 'always' }]
  },
  registration: {
    next: [{ type: 'profileReady' }],
    'change-language': [{ type: 'always' }],
    'import-profile': [{ type: 'always' }]
  },
  'apartment-plan': {
    'detect-geo': [{ type: 'always' }],
    next: [{ type: 'always' }]
  },
  'registration-camera': {
    finish: [{ type: 'afterCapture' }]
  },
  camera: {
    'capture-btn': [{ type: 'always' }],
    'toggle-messenger': [{ type: 'always' }],
    finish: [{ type: 'afterCapture' }]
  }
};
