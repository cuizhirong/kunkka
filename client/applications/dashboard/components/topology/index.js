var autoscale = require('client/libs/charts/autoscale');
var utils = require('client/libs/charts/utils');
var routerUtil = require('client/utils/router');

var colorMap = require('./utils/color');
var loader = require('./utils/loader');
var shape = require('./utils/shape');
var CanvasEvent = require('./utils/event');

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
  event = null,
  w = 0,
  h = 0,
  maxWidth = 0,
  basicColor = '#59cbdb',
  textColor = '#000',
  borderColor = '#d5dee2',
  imageList = [],
  networkPos = [],
  routerPos = [],
  instancePos = [];

class Topology {
  constructor(wp, data) {
    if (data.instance && data.instance.length > 50) {
      return;
    }
    container = wp;
    d = this.processData(data);


    w = wp.clientWidth;
    // calc height by data
    h = this.calcPos();

    utils.bind(window, 'resize', this.onResize.bind(this));
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
        subnets: [],
        gateway: r.external_gateway_info
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
    var tmpInstancePos = [];
    data.instance.forEach((instance, i) => {
      tmpInstancePos[i] = {
        name: instance.name,
        id: instance.id,
        status: instance.status,
        subnets: []
      };

      var addrs = instance.addresses;
      Object.keys(addrs).forEach((key) => {
        var _networks = addrs[key];
        _networks.forEach((n) => {
          var subnet = n.subnet;
          networks.some((network, j) => {
            return network.subnets.some((s, m) => {
              if (s.id === subnet.id) {
                tmpInstancePos[i].subnets.push({
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
    });

    tmpInstancePos.forEach((instance, i) => {
      var subnets = instance.subnets;
      if (subnets.length === 0) {
        instance.layer = -1;
      } else {
        instance.subnets = subnets.sort((a, b) => {
          return a.networkLayer - b.networkLayer;
        });
        instance.layer = subnets[0].networkLayer;
      }
    });

    tmpInstancePos.sort((a, b) => {
      return a.layer - b.layer;
    });

    var cursor;
    tmpInstancePos.forEach((instance) => {
      var len = instancePos.length;
      if (instance.layer === cursor) {
        instancePos[len - 1].instances.push(instance);
      } else {
        cursor = instance.layer;
        instancePos[len] = {
          layer: cursor,
          instances: [instance]
        };
      }
    });

    // console.log(tmpInstancePos);
    // console.log(routerPos);
    // console.log(instancePos);
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
        name: data.name || ('(' + data.id.slice(0, 8) + ')'),
        id: data.id
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
          name: subnet.name + '(' + subnet.cidr + ')',
          id: subnet.id
        });
      });
    });

    // calc router positions
    console.log(routerPos);
    routerPos.forEach((router, i) => {
      if (i === 0) {
        router.x = 0.5;
      } else {
        router.x = routerPos[i - 1].x + routerPos[i - 1].w + 10;
      }
      router.y = 134.5; //83 + 51 + 0.5
      router.h = 58;

      var len = router.subnets.length;
      if (len > 1) {
        router.w = 78 + (len - 1) * 10;
      } else {
        router.w = 78;
      }

      var start = (router.w - 12 * len + 10) / 2 + router.x;
      router.subnets.forEach((subnet, j) => {
        subnet.x = start + j * 12;
        subnet.y = router.y + router.h;
        // subnet.w = 2;
        subnet.h = 100;
      });
    });
    var _routerLen = routerPos.length;
    if (_routerLen === 0) {
      maxWidth = 0;
    } else {
      let lastRouter = routerPos[_routerLen - 1];
      maxWidth = lastRouter.w + lastRouter.x;
    }

    // calc instance positions

    // The last network
    var p = networkPos[networkPos.length - 1];
    return p.h + p.y + 260;
  }

  draw() {
    var offsetX = Math.round((w - maxWidth) / 2);

    ctx.drawImage(imageList[0], Math.round(w / 2 - 49), 0, 98, 78);
    shape.roundRect(ctx, 0, 78, w, 5, 2, basicColor);

    // draw routers
    routerPos.forEach((router, i) => {
      if (router.gateway) {
        ctx.fillStyle = basicColor;
        ctx.fillRect(router.x + offsetX + router.w / 2 - 0.5, router.y - 52, 2, 52);
      }
      shape.roundRect(ctx, router.x + offsetX, router.y, router.w, router.h, 2, borderColor, true);
    });


    for (let len = networkPos.length, i = len - 1; i >= 0; i--) {
      var _color = colorMap[i % 8],
        network = networkPos[i];

      // 1. draw network
      shape.roundRect(ctx, network.x, network.y, network.w, network.h, 5, _color.color);
      ctx.drawImage(imageList[1], network.x + 10, network.y + 11, 16, 11);
      shape.text(ctx, network.name, network.x + 30, network.y + 16, textColor);
      (function(n) {
        event.bind({
          left: n.x,
          top: n.y,
          width: n.w,
          height: n.h
        }, 0, function() {
          routerUtil.pushState('/dashboard/network/' + n.id);
        });
      })(network);

      // 2. draw instance link

      // 3. draw router link

      // 4. draw subnets
      network.subnets.forEach((subnet, j) => {
        shape.roundRect(ctx, subnet.x, subnet.y, subnet.w, subnet.h, 5, _color.subnetColor[j % 4]);
        shape.text(ctx, subnet.name, subnet.x + 10, subnet.y + 10, textColor);
        event.bind({
          left: subnet.x,
          top: subnet.y,
          width: subnet.w,
          height: subnet.h
        }, 1, function() {
          routerUtil.pushState('/dashboard/subnet/' + subnet.id);
        });
      });

      // 5. draw instnaces

      // 6. draw link dots

    }

  }

  render() {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    event = new CanvasEvent(canvas);
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
