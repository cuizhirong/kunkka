var autoscale = require('client/libs/charts/autoscale');
var utils = require('client/libs/charts/utils');

var colorMap = require('./utils/color');
var loader = require('./utils/loader');
var shape = require('./utils/shape');


var resources = [
  '/static/assets/icon-public-network.png',
  '/static/assets/icon-network.png',
  '/static/assets/icon-floatingip.png',
  '/static/assets/icon-routers.png',
  '/static/assets/icon-status-active.png'
];

var d = null,
  container = null,
  canvas = null,
  ctx = null,
  w = 0,
  h = 0,
  basicColor = '#59cbdb',
  textColor = '#000',
  imageList = [],
  networkPos = [],
  routerPos = [],
  instancePos = [];

class Topology {
  constructor(wp, data) {
    container = wp;
    d = this.processData(data);


    w = wp.clientWidth;
    // calc height by data
    h = this.calcPos();

    utils.bind(window, 'resize', this.onResize.bind(this));
  }

  draw() {
    ctx.drawImage(imageList[0], Math.round(w / 2 - 49), 0, 98, 78);
    shape.roundRect(ctx, 0, 78, w, 5, 2, basicColor);

    // draw routers


    for (let len = networkPos.length, i = len - 1; i >= 0; i--) {
      var _color = colorMap[i % 8],
        network = networkPos[i];

      // 1. draw network
      shape.roundRect(ctx, network.x, network.y, network.w, network.h, 5, _color.color);
      ctx.drawImage(imageList[1], network.x + 10, network.y + 11, 16, 11);
      shape.text(ctx, network.name, network.x + 30, network.y + 16, textColor);

      // 2. draw instance link

      // 3. draw router link

      // 4. draw subnets
      network.subnets.forEach((subnet, j) => {
        shape.roundRect(ctx, subnet.x, subnet.y, subnet.w, subnet.h, 5, _color.subnetColor[j % 4]);
        shape.text(ctx, subnet.name, subnet.x + 10, subnet.y + 10, textColor);
      });

      // 5. draw instnaces

      // 6. draw link dots

    }

  }

  processData(data) {
    console.log(data);
    var networks = data.network;

    // process router
    data.router.forEach((r, i) => {
      routerPos[i] = {
        name: r.name,
        id: r.id,
        status: r.status,
        subnets: []
      };

      r.subnets.forEach((subnet) => {
        networks.some((network, j) => {
          return network.subnets.some((s, m) => {
            if (s.id === subnet.id) {
              routerPos[i].subnets.push({
                networkLayer: j,
                subnetLayer: m
              });
              return true;
            }
            return false;
          });
        });
      });
    });

    // process instance
    data.router.forEach((r, i) => {

    });

    console.log(routerPos);
    console.log(instancePos);
    return data;
  }

  calcPos() {
    var x = 0,
      y = 243;

    // calc network positions
    d.network.forEach((data, i) => {
      networkPos[i] = {
        x: x,
        w: w,
        name: data.name || ('(' + data.id.slice(0, 8) + ')')
      };

      if (i === 0) {
        networkPos[i].y = y;
      } else {
        networkPos[i].y = networkPos[i - 1].y + networkPos[i - 1].h + 160;
      }

      var subnets = data.subnets,
        len = subnets.length;

      if (len === 0) {
        networkPos[i].h = 60;
      } else {
        networkPos[i].h = 20 * len + (len - 1) * 12 + 40;
      }

      var _sub = networkPos[i].subnets = [];
      subnets.forEach((subnet, j) => {
        _sub.push({
          x: 10,
          y: networkPos[i].y + j * 30 + 30,
          w: w - 20,
          h: 20,
          name: subnet.name + '(' + subnet.cidr + ')'
        });
      });
    });

    // calc router positions
    // console.log(routerPos);

    // calc instance positions

    // The last network
    var p = networkPos[networkPos.length - 1];
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
    loader(resources).then(data => {
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
