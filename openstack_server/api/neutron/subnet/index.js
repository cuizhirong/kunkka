'use strict';

var async = require('async');
var Driver = require('openstack_server/drivers');
var Neutron = Driver.neutron;
var Nova = Driver.nova;
var Base = require('openstack_server/api/base.js');

function Subnet (app, neutron, nova) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
  this.arrAsyncTarget = ['servers', 'networks', 'routers', 'ports'];
  this.arrAsync = [
    function (callback) {
      that.nova.server.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.network.listNetworks(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.router.listRouters(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.port.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makeSubnet: function(subnet, obj) {
    obj.networks.some(function (n) {
      return subnet.network_id === n.id && (subnet.network = n);
    });
    subnet.ports = [];
    subnet.router = {};
    obj.ports.forEach(function (p) {
      p.fixed_ips.some(function (ip) {
        if (ip.subnet_id === subnet.id) {
          if (p.device_owner === 'compute:nova' || p.device_owner === 'compute:None') {
            if (obj.servers) {
              obj.servers.some(function(server) {
                return server.id === p.device_id && (p.server = server);
              });
            }
          } else if (p.device_owner === 'network:router_interface') {
            obj.routers.some(function (r) {
              return r.id === p.device_id && (subnet.router = r);
            });
          }
          subnet.ports.push(p);
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getSubnetList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.subnet.listSubnets(that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['subnets'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.orderByCreatedTime(obj.subnets);
        obj.subnets = obj.subnets.filter(function (s) {
          obj.networks.some(function (n) {
            return n.id === s.network_id && (s.network = n);
          });
          return s.ip_version === 4 && s.network['router:external'] === false;
        });
        obj.subnets.forEach(function (subnet) {
          that.makeSubnet(subnet, obj);
        });
        res.json({subnets: obj.subnets});
      }
    });
  },
  getSubnetDetails: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.subnetId = req.params.subnetId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.subnet.showSubnetDetails(that.subnetId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync, [
      function (callback) {
        that.nova.server.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ]),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['subnet'].concat(that.arrAsyncTarget, ['servers']).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.makeSubnet(obj.subnet, obj);
        res.json({subnet: obj.subnet});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/subnets', this.getSubnetList.bind(this));
    this.app.get('/api/v1/:projectId/subnets/:subnetId', this.getSubnetDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Subnet.prototype, Base.prototype);
  Object.assign(Subnet.prototype, prototype);
  if (extension) {
    Object.assign(Subnet.prototype, extension);
  }
  var subnet = new Subnet(app, Neutron, Nova);
  subnet.initRoutes();
};
