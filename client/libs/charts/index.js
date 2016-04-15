require('./animation');
// var easing = require('./easing');
var autoscale = require('./autoscale');

class Chart {
  constructor(container, opts) {
    this.container = container;
    this.opts = opts;
    this.ticks = Math.round(opts.period / 16);
    this.count = 0;
    this.value = opts.value;
    this.onInitialize();
  }

  onInitialize() {
    var canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas');

    this.container.appendChild(bCanvas);
    this.container.appendChild(canvas);

    autoscale([canvas, bCanvas], {
      width: this.opts.width,
      height: this.opts.height
    });

    this.drawBg();
    this.draw();
  }

  init() {}

  drawBg() {
    var ctx = this.bCanvas.getContext('2d'),
      originX = this.opts.width / 2,
      originY = this.opts.height / 2;

    ctx.strokeStyle = '#f2f3f4';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(originX, originY, 60, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  draw() {
    var ctx = this.canvas.getContext('2d'),
      originX = this.opts.width / 2,
      originY = this.opts.height / 2;

    ctx.strokeStyle = '#ff5a67';
    ctx.lineWidth = 10;

    ++this.count;

    var arc = this.count / this.ticks * Math.PI * 2 * this.value - Math.PI / 2;

    ctx.beginPath();
    ctx.arc(originX, originY, 60, -Math.PI / 2, arc, false);
    ctx.stroke();

    if (this.count === this.ticks) {
      return;
    }
    this.animationId = requestAnimationFrame(this.draw.bind(this));
  }

  setOptions() {

  }
}

module.exports = Chart;
