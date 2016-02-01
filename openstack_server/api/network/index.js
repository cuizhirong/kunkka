var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');

function Network (app, neutron) {
  var that = this;
  this.app = app;
  this.neutron = neutron;
  this.arrAsyncTarget = ['Subnets', 'Ports', 'Routers'];
  this.arrAsync = [];
  this.arrAsyncTarget.forEach(function(ele){
    that.arrAsync.push(function (callback) {
      that.neutron['list' + ele](that.token, that.region, that.asyncHandler.bind(this, callback));
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

var prototype = {
  asyncHandler: function (callback, err, payload) {
    if (err) {
      callback(err);
    } else {
      callback(null, payload.body);
    }
  },
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
        res.status(err.status).json(err);
      } else {
        var obj = {};
        ['networks'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e.toLowerCase()] = results[index][e.toLowerCase()];
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
    this.networkId = req.params.id;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      function (callback) {
        that.neutron.showNetworkDetails(that.networkId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        var obj = {};
        ['network'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e.toLowerCase()] = results[index][e.toLowerCase()];
        });
        makeNetwork(obj.network, obj);
        res.json({network: obj.network});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/networks', this.getNetworkList.bind(this));
    this.app.get('/api/v1/networks/:id', this.getNetworkDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Network.prototype, prototype);
  if (extension) {
    Object.assign(Network.prototype, extension);
  }
  var instance = new Network(app, Neutron);
  instance.initRoutes();
};
