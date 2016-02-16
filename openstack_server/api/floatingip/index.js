var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');
var Nova = require('openstack_server/drivers/nova');
var Base = require('../base');

function Floatingip (app, neutron, nova) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
  this.arrAsyncTarget = ['routers', 'ports', 'servers'];
  this.arrAsync = [
    function (callback) {
      that.neutron.listRouters(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var makeFip = function (fip, obj) {
  fip.router = {};
  fip.instance = {};
  if (fip.router_id) {
    obj.routers.some(function (r) {
      return r.id === fip.router_id && (fip.router = r);
    });
  }
  if (fip.port_id) {
    obj.ports.some(function (p) {
      return p.id === fip.port_id && p.device_owner === 'compute:None' && (fip.port = p);
    });
    if (fip.port) {
      obj.servers.some(function (s) {
        return s.id === fip.port.device_id && (fip.instance = s);
      });
    }
  }
};

var prototype = {
  getFloatingipList: function (req, res, next) {
    this.token = req.session.user.token;
    this.region = req.headers.region;
    this.projectId = req.params.projectId;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.listFloatingips(that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['floatingips'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        obj.floatingips.forEach(function (fip) {
          makeFip(fip, obj);
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
        that.neutron.showFloatingipDetails(that.floatingipId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['floatingip'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        makeFip(obj.floatingip, obj);
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
