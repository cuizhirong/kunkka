var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');
var Base = require('../base');

function Network (app, neutron) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.arrAsyncTarget = ['subnets', 'ports', 'routers'];
  this.arrAsync = [];
  this.arrAsyncTarget.forEach(function(ele){
    that.arrAsync.push(function (callback) {
      that.neutron['list' + ele.charAt(0).toUpperCase() + ele.substr(1)](that.token, that.region, that.asyncHandler.bind(this, callback));
    });
  });
}

var makeNetwork = function (network, obj) {
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
};

// default method is post!!!
var apiAction = {
  createSubnet  : { type: 'createsubnet' },
  deleteNetwork : { type: 'delete', method: 'delete' }
};

var prototype = {
  getNetworkList: function (req, res, next) {
    var that = this;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      function (callback) {
        that.neutron.listNetworks(that.token, that.region, that.asyncHandler.bind(this, callback));
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
          makeNetwork(network, obj);
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
        that.neutron.showNetworkDetails(that.networkId, that.token, that.region, that.asyncHandler.bind(this, callback));
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
        makeNetwork(obj.network, obj);
        res.json({network: obj.network});
      }
    });
  },
  operate: function (action, req, res, next) {
    var that = this;
    var token = req.session.user.token;
    var region = req.headers.region;
    // check if params required are given, and remove unnecessary params.
    var paramObj = this.paramChecker(this.neutron, action, req, res);
    if (req.params.networkId) {
      paramObj.network_id = req.params.networkId;
    }
    this.neutron.action(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json(payload.body);
      }
    }, action, paramObj);
  },
  initRoutes: function () {
    var that = this;
    this.app.get('/api/v1/networks', this.getNetworkList.bind(this));
    this.app.get('/api/v1/networks/:networkId', this.getNetworkDetails.bind(this));
    this.app.post('/api/v1/networks/action/create', this.operate.bind(this, 'createNetwork'));
    Object.keys(apiAction).forEach(function (action) {
      var api = apiAction[action];
      var method = api.method ? api.method : 'post';
      that.app[method]('/api/v1/networks/:networkId/action/' + api.type, that.operate.bind(that, action));
    });
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
