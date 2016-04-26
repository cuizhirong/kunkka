var autoscale = require('client/libs/charts/autoscale');
var utils = require('client/libs/charts/utils');

// var colorMap = require('./utils/color');
var loader = require('./utils/loader');

var d = null,
  container = null,
  canvas = null,
  ctx = null,
  w = 0,
  h = 0,
  // basicColor = '#59cbdb',
  imageList = [];

class Topology {
  constructor(wp, data) {
    container = wp;
    d = data;

    console.log(d);
    utils.bind(window, 'resize', this.onResize.bind(this));
  }

  draw(data) {
    var img = data[0];

    ctx.drawImage(img, 10, 10, 98, 78);
  }

  render() {
    canvas = document.createElement('canvas');

    w = container.clientWidth;
    h = container.clientHeight;

    container.appendChild(canvas);

    autoscale([canvas], {
      width: w,
      height: h
    });

    ctx = canvas.getContext('2d');

    // Loder resources
    loader(['/static/assets/icon-public-network.png']).then(data => {
      imageList = data;
      this.draw(data);
    });
  }

  onResize() {
    w = container.clientWidth;
    h = container.clientHeight;
    autoscale([canvas], {
      width: w,
      height: h
    });
    this.draw(imageList);
  }

}

module.exports = Topology;
