var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');

function Network (app, neutron) {
  this.app = app;
  this.neutron = neutron;
}

var prototype = {
  getNetworkList: function (req, res, next) {
    var token = req.session.user.token;
    var region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.listNetworks(token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
      function (callback) {
        that.neutron.listSubnets(token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      }
    ],
    function (err, results) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        var networks = results[0].networks;
        var subnets = results[1].subnets;
        networks = networks.filter(function (n) {
          return n.shared === false && n['router:external'] === false;
        });
        networks.forEach(function (network) {
          network.subnets.forEach(function (subnet, index) {
            subnets.some(function (sub) {
              return sub.id === subnet && (network.subnets[index] = sub);
            });
          });
        });
        res.json({networks: networks});
      }
    });
  },
  getNetworkDetails: function (req, res, next) {
    var networkId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.neutron.showNetworkDetails(networkId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
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
