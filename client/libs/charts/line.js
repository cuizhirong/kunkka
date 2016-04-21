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

    this.marginLeft = 20;
    this.marginBottom = 20;

    this.ratioY = (this.height - this.marginBottom) / (realMax - realMin);
    // console.log(this.height-this.marginBottom,this.ratioY)
    // console.log(max, realMax, min, realMin);

    var xData = option.xAxis.data;
    this.interval = Math.ceil(xData.length / 6);
    this.ratioX = (this.width - this.marginLeft) / xData.length;
    // console.log(interval, this.ratioX);


  }

  renderLineBackground(option) {
    var ctx = this.bCanvas.getContext('2d'),
      yAxis = option.yAxis,
      marginLeft = this.marginLeft,
      marginBottom = this.marginBottom,
      height = this.height,
      width = this.width,
      xData = option.xAxis.data;

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

    var t = height - marginBottom - this.ratioY * this.tickPeriod * (-this.realMin) / this.tickPeriod;
    ctx.moveTo(marginLeft, t);
    ctx.lineTo(width, t);
    ctx.stroke();

    // draw yAxis
    ctx.textAlign = 'right';
    //console.log((this.realMax-this.realMin) / this.tickPeriod)
    for (let i = 0, len = (this.realMax - this.realMin) / this.tickPeriod; i < len; i++) {
      let y = height - this.ratioY * this.tickPeriod * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y - marginBottom);
      ctx.lineTo(marginLeft - 3, y - marginBottom);
      ctx.stroke();
      ctx.fillText(this.tickPeriod * i + this.realMin, this.marginLeft - 5, y - marginBottom + 3);
    }

    // draw xAxis
    ctx.textAlign = 'center';
    for (let i = 1, len = Math.ceil(xData.length / this.interval); i < len; i++) {
      let x = marginLeft + i * this.ratioX * this.interval;
      ctx.beginPath();
      ctx.moveTo(x, t);
      ctx.lineTo(x, t + 3);
      ctx.stroke();
      ctx.fillText(xData[i * this.interval], x, t + 15);
    }

    // draw title
    ctx.textAlign = 'left';
    ctx.font = '13px "Helvetica Neue"';
    ctx.fillText(option.title, this.marginLeft + 20, 20);
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
