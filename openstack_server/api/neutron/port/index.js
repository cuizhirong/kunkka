'use strict';

var async = require('async');
var Driver = require('openstack_server/drivers');
var Neutron = Driver.neutron;
var Nova = Driver.nova;
var Base = require('openstack_server/api/base.js');

// due to Port is reserved word
function Port (app, neutron, nova) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
  this.arrAsyncTarget = ['subnets', 'floatingips', 'servers', 'security_groups'];
  this.arrAsync = [
    function (callback) {
      that.neutron.subnet.listSubnets(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.floatingip.listFloatingips(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.server.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.security.listSecurity(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makePort: function (port, obj) {
    obj.servers.some(function(server, i) {
      if ( server.id === port.device_id) {
        port.server = server;
        return true;
      } else {
        return false;
      }
    });
    port.floatingip = {};
    obj.floatingips.some(function (floatingip) {
      return port.id === floatingip.port_id && (port.floatingip = floatingip);
    });
    port.security_groups.forEach(function(securityId, index) {
      obj.security_groups.some(function(security, i) {
        if ( security.id === securityId) {
          port.security_groups[index] = security;
          return true;
        } else {
          return false;
        }
      });
    });
    port.subnets = [];
    port.fixed_ips.forEach(function(e, index) {
      obj.subnets.some(function(subnet, i) {
        if ( subnet.id === e.subnet_id ) {
          port.subnets.push(subnet);
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getPortList: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.neutron.port.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['ports'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          that.orderByCreatedTime(obj.ports);
          obj.port = [];
          obj.ports.forEach(function(port, index){
            var flag = true;
            // flag = Boolean(port.device_owner === 'compute:nova' || port.device_owner === 'compute:None' || port.device_owner === '');
            if (flag) {
              obj.port.push(port);
              that.makePort(port, obj);
            }
          });
          res.json({
            ports: obj.port
          });
        }
      });
  },
  getPortDetails: function (req, res, next) {
    var that = this;
    this.projectId = req.params.projectId;
    this.portId = req.params.portId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      function (callback) {
        that.neutron.port.showPortDetails(that.portId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
      function (err, results) {
        if (err) {
          that.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['port'].concat(that.arrAsyncTarget).forEach(function(e, index){
            obj[e] = results[index][e];
          });
          that.makePort(obj.port, obj);
          res.json({
            port: obj.port
          });
        }
      });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/ports', this.getPortList.bind(this));
    this.app.get('/api/v1/:projectId/ports/:portId', this.getPortDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Port.prototype, Base.prototype);
  Object.assign(Port.prototype, prototype);
  if (extension) {
    Object.assign(Port.prototype, extension);
  }
  var security = new Port(app, Neutron, Nova);
  security.initRoutes();
};
