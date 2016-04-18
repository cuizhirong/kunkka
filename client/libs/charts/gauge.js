var easing = require('./easing');
var autoscale = require('./autoscale');

class GaugeChart {
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
    this.renderGaugeBackground();

    // Render gauge
    // this.setStrokeStyle();
    this.renderGauge();
  }

  renderGaugeBackground() {
    var ctx = this.bCanvas.getContext('2d'),
      option = this.option,
      coordinate = [this.width / 2, this.height / 2],
      lineWidth = option.lineWidth * this.width / 2,
      radius = this.width / 2 - lineWidth / 2;

    ctx.strokeStyle = option.bgColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, 0, Math.PI, true);
    ctx.stroke();

    // TODO: draw ticks
    ctx.strokeStyle = option.tickColor;
  }

  // setStrokeStyle() {
  //   var ctx = this.canvas.getContext('2d');

  // }

  renderGauge() {
    var ctx = this.canvas.getContext('2d'),
      option = this.option,
      series = option.series,
      coordinate = [this.width / 2, this.height / 2],
      lineWidth = option.lineWidth * this.width / 2,
      radius = this.width / 2 - lineWidth / 2;

    ++this.count;
    var t = this.easingFunc(this.count / this.ticks);
    var percent = t * series[0].value;
    var arc = percent * Math.PI + Math.PI;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.strokeStyle = option.series[0].color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, Math.PI, arc, false);
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.fillStyle = option.pointer.color;

    //ctx.moveTo(0, coordinate[1]);
    ctx.moveTo(coordinate[0] + Math.cos(arc) * radius, coordinate[1] + Math.sin(arc) * radius);

    var c = Math.atan(Math.sqrt(radius * radius - 16) / 4);

    var x1 = c - percent * Math.PI;
    ctx.lineTo(coordinate[0] - Math.cos(x1) * 4, coordinate[1] + Math.sin(x1) * 4);

    var x2 = c - (Math.PI / 2 - percent * Math.PI);
    ctx.quadraticCurveTo(coordinate[0] - 5 * Math.cos(arc), coordinate[1] - 5 * Math.sin(arc), coordinate[0] + Math.sin(x2) * 4, coordinate[1] - Math.cos(x2) * 4);
      //ctx.lineTo(0, coordinate[1] - 2);
    ctx.fill();

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderGauge.bind(this));
  }

}

module.exports = GaugeChart;
