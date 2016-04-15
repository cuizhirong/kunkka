var autoscale = require('./autoscale');

class Chart {
  constructor(container, opts) {
    this.container = container;
    this.opts = opts;
    this.onInitialize();
  }

  onInitialize() {
    var c = this.canvas = document.createElement('canvas');
    this.ctx = c.getContext('2d');
    this.container.appendChild(c);
    autoscale(c, {
      width: this.opts.width,
      height: this.opts.height
    });
  }

  draw() {
    var ctx = this.ctx,
      originX = this.opts.width / 2,
      originY = this.opts.height / 2;

    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(originX, originY, 100, 100, Math.PI * 2, true);
    ctx.fill();
  }

  setOptions() {

  }
}

module.exports = Chart;
