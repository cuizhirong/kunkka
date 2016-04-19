var easing = require('./easing');
var autoscale = require('./autoscale');

class LineChart {
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

    // Calc Axis
    this.calcAxis(option);

    // Render background
    this.renderLineBackground(option);

    // Render Line
    this.canvas.getContext('2d').translate(0.5, -0.5);
    this.renderLine(option);
  }

  calcAxis(option) {
    var tickPeriod = this.tickPeriod = option.yAxis.tickPeriod || 10;
    // var data = option.series.map(function(m) {
    //   return m.value;
    // });
    // var max = Math.max.apply(null, data);
    // var realMax = this.realMax = Math.ceil(max * 1.2 / tickPeriod) * tickPeriod;

    // this.ratio = this.height / realMax;

    // // Calc each bar height respectively
    // this.heightList = data.map(n => {
    //   return Math.floor(this.ratio * n);
    // });

    // // calc the width of y-text
    // var ctx = this.canvas.getContext('2d');
    // this.marginLeft = ctx.measureText('' + realMax).width;
    var max, min, data = [],
      realMax, realMin;
    option.series.forEach(function(m) {
      data = data.concat(m.data);
    });
    max = Math.max.apply(null, data);
    realMax = this.realMax = Math.ceil(max * 1.2 / tickPeriod) * tickPeriod;

    min = Math.min.apply(null, data);
    if (min >= 0) {
      realMin = this.realMin = 0;
    } else {
      realMin = this.realMin = Math.floor(min * 1.2 / tickPeriod) * tickPeriod;
    }
    console.log(max, realMax, min, realMin);

    this.marginLeft = 10;
    this.marginBottom = 10;

  }

  renderLineBackground(option) {
    var ctx = this.bCanvas.getContext('2d'),
      yAxis = option.yAxis,
      marginLeft = this.marginLeft,
      marginBottom = this.marginBottom,
      height = this.height,
      width = this.width;

    ctx.translate(0.5, -0.5);
    ctx.strokeStyle = yAxis.color;
    ctx.fillStyle = yAxis.tickColor;
    ctx.lineWidth = 1;

    // Draw yAxis
    ctx.beginPath();
    ctx.moveTo(marginLeft, 0);
    ctx.lineTo(marginLeft, height - marginBottom);
    ctx.stroke();

    // Draw xAxis
    ctx.beginPath();
    ctx.moveTo(marginLeft, height - marginBottom);
    ctx.lineTo(width, height - marginBottom);
    ctx.stroke();


    // var ctx = this.bCanvas.getContext('2d'),
    //   option = this.option,
    //   yAxis = option.yAxis,
    //   marginLeft = this.marginLeft,
    //   height = this.height;

    // ctx.translate(0.5, -0.5);
    // ctx.strokeStyle = yAxis.color;
    // ctx.fillStyle = yAxis.tickColor;
    // ctx.lineWidth = 1;

    // // Draw axis
    // ctx.beginPath();
    // ctx.moveTo(marginLeft + 5, 0);
    // ctx.lineTo(marginLeft + 5, height - 2);
    // ctx.lineTo(height - 3, this.width);
    // ctx.stroke();

    // ctx.textAlign = 'right';
    // for (let i = 0, len = this.realMax / this.tickPeriod; i <= len; i++) {
    //   let y = height - this.ratio * this.tickPeriod * i;
    //   ctx.beginPath();
    //   ctx.moveTo(marginLeft + 5, y - 3);
    //   ctx.lineTo(marginLeft + 2, y - 3);
    //   ctx.stroke();
    //   ctx.fillText('' + this.tickPeriod * i, this.marginLeft, y);
    // }
    // // draw title
    // ctx.textAlign = 'left';
    // ctx.font = '14px "Helvetica Neue"';
    // ctx.fillText(option.title, this.marginLeft + 20, 20);
  }

  renderLine() {
    // var ctx = this.canvas.getContext('2d'),
    //   option = this.option,
    //   series = option.series,
    //   height = this.height,
    //   heightList = this.heightList,
    //   barWidth = option.xAxis.barWidth,
    //   tickWidth = option.xAxis.tickWidth,
    //   gap = tickWidth - barWidth;

    // ++this.count;
    // var t = this.easingFunc(this.count / this.ticks);

    // ctx.clearRect(0, 0, this.width, height);
    // ctx.textAlign = 'center';

    // series.forEach((m, i) => {
    //   ctx.fillStyle = m.color;
    //   var h = heightList[i] * t;
    //   ctx.fillRect(this.marginLeft + tickWidth * i + gap + 5, height - h + 0.5 - 3, barWidth, h);
    //   ctx.fillText(m.value + option.unit, this.marginLeft + tickWidth * i + gap + 5 + barWidth / 2, height - h + 0.5 - 3 - 2);

    // });

    if (this.count === this.ticks) {
      this.count = 0;
      return;
    }
    this.animationId = requestAnimationFrame(this.renderLine.bind(this));
  }

}

module.exports = LineChart;
