var easing = require('./easing');
var autoscale = require('./autoscale');

class GaugeChart {
  constructor(container) {
    this.container = container;
    this.initDOM();
  }

  initDOM() {
    var canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas'),
      tCanvas = this.tCanvas = document.createElement('canvas');

    this.maxRadius = Math.min(this.container.clientWidth / 2, this.container.clientHeight - 6);
    this.width = 2 * this.maxRadius;
    this.height = this.maxRadius + 6;

    this.container.appendChild(bCanvas);
    this.container.appendChild(canvas);
    this.container.appendChild(tCanvas);

    autoscale([canvas, bCanvas, tCanvas], {
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
    this.renderGauge();

    // Render gauge
    this.renderGaugeTick();
  }

  renderGaugeTick() {
    var ctx = this.tCanvas.getContext('2d'),
      option = this.option,
      tick = this.option.tick,
      coordinate = [this.maxRadius, this.maxRadius],
      lineWidth = option.lineWidth * this.maxRadius,
      outerRadius = this.maxRadius,
      innerRadius = outerRadius - tick.tickWidth,
      highlightRadius = outerRadius - tick.tickWidth * 1.5,
      textRadius = Math.min(outerRadius - tick.tickWidth * 3, this.maxRadius - lineWidth + 10),
      tickNum = 25;

    ctx.strokeStyle = tick.color;
    ctx.font = '10px "Helvetica Neue"';

    for (let i = 0; i <= tickNum; i++) {
      let arc = i / tickNum * Math.PI;
      ctx.beginPath();
      ctx.moveTo(coordinate[0] - Math.cos(arc) * outerRadius, coordinate[1] - Math.sin(arc) * outerRadius);
      if (i % 5 === 0) {
        ctx.lineWidth = 2;
        ctx.lineTo(coordinate[0] - Math.cos(arc) * highlightRadius, coordinate[1] - Math.sin(arc) * highlightRadius);
        let tickText = '' + i * 4;
        ctx.fillText(tickText, coordinate[0] - Math.cos(arc) * textRadius - 6, coordinate[1] - Math.sin(arc) * textRadius + 4);
      } else {
        ctx.lineWidth = 1;
        ctx.lineTo(coordinate[0] - Math.cos(arc) * innerRadius, coordinate[1] - Math.sin(arc) * innerRadius);
      }
      ctx.stroke();
    }
  }

  renderGaugeBackground() {
    var ctx = this.bCanvas.getContext('2d'),
      option = this.option,
      width = this.width,
      height = this.height,
      coordinate = [width / 2, width / 2],
      lineWidth = option.lineWidth * width / 2,
      radius = this.width / 2 - lineWidth / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = option.bgColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(coordinate[0], coordinate[1], radius, 0, Math.PI, true);
    ctx.stroke();
  }

  renderGauge() {
    var ctx = this.canvas.getContext('2d'),
      option = this.option,
      series = option.series,
      coordinate = [this.width / 2, this.width / 2],
      lineWidth = option.lineWidth * this.width / 2,
      radius = this.width / 2 - lineWidth / 2;

    ++this.count;
    var t = this.easingFunc(this.count / this.ticks);
    var percent = t * series[0].data;
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

    ctx.moveTo(coordinate[0] + Math.cos(arc) * radius, coordinate[1] + Math.sin(arc) * radius);

    var c = Math.atan(Math.sqrt(radius * radius - 16) / 4);

    var x1 = c - percent * Math.PI;
    ctx.lineTo(coordinate[0] - Math.cos(x1) * 4, coordinate[1] + Math.sin(x1) * 4);

    var x2 = c - (Math.PI / 2 - percent * Math.PI);
    ctx.quadraticCurveTo(coordinate[0] - 5 * Math.cos(arc), coordinate[1] - 5 * Math.sin(arc), coordinate[0] + Math.sin(x2) * 4, coordinate[1] - Math.cos(x2) * 4);
    ctx.fill();

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderGauge.bind(this));
  }

}

module.exports = GaugeChart;
