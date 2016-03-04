var async = require('async');
var Driver = require('openstack_server/drivers');
var Neutron = Driver.neutron;
var Base = require('openstack_server/api/base.js');

function Network (app, neutron) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.arrAsyncTarget = ['subnets', 'ports', 'routers'];
  this.arrAsync = [
    function (callback) {
      that.neutron.subnet.listSubnets(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.port.listPorts(that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.neutron.router.listRouters(that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makeNetwork: function (network, obj) {
    network.subnets.forEach(function (subnet, index) {
      obj.subnets.some(function (sub) {
        if (sub.id === subnet) {
          network.subnets[index] = sub;
          obj.ports.forEach(function(port){
            if (port.network_id === network.id && port.device_owner === 'network:router_interface') {
              port.fixed_ips.some(function(s){
                if (s.subnet_id === subnet) {
                  obj.routers.some(function(router){
                    if (router.id === port.device_id) {
                      sub.router = router;
                      return true;
                    } else {
                      return false;
                    }
                  });
                  return true;
                } else {
                  return false;
                }
              });
            }
          });
          return true;
        } else {
          return false;
        }
      });
    });
  },
  getNetworkList: function (req, res, next) {
    var that = this;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      function (callback) {
        that.neutron.network.listNetworks(that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['networks'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        obj.networks = obj.networks.filter(function (n) {
          return n.shared === false && n['router:external'] === false;
        });
        obj.networks.forEach(function (network) {
          that.makeNetwork(network, obj);
        });
        res.json({networks: obj.networks});
      }
    });
  },
  getNetworkDetails: function (req, res, next) {
    var that = this;
    this.networkId = req.params.networkId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.neutron.network.showNetworkDetails(that.networkId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['network'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.makeNetwork(obj.network, obj);
        res.json({network: obj.network});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/networks', this.getNetworkList.bind(this));
    this.app.get('/api/v1/networks/:networkId', this.getNetworkDetails.bind(this));
    this.operate = this.originalOperate.bind(this, this.neutron.network);
    this.generateActionApi(this.neutron.network.metadata, this.operate);
  }
};
module.exports = function (app, extension) {
  Object.assign(Network.prototype, Base.prototype);
  Object.assign(Network.prototype, prototype);
  if (extension) {
    Object.assign(Network.prototype, extension);
  }
  var network = new Network(app, Neutron);
  network.initRoutes();
};
