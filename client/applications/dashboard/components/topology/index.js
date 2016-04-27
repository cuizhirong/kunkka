var autoscale = require('client/libs/charts/autoscale');
var utils = require('client/libs/charts/utils');

var colorMap = require('./utils/color');
var loader = require('./utils/loader');
var shape = require('./utils/shape');

var d = null,
  container = null,
  canvas = null,
  ctx = null,
  w = 0,
  h = 0,
  basicColor = '#59cbdb',
  textColor = '#000',
  imageList = [],
  positions = [];

class Topology {
  constructor(wp, data) {
    container = wp;
    d = data;


    w = wp.clientWidth;
    // calc height by data
    h = this.calcPos();

    utils.bind(window, 'resize', this.onResize.bind(this));
  }

  draw() {
    ctx.drawImage(imageList[0], Math.round(w / 2 - 49), 0, 98, 78);
    shape.roundRect(ctx, 0, 78, w, 5, 2, basicColor);

    positions.forEach((network, i) => {
      var _color = colorMap[i % 8];

      shape.roundRect(ctx, network.x, network.y, network.w, network.h, 5, _color.color);
      shape.text(ctx, network.name, network.x + 10, network.y + 16, textColor);

      network.subnets.forEach((subnet, j) => {
        shape.roundRect(ctx, subnet.x, subnet.y, subnet.w, subnet.h, 5, _color.subnetColor[j % 4]);
        shape.text(ctx, subnet.name, subnet.x + 10, subnet.y + 10, textColor);
      });
    });

  }

  calcPos() {
    console.log(d);
    var x = 0,
      y = 243;

    d.forEach((data, i) => {
      positions[i] = {
        x: x,
        w: w,
        name: data.name
      };

      if (i === 0) {
        positions[i].y = y;
      } else {
        positions[i].y = positions[i - 1].y + positions[i - 1].h + 160;
      }

      var subnets = data.subnets,
        len = subnets.length;

      if (len === 0) {
        positions[i].h = 60;
      } else {
        positions[i].h = 20 * len + (len - 1) * 12 + 40;
      }

      var _sub = positions[i].subnets = [];
      subnets.forEach((subnet, j) => {
        _sub.push({
          x: 10,
          y: positions[i].y + j * 30 + 30,
          w: w - 20,
          h: 20,
          name: subnet.name + '(' + subnet.cidr + ')'
        });
      });
    });

    // The last network
    var p = positions[positions.length - 1];
    return p.h + p.y + 260;
  }

  render() {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    autoscale([canvas], {
      width: w,
      height: h
    });

    // Loder resources
    loader(['/static/assets/icon-public-network.png']).then(data => {
      imageList = data;
      this.draw();
    });
  }

  onResize() {
    w = container.clientWidth;

    autoscale([canvas], {
      width: w,
      height: h
    });

    this.calcPos();
    this.draw();
  }

}

module.exports = Topology;
