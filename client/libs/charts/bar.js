var easing = require('./easing');
var autoscale = require('./autoscale');

class BarChart {
  constructor(container) {
    this.container = container;
    this.initDOM();
  }

  initDOM() {
    var canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas');

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.container.appendChild(bCanvas);
    this.container.appendChild(canvas);

    autoscale([canvas, bCanvas], {
      width: this.width,
      height: this.height
    });
  }

  setOption(option) {
    this.option = option;
    this.ticks = Math.round(option.period / 16);
    this.count = 0;
    this.easingFunc = easing[option.easing || 'linear'];

    // Render background
    this.renderPieBackground();

    // Render Pie
    this.setStrokeStyle();
    this.renderPie();
  }

  renderPieBackground() {
    var ctx = this.bCanvas.getContext('2d'),
      option = this.option,
      bgColor = option.bgColor,
      coordinate = [this.width / 2, this.height / 2],
      lineWidth = option.lineWidth,
      radius = this.width / 2 - lineWidth / 2;

    ctx.strokeStyle = bgColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  setStrokeStyle() {
    var ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = this.option.series[0].color;
    ctx.lineWidth = this.option.lineWidth;
  }

  renderPie() {
    var ctx = this.canvas.getContext('2d'),
      option = this.option,
      series = option.series,
      coordinate = [this.width / 2, this.height / 2],
      lineWidth = option.lineWidth,
      radius = this.width / 2 - lineWidth / 2;

    ++this.count;
    var t = this.easingFunc(this.count / this.ticks);
    var percent = t * series[0].value;
    var arc = percent * Math.PI * 2 - Math.PI / 2;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, -Math.PI / 2, arc, false);
    ctx.stroke();

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderPie.bind(this));
  }

}

module.exports = BarChart;
