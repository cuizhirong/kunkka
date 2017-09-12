const easing = require('./easing');
const autoscale = require('./autoscale');

class BarChart {
  constructor(container) {
    this.container = container;
    this.initDOM();
  }

  initDOM() {
    let canvas = this.canvas = document.createElement('canvas'),
      bCanvas = this.bCanvas = document.createElement('canvas');

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.container.appendChild(bCanvas);
    this.container.appendChild(canvas);

    autoscale([canvas, bCanvas], {
      width: this.width,
      height: this.height
    });

    canvas.getContext('2d').translate(0.5, -0.5);
    bCanvas.getContext('2d').translate(0.5, -0.5);


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
    this.renderBar();
  }

  renderBarBackground() {
    let ctx = this.bCanvas.getContext('2d'),
      option = this.option,
      yAxis = option.yAxis,
      marginLeft = this.marginLeft,
      height = this.height,
      width = this.height;

    ctx.strokeStyle = yAxis.color;
    ctx.fillStyle = yAxis.tickColor;
    ctx.lineWidth = 1;

    ctx.clearRect(0, 0, width, height);
    // Draw axis
    ctx.beginPath();
    ctx.moveTo(marginLeft + 5, 0);
    ctx.lineTo(marginLeft + 5, height - 2);
    ctx.lineTo(width, height - 2);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.font = '10px "Helvetica Neue"';
    for (let i = 0, len = this.realMax / this.tickPeriod; i <= len; i++) {
      let y = height - this.ratio * this.tickPeriod * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft + 5, y - 3);
      ctx.lineTo(marginLeft + 2, y - 3);
      ctx.stroke();
      ctx.fillText('' + this.tickPeriod * i, this.marginLeft, y);
    }
    // draw title
    ctx.textAlign = 'left';
    ctx.font = '14px "Helvetica Neue"';
    ctx.fillText(option.title, this.marginLeft + 20, 20);
  }

  calcYAxis(option) {
    let tickPeriod = this.tickPeriod = option.yAxis.tickPeriod || 10;
    let data = option.series.map(function(m) {
      return m.data;
    });
    let max = Math.max.apply(null, data);
    let realMax = this.realMax = Math.ceil(max * 1.2 / tickPeriod) * tickPeriod;

    this.ratio = this.height / realMax;

    // Calc each bar height respectively
    this.heightList = data.map(n => {
      return Math.floor(this.ratio * n);
    });

    // calc the width of y-text
    let ctx = this.canvas.getContext('2d');
    this.marginLeft = Math.ceil(ctx.measureText('' + realMax).width);
  }

  renderBar() {
    let ctx = this.canvas.getContext('2d'),
      option = this.option,
      series = option.series,
      height = this.height,
      heightList = this.heightList,
      barWidth = option.xAxis.barWidth,
      tickWidth = option.xAxis.tickWidth,
      gap = tickWidth - barWidth;

    ++this.count;
    let t = this.easingFunc(this.count / this.ticks);

    ctx.clearRect(0, 0, this.width, height);
    ctx.textAlign = 'center';

    series.forEach((m, i) => {
      ctx.fillStyle = m.color;
      let h = heightList[i] * t;
      ctx.fillRect(this.marginLeft + tickWidth * i + gap + 5, height - h + 0.5 - 3, barWidth, h);
      ctx.fillText(m.data + option.unit, this.marginLeft + tickWidth * i + gap + 5 + barWidth / 2, height - h + 0.5 - 3 - 6);

    });

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderBar.bind(this));
  }

}

module.exports = BarChart;
