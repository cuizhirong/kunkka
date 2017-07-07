var autoscale = require('client/libs/charts/autoscale');
var utils = require('client/libs/charts/utils');
var routerUtil = require('client/utils/router');

var colorMap = require('./utils/color');
var loader = require('./utils/loader');
var shape = require('./utils/shape');
var CanvasEvent = require('./utils/event');

var resources = [
    '/static/assets/dashboard/icon-public-network.png',
    '/static/assets/dashboard/icon-network.png',
    '/static/assets/dashboard/icon-floatingip.png',
    '/static/assets/dashboard/icon-routers.png',
    '/static/assets/dashboard/icon-status.png',
    '/static/assets/dashboard/icon_images.png',
    '/static/assets/dashboard/icon-lb.png'
  ],
  imageMap = {
    'undefined': [0, 0],
    centos: [0, 42],
    opensuse: [0, 84],
    fedora: [0, 126],
    ubuntu: [0, 168],
    windows: [0, 210],
    debian: [0, 252],
    arch: [0, 294],
    coreos: [0, 336],
    gentoo: [0, 378],
    rhel: [0, 420],
    cirros: [0, 0]
  },
  statusMap = {
    ACTIVE: [0, 0],
    SHUTOFF: [0, 30],
    PAUSED: [0, 60],
    ERROR: [0, 90],
    OTHER: [0, 120]
  };

var resourceReady = false,
  d = null,
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
  instancePos = [],
  loadbalancerPos = [],
  placeholder = []; // Calc the used positions of instances

class Topology {
  constructor(wp, data) {
    container = wp;

    if (data.instance && data.instance.length > 50) {
      data.instance = data.instance.slice(0, 50);
    }
    d = this.processData(data);

    w = wp.clientWidth;
    // calc height by data
    h = this.calcPos();

    utils.bind(window, 'resize', this.onResize.bind(this));
  }

