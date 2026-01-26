export default {
  electricBorder: {
    enabled: false,
    targetSelector: '[data-js="panel-controls"]',
    effectClass: 'panel--has-effect',
    canvasDatasetKey: 'electric-border-canvas',
    defaults: {
      octaves: 10,
      lacunarity: 1.6,
      gain: 0.65,
      amplitude: 0.08,
      frequency: 9,
      baseFlatness: 0.1,
      displacement: 22,
      speed: 1,
      borderOffset: 14,
      borderRadius: 16,
      lineWidth: 1.5,
      color: '#1be4a6'
    }
  }
};
