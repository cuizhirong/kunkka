var extend = require('extend');
var Neutron = require('neutron');
var async = require('async');

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
        networks.forEach(function (network) {
          network.subnets.forEach(function (subnet, index) {
            subnets.some(function (sub) {
              return sub.id === subnet && (network.subnets[index] = sub);
            });
          });
        });
        res.json(networks);
      }
    });
  },
  getNetworkDetail: function (req, res, next) {
    var networkId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.neutron.showNetworkDetail(networkId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/networks', this.getNetworkList.bind(this));
    this.app.get('/api/v1/networks/:id', this.getNetworkDetail.bind(this));
  }
};
module.exports = function (app, extension) {
  extend(Network.prototype, prototype);
  if (extension) {
    extend(Network.prototype, extension);
  }
  var instance = new Network(app, Neutron);
  instance.initRoutes();
};