  processData(data) {
    // Reset data
    networkPos = [];
    routerPos = [];
    instancePos = [];
    loadbalancerPos = [];

    var networks = data.network;

    // process router
    data.router.forEach((r, i) => {
      routerPos[i] = {
        name: r.name || '(' + r.id.slice(0, 8) + ')',
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
        subnets: [],
        image: (instance.image.image_label + '').toLowerCase(),
        floating_ip: instance.floating_ip
      };

      var addrs = instance.addresses;
      Object.keys(addrs).forEach((key) => {
        var _networks = addrs[key];
        _networks.forEach((n) => {
          if (n['OS-EXT-IPS:type'] === 'floating') {
            return;
          }
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

    // loadbalancer
    var tmpLoadbalancerPos = [];
    data.loadbalancer.forEach((l, i) => {
      tmpLoadbalancerPos[i] = {
        name: l.name || '(' + l.id.slice(0, 8) + ')',
        id: l.id,
        status: l.provisioning_status,
        vip_address: l.vip_address,
        vip_subnet_id: l.vip_subnet_id,
        floatingip: l.floatingip,
        subnets: []
      };

      networks.some((network, j) => {
        return network.subnets.some((s, m) => {
          if (s.id === l.vip_subnet_id) {
            tmpLoadbalancerPos[i].subnets.push({
              networkLayer: j,
              subnetLayer: m
            });
            return true;
          }
          return false;
        });
      });

      tmpLoadbalancerPos[i].layer = tmpLoadbalancerPos[i].subnets[0].networkLayer;
    });

    tmpLoadbalancerPos.forEach((loadbalancer, i) => {
      var subnets = loadbalancer.subnets;
      loadbalancer.subnets = subnets.sort((a, b) => {
        return a.networkLayer - b.networkLayer;
      });
      loadbalancer.layer = subnets[0].networkLayer;
    });

    tmpLoadbalancerPos.sort((a, b) => {
      return a.layer - b.layer;
    });

    var cursor2;
    tmpLoadbalancerPos.forEach((loadbalancer) => {
      var len = loadbalancerPos.length;
      if (loadbalancer.layer === cursor2) {
        loadbalancerPos[len - 1].loadbalancers.push(loadbalancer);
      } else {
        cursor2 = loadbalancer.layer;
        loadbalancerPos[len] = {
          layer: cursor2,
          loadbalancers: [loadbalancer]
        };
      }
    });

    // console.log('tmpLb', tmpLoadbalancerPos);

    // console.log('tmpInstancePos', tmpInstancePos);
    // console.log('routerPos', routerPos);
    // console.log('instancePos', instancePos);
    // console.log('loadbalancerPos', loadbalancerPos);
    return data;
  }

  calcPos() {
    var x = 0,
      y = 243;
    // reset max width
    maxWidth = 0;

    // calc network positions
    d.network.forEach((data, i) => {
      networkPos[i] = {
        x: x,
        w: w,
        name: data.name || ('(' + data.id.slice(0, 8) + ')'),
        id: data.id,
        maxWidth: 0 // instances' width
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
    // console.log(routerPos);
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
        subnet.x = start + j * 12 - 0.5;
        subnet.y = router.y + router.h;
        // subnet.w = 2;
        // subnet.h = 100;
      });
    });
    var _routerLen = routerPos.length;
    if (_routerLen !== 0) {
      let lastRouter = routerPos[_routerLen - 1];
      maxWidth = lastRouter.w + lastRouter.x;
    }

    // calc instance positions
    placeholder = [];
    var loop = 0;
    routerPos.forEach((router) => {
      router.subnets.forEach((s) => {
        var _layer = s.networkLayer;

        for (loop = 0; loop < _layer; loop++) {
          if (!placeholder[loop]) {
            placeholder[loop] = [];
          }
          placeholder[loop].push({
            x: router.x,
            w: router.w,
            subnetLayer: s.subnetLayer,
            networkLayer: s.networkLayer
          });
        }

      });
    });

    instancePos.forEach((instance) => {
      var layer = instance.layer,
        instances = instance.instances,
        mw = 0;

      if (layer === -1) {
        instances.forEach((ins, i) => {
          if (i === 0) {
            ins.x = routerPos.length === 0 ? maxWidth + 0.5 : maxWidth + 10;
          } else {
            ins.x = maxWidth + 10;
          }
          ins.y = 134.5;
          ins.h = 58;
          ins.w = 78;
          maxWidth = ins.x + 78;
        });
        return;
      }
      instances.forEach((ins, insindex) => {
        // 1.先计算每一个instance的实际宽度
        let up = 0,
          down = 0;
        ins.subnets.forEach((s) => {
          if (s.networkLayer === layer) {
            ++up;
          } else {
            ++down;
          }
        });

        let max = Math.max(up, down);
        if (max === 0) {
          ins.w = 78;
        } else {
          ins.w = 78 + (max - 1) * 10;
        }

        let _l = networkPos[ins.layer];
        ins.y = _l.h + _l.y + 51.5; // 51+0.5
        ins.h = 58;

        // 2.根据placehoder算出instance实际的x坐标
        var cur = 0.5,
          p = placeholder[layer];
        if (p) {
          p.some((_p, i) => {
            if (i === 0) {
              cur = 0.5;
            } else {
              cur = p[i - 1].x + p[i - 1].w + 10;
            }
            let next = cur + ins.w + 10;
            if (next <= _p.x) {
              ins.x = cur;
              p.splice(i, 0, {
                x: cur,
                w: ins.w
              });
              return true;
            }
            return false;
          });
          if (ins.x === void(0)) { // last postion in the row
            ins.x = p[p.length - 1].x + p[p.length - 1].w + 10;
            p.push({
              x: ins.x,
              w: ins.w
            });
          }
        } else {
          ins.x = cur;
          placeholder[layer] = [{
            x: cur,
            w: ins.w
          }];
        }

        var upX = ins.x + (ins.w - up * 12 + 10) / 2 - 0.5,
          downX = ins.x + (ins.w - down * 12 + 10) / 2 - 0.5;

        ins.subnets.forEach((s) => {
          if (s.networkLayer === layer) {
            s.x = upX;
            upX += 12;
          } else {
            s.x = downX;
            downX += 12;
          }
        });

        // 3.根据当前instance的子网，给placeholder重新赋值
        ins.subnets.forEach((subnet) => {
          if (subnet.networkLayer === ins.layer) {
            return;
          }
          for (let _loop = ins.layer + 1; _loop < subnet.networkLayer; _loop++) {
            if (!placeholder[_loop]) {
              placeholder[_loop] = [{
                x: ins.x,
                w: ins.w,
                subnetLayer: subnet.subnetLayer,
                networkLayer: subnet.networkLayer
              }];
            } else {
              let b = placeholder[_loop].some((_p, i) => { // placeholder 插入顺序按x轴从小到大排序
                if (ins.x <= _p.x) {
                  placeholder[_loop].splice(i, 0, {
                    x: ins.x,
                    w: ins.w,
                    subnetLayer: subnet.subnetLayer,
                    networkLayer: subnet.networkLayer
                  });
                  return true;
                }
                return false;
              });
              if (!b) {
                placeholder[_loop].push({
                  x: ins.x,
                  w: ins.w,
                  subnetLayer: subnet.subnetLayer,
                  networkLayer: subnet.networkLayer
                });
              }
            }
          }
        });

        if(insindex + 1 === instances.length) {
          mw = ins.x + ins.w + 10;
        }
      });
      if(layer !== -1) {
        networkPos[layer].maxWidth = mw;
      }

      var lastEle = instances[instances.length - 1];
      if (lastEle.x + lastEle.w > maxWidth) {
        maxWidth = lastEle.x + lastEle.w;
      }
    });

    loadbalancerPos.forEach((lo, loi) => {
      let layer = lo.layer;
      let _lo = networkPos[layer];
      lo.loadbalancers.forEach((_lb, i) => {
        _lb.w = 78;
        _lb.y = _lo.h + _lo.y + 51.5;
        _lb.h = 58;
        _lb.x = _lo.maxWidth + i * (10 + 78) + (_lo.maxWidth > 0 ? 0 : 0.5);
        // var start = (router.w - 12 * len + 10) / 2 + router.x;
        _lb.subnets.forEach((subnet, j) => {
          subnet.x = _lb.w / 2 + _lb.x + j * 12 - 0.5;
          subnet.y = _lb.y + _lb.h;
        });
      });
    });
    // console.log('calcu', loadbalancerPos);

    // console.log('placeholder: ', placeholder);
    // console.log('instancePos: ', instancePos);
    // console.log('networkPos', networkPos);
    if (networkPos.length === 0) {
      return 260;
    }
    // The last network
    var p = networkPos[networkPos.length - 1];
    return p.h + p.y + 260;
  }

  draw() {
    var offsetX = Math.round((w - maxWidth) / 2);
    if (offsetX < 0) {
      offsetX = 0;
    }

    // clear canvas
    ctx.clearRect(0, 0, w, h);
    // clear events
    event.unBindAll();

    ctx.drawImage(imageList[0], Math.round(w / 2 - 49), 0, 98, 78);
    shape.roundRect(ctx, 0, 78, w, 5, 2, basicColor);

    // draw routers
    routerPos.forEach((router, i) => {
      var _x = router.x + offsetX;
      if (router.gateway) {
        ctx.fillStyle = basicColor;
        ctx.fillRect(_x + router.w / 2 - 0.5, router.y - 52, 2, 52);
      }
      shape.roundRect(ctx, _x, router.y, router.w, router.h, 2, borderColor, true);
      ctx.drawImage(imageList[3], _x + router.w / 2 - 13.5, router.y + 7.5, 26, 26);
      shape.text(ctx, router.name, _x + router.w / 2, router.y + 45, textColor, 'center', router.w);
      if (router.gateway) {
        ctx.drawImage(imageList[2], _x + 3.5, router.y + 3.5, 16, 16);
      }
      ctx.drawImage(imageList[4], statusMap[router.status][0], statusMap[router.status][1],
        30, 30, _x + router.w - 18.5, router.y + 3.5, 15, 15);
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

      // 2. draw subnets
      var _subnets = network.subnets;
      for (let sLen = _subnets.length, j = sLen - 1; j >= 0; j--) {
        let subnet = _subnets[j];
        let subnetColor = _color.subnetColor[j % 4];

        shape.roundRect(ctx, subnet.x, subnet.y, subnet.w, subnet.h, 5, subnetColor);
        shape.text(ctx, subnet.name, subnet.x + 10, subnet.y + 10, textColor);

        // 画路由器和子网的连接线
        routerPos.forEach((r) => {
          r.subnets.some((s) => {
            if (s.networkLayer === i && s.subnetLayer === j) {
              ctx.fillStyle = subnetColor;
              ctx.fillRect(s.x + offsetX, s.y, 2, subnet.y - s.y);
              return true;
            }
            return false;
          });
        });

        // 画云主机和子网的连线
        instancePos.forEach((instances) => {
          var layer = instances.layer;
          if (layer === -1) {
            return;
          }
          instances.instances.forEach((_instance) => {

            _instance.subnets.forEach((s) => {
              if (i === s.networkLayer && j === s.subnetLayer) {
                if (s.networkLayer === layer) {
                  // 画上半部分link
                  ctx.fillStyle = subnetColor;
                  ctx.fillRect(offsetX + s.x, subnet.y + 20, 2, _instance.y - subnet.y - 20);
                } else {
                  // 画下半部分link
                  ctx.fillStyle = subnetColor;
                  ctx.fillRect(offsetX + s.x, _instance.y + 58, 2, subnet.y - _instance.y - 58);
                }
              }
            });
          });
        });

        // 画负载均衡和子网的连线
        loadbalancerPos.forEach((loadbalancer) => {
          let layer = loadbalancer.layer;
          loadbalancer.loadbalancers.forEach((_loadbalancer) => {
            _loadbalancer.subnets.forEach((s) => {
              if (i === s.networkLayer && j === s.subnetLayer) {
                if (s.networkLayer === layer) {
                  // 画上半部分link
                  ctx.fillStyle = subnetColor;
                  ctx.fillRect(offsetX + s.x, subnet.y + 20, 2, _loadbalancer.y - subnet.y - 20);
                } else {
                  // 画下半部分link
                  ctx.fillStyle = subnetColor;
                  ctx.fillRect(offsetX + s.x, _loadbalancer.y + 58, 2, subnet.y - _loadbalancer.y - 58);
                }
              }
            });
          });
        });

        event.bind({
          left: subnet.x,
          top: subnet.y,
          width: subnet.w,
          height: subnet.h
        }, 1, function() {
          routerUtil.pushState('/dashboard/subnet/' + subnet.id);
        });
      }

    }

    // draw instnaces
    instancePos.forEach((instances, i) => {
      instances.instances.forEach((_instance) => {
        var _x = _instance.x + offsetX;
        shape.roundRect(ctx, _x, _instance.y, _instance.w, _instance.h, 2, borderColor, true);
        ctx.drawImage(imageList[5], imageMap[_instance.image][0], imageMap[_instance.image][1],
          40, 40, _x + _instance.w / 2 - 13.5, _instance.y + 7.5, 26, 26);

        // DRAW STATUS
        let statusPos = statusMap[_instance.status];
        if (!statusPos) {
          statusPos = statusMap.OTHER;
        }
        ctx.drawImage(imageList[4], statusPos[0], statusPos[1],
          30, 30, _x + _instance.w - 18.5, _instance.y + 3.5, 15, 15);
        shape.text(ctx, _instance.name, _x + _instance.w / 2, _instance.y + 45, textColor, 'center', _instance.w);
        if (_instance.floating_ip) {
          ctx.drawImage(imageList[2], _x + 3.5, _instance.y + 3.5, 16, 16);
        }
        (function(n) {
          event.bind({
            left: _x,
            top: n.y,
            width: n.w,
            height: n.h
          }, 0, function() {
            routerUtil.pushState('/dashboard/instance/' + n.id);
          });
        })(_instance);
      });
    });

    // draw link dots

    // draw loadbalancer
    loadbalancerPos.forEach((loadbalancer) => {
      loadbalancer.loadbalancers.forEach((_loadbalancer) => {
        let _x = _loadbalancer.x + offsetX;
        shape.roundRect(ctx, _x, _loadbalancer.y, _loadbalancer.w, _loadbalancer.h, 2, borderColor, true);
        ctx.drawImage(imageList[6], _x + _loadbalancer.w / 2 - 13.5, _loadbalancer.y + 7.5, 26, 26);
        shape.text(ctx, _loadbalancer.name, _x + _loadbalancer.w / 2, _loadbalancer.y + 45, textColor, 'center', _loadbalancer.w);
        // DRAW STATUS
        let statusPos = statusMap[_loadbalancer.status];
        if (!statusPos) {
          statusPos = statusMap.OTHER;
        }
        ctx.drawImage(imageList[4], statusPos[0], statusPos[1],
          30, 30, _x + _loadbalancer.w - 18.5, _loadbalancer.y + 3.5, 15, 15);
        // DRAW fIP
        if (_loadbalancer.floatingip) {
          ctx.drawImage(imageList[2], _x + 3.5, _loadbalancer.y + 3.5, 16, 16);
        }
        (function(n) {
          event.bind({
            left: _x,
            top: n.y,
            width: n.w,
            height: n.h
          }, 0, function() {
            routerUtil.pushState('/dashboard/loadbalancer/' + n.id);
          });
        })(_loadbalancer);
      });
    });

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
      resourceReady = true;
      var loading = container.getElementsByClassName('loading')[0];
      loading && loading.classList.add('hide');
      this.draw();
    });
  }

  onResize() {
    if (!resourceReady) {
      return;
    }

    w = container.clientWidth;
    autoscale([canvas], {
      width: w,
      height: h
    });
    this.calcPos();
    this.draw();
  }

  reRender(data) {
    if (!resourceReady) {
      return;
    }

    d = this.processData(data);
    w = container.clientWidth;
    h = this.calcPos();
    autoscale([canvas], {
      width: w,
      height: h
    });
    this.draw();
  }

}

module.exports = Topology;
