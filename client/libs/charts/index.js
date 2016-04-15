require('./animation');
// var easing = require('./easing');
var autoscale = require('./autoscale');

class Chart {
  constructor(container, opts) {
    this.container = container;
    this.opts = opts;
    this.ticks = Math.round(opts.period / 16);
    this.count = 0;
    this.onInitialize();
  }

  onInitialize() {
    var canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas'),
      textDiv = this.textDiv = document.createElement('div');
    this.setTextStyle(textDiv);
    this.container.appendChild(bCanvas);
    this.container.appendChild(textDiv);
    this.container.appendChild(canvas);

    autoscale([canvas, bCanvas], {
      width: this.opts.width,
      height: this.opts.height
    });

    this.drawBg();
    this.draw();
  }

  setTextStyle(dom) {
    dom.style.position = 'absolute';
    dom.style.textAlign = 'center';
    dom.style.width = this.opts.width + 'px';
    dom.style.height = this.opts.height + 'px';
    dom.style.lineHeight = this.opts.height + 'px';
    dom.style.fontSize = this.opts.text.fontSize;
    dom.style.color = this.opts.text.color;
    dom.innerHTML = '-';
  }

  init() {}

  drawBg() {
    var ctx = this.bCanvas.getContext('2d'),
      opt = this.opts,
      bgColor = opt.bgColor,
      coordinate = [opt.width / 2, opt.height / 2],
      lineWidth = opt.lineWidth,
      radius = opt.width / 2 - lineWidth / 2;

    ctx.strokeStyle = bgColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  draw() {
    var ctx = this.canvas.getContext('2d'),
      opt = this.opts,
      values = opt.values,
      coordinate = [opt.width / 2, opt.height / 2],
      lineWidth = opt.lineWidth,
      radius = opt.width / 2 - lineWidth / 2;

    ctx.strokeStyle = values[0].color;
    ctx.lineWidth = lineWidth;

    ++this.count;
    var percent = this.count / this.ticks * values[0].value;

    var arc = percent * Math.PI * 2 - Math.PI / 2;
    ctx.clearRect(0, 0, opt.width, opt.height);
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, -Math.PI / 2, arc, false);
    ctx.stroke();

    // draw text
    this.textDiv.innerHTML = Math.round(percent * 100) + '%';

    if (this.count === this.ticks) {
      return;
    }
    this.animationId = requestAnimationFrame(this.draw.bind(this));
  }

  setOptions() {

  }
}

module.exports = Chart;
