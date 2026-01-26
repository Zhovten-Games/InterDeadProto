/**
 * Canvas renderer for an animated electric border.
 *
 * The renderer previously distorted the outline with noise which introduced
 * self-intersections once the widget was integrated into the main
 * application. The updated implementation keeps the animation loop but draws
 * a clean rounded rectangle that follows the panel border precisely.
 */
export default class ElectricBorderRenderer {
  constructor(canvas = null, settings = {}) {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = 0;
    this.bounds = { width: 0, height: 0 };
    this.settings = {
      octaves: 8,
      lacunarity: 1.5,
      gain: 0.6,
      amplitude: 0.08,
      frequency: 8,
      baseFlatness: 0.15,
      displacement: 20,
      speed: 1,
      borderOffset: 12,
      borderRadius: 12,
      lineWidth: 1.5,
      color: '#1be4a6',
      ...settings
    };
    this._drawFrame = this._drawFrame.bind(this);
    if (canvas) {
      this.attach(canvas);
    }
  }

  attach(canvas) {
    if (!canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._configureLine();
  }

  update(settings = {}) {
    this.settings = { ...this.settings, ...settings };
    this._configureLine();
    if (!this.animationId) {
      this.start();
    }
  }

  start() {
    if (!this.canvas || !this.ctx) return;
    if (this.animationId) return;
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame(this._drawFrame);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize(width, height) {
    if (!this.canvas || !this.ctx || !width || !height) return;
    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = Math.max(1, Math.floor(width * ratio));
    const h = Math.max(1, Math.floor(height * ratio));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    this.bounds = { width, height };
    this._configureLine();
  }

  _configureLine() {
    if (!this.ctx) return;
    this.ctx.strokeStyle = this.settings.color;
    this.ctx.lineWidth = this.settings.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  _drawFrame(currentTime) {
    if (!this.canvas || !this.ctx) {
      this.animationId = null;
      return;
    }
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.time += deltaTime * (this.settings.speed || 1);
    this.lastFrameTime = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const { width, height } = this.bounds;
    if (!width || !height) {
      this.animationId = requestAnimationFrame(this._drawFrame);
      return;
    }

    const borderOffset = Math.min(
      this.settings.borderOffset,
      width / 2,
      height / 2
    );
    const left = borderOffset;
    const top = borderOffset;
    const borderWidth = Math.max(0, width - borderOffset * 2);
    const borderHeight = Math.max(0, height - borderOffset * 2);
    const maxRadius = Math.min(borderWidth, borderHeight) / 2;
    const radius = Math.min(this.settings.borderRadius, maxRadius);

    this.ctx.beginPath();
    this._traceRoundedRectPath(left, top, borderWidth, borderHeight, radius);
    this.ctx.closePath();
    this.ctx.stroke();

    this.animationId = requestAnimationFrame(this._drawFrame);
  }

  _traceRoundedRectPath(left, top, width, height, radius) {
    // Draw a precise outline that matches the panel border without noisy
    // perturbations so the electric frame no longer produces loops.
    if (radius <= 0) {
      this.ctx.moveTo(left, top);
      this.ctx.lineTo(left + width, top);
      this.ctx.lineTo(left + width, top + height);
      this.ctx.lineTo(left, top + height);
      return;
    }

    this.ctx.moveTo(left + radius, top);
    this.ctx.lineTo(left + width - radius, top);
    this.ctx.quadraticCurveTo(left + width, top, left + width, top + radius);
    this.ctx.lineTo(left + width, top + height - radius);
    this.ctx.quadraticCurveTo(
      left + width,
      top + height,
      left + width - radius,
      top + height
    );
    this.ctx.lineTo(left + radius, top + height);
    this.ctx.quadraticCurveTo(left, top + height, left, top + height - radius);
    this.ctx.lineTo(left, top + radius);
    this.ctx.quadraticCurveTo(left, top, left + radius, top);
  }

}
