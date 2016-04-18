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

    // Calc yAxis
    this.calcYAxis(option);

    // Render background
    this.renderBarBackground();

    // Render Bar
    this.canvas.getContext('2d').translate(0.5, -0.5);
    this.renderBar();
  }

  renderBarBackground() {
    var ctx = this.bCanvas.getContext('2d'),
      option = this.option,
      yAxis = option.yAxis,
      marginLeft = this.marginLeft,
      height = this.height;

    ctx.translate(0.5, -0.5);
    ctx.strokeStyle = yAxis.color;
    ctx.lineWidth = 1;

    // Draw axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, 0);
    ctx.lineTo(marginLeft, height);
    ctx.lineTo(height, this.width);
    ctx.stroke();

    var strList = [];
    for (let i = 0, len = this.realMax / yAxis.tickPeriod; i <= len; i++) {
      strList.push('' + yAxis.tickPeriod * i);

      ctx.fillText('' + yAxis.tickPeriod * i, 0, height - this.ratio * yAxis.tickPeriod * i);
    }
  }

  calcYAxis(option) {
    var tickPeriod = option.yAxis.tickPeriod || 10;
    var data = option.series.map(function(m) {
      return m.value;
    });
    var max = Math.max.apply(null, data);
    var realMax = this.realMax = Math.ceil(max * 1.2 / tickPeriod) * tickPeriod;

    // var height = this.height;

    this.ratio = this.height / realMax;

    // Calc each bar height respectively
    this.heightList = data.map(n => {
      return Math.floor(this.ratio * n);
    });

    this.marginLeft = 20;
  }

  renderBar() {
    var ctx = this.canvas.getContext('2d'),
      option = this.option,
      series = option.series,
      height = this.height,
      heightList = this.heightList,
      barWidth = option.xAxis.barWidth,
      tickWidth = option.xAxis.tickWidth,
      gap = tickWidth - barWidth;

    ++this.count;
    var t = this.easingFunc(this.count / this.ticks);

    ctx.clearRect(0, 0, this.width, height);

    series.forEach((m, i) => {
      ctx.fillStyle = m.color;
      var h = heightList[i] * t;
      ctx.fillRect(this.marginLeft + tickWidth * i + gap - 0.5, height - h + 0.5, barWidth, h);

    });

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderBar.bind(this));
  }

}

module.exports = BarChart;
