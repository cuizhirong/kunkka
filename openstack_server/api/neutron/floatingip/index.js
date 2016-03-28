var async = require('async');
var Driver = require('openstack_server/drivers');
var Neutron = Driver.neutron;
var Nova = Driver.nova;
var Base = require('openstack_server/api/base.js');

function Floatingip (app, neutron, nova) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
  this.arrAsyncTarget = ['routers', 'ports', 'servers'];
  this.arrAsync = [
    function (callback) {
      that.neutron.router.listRouters(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.port.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.server.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makeFloatingip: function (fip, obj) {
    fip.association = {};
    if (fip.port_id) {
      obj.ports.some(function (p) {
        if (p.id === fip.port_id) {
          if (p.device_owner === 'compute:nova' || p.device_owner === 'compute:None') {
            obj.servers.some(function (s) {
              return p.device_id === s.id && (fip.association = { type: 'server', device: s });
            });
          } else if (p.device_owner === 'network:router_gateway') {
            obj.routers.some(function (r) {
              return p.device_id === r.id && (fip.association = { type: 'router', device: r });
            });
          }
        }
      });
    }
  },
  getFloatingipList: function (req, res, next) {
    this.token = req.session.user.token;
    this.region = req.headers.region;
    this.projectId = req.params.projectId;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.floatingip.listFloatingips(that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['floatingips'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.orderByCreatedTime(obj.floatingips);
        obj.floatingips.forEach(function (fip) {
          that.makeFloatingip(fip, obj);
        });
        res.json({floatingips: obj.floatingips});
      }
    });
  },
  getFloatingipDetails: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.floatingipId = req.params.floatingipId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.floatingip.showFloatingipDetails(that.floatingipId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['floatingip'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.makeFloatingip(obj.floatingip, obj);
        res.json({floatingip: obj.floatingip});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/floatingips', this.getFloatingipList.bind(this));
    this.app.get('/api/v1/:projectId/floatingips/:floatingipId', this.getFloatingipDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Floatingip.prototype, Base.prototype);
  Object.assign(Floatingip.prototype, prototype);
  if (extension) {
    Object.assign(Floatingip.prototype, extension);
  }
  var instance = new Floatingip(app, Neutron, Nova);
  instance.initRoutes();
};
