var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');
var Base = require('../base');

function Router (app, neutron) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.arrAsync = [];
  this.arrAsyncTarget = ['floatingips', 'subnets', 'ports'];
  this.arrAsyncTarget.forEach(function(ele){
    that.arrAsync.push(function (callback) {
      that.neutron['list' + ele.charAt(0).toUpperCase() + ele.substr(1)](that.token, that.region, that.asyncHandler.bind(this, callback));
    });
  });
}

var prototype = {
  getRouterList: function (req, res, next) {
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.listRouters(that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['routers'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        obj.routers.forEach(function (router) {
          router.floatingip = {};
          obj.floatingips.some(function (fip) {
            return fip.router_id === router.id && (router.floatingip = fip);
          });
          router.subnets = [];
          obj.ports.forEach(function (port) {
            if (port.device_id === router.id) {
              obj.subnets.forEach(function (subnet) {
                if (subnet.ip_version === 4 && subnet.id === port.fixed_ips[0].subnet_id) {
                  router.subnets.push(subnet);
                }
              });
            }
          });
        });
        res.json({routers: obj.routers});
      }
    });
  },
  getRouterDetails: function (req, res, next) {
    this.routerId = req.params.routerId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.showRouterDetails(that.routerId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['router'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        obj.floatingips.some(function (f) {
          return obj.router.id === f.router_id && (obj.router.floatingip = f);
        });
        obj.router.subnets = [];
        obj.ports.forEach(function (port) {
          if (port.device_id === obj.router.id) {
            obj.subnets.forEach(function (subnet) {
              if (subnet.ip_version === 4 && subnet.id === port.fixed_ips[0].subnet_id) {
                obj.router.subnets.push(subnet);
              }
            });
          }
        });
        res.json({routers: obj.router});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/routers', this.getRouterList.bind(this));
    this.app.get('/api/v1/routers/:routerId', this.getRouterDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Router.prototype, Base.prototype);
  Object.assign(Router.prototype, prototype);
  if (extension) {
    Object.assign(Router.prototype, extension);
  }
  var instance = new Router(app, Neutron);
  instance.initRoutes();
};
