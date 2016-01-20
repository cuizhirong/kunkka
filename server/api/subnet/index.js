var extend = require('extend');
var Neutron = require('neutron');
var async = require('async');

function Subnet (app, neutron) {
  this.app = app;
  this.neutron = neutron;
}

var prototype = {
  getSubnetList: function (req, res, next) {
    var token = req.session.user.token;
    var region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.listSubnets(token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
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
        that.neutron.listRouters(token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
      function (callback) {
        that.neutron.listPorts(token, region, function (err, payload) {
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
        var subnets = results[0].subnets;
        var networks = results[1].networks;
        var routers = results[2].routers;
        var ports = results[3].ports;
        subnets = subnets.filter(function (s) {
          networks.some(function (n) {
            return n.id === s.network_id && (s.network = n);
          });
          return s.ip_version === 4 && s.network.shared === false && s.network['router:external'] === false;
        });
        subnets.forEach(function (s) {
          networks.some(function (n) {
            return s.network_id === n.id && (s.network = n);
          });
          ports.some(function (p) {
            var bindPort = p.fixed_ips.some(function (ip) {
              return ip.subnet_id === s.id;
            });
            if (bindPort) {
              return routers.some(function (r) {
                return r.id === p.device_id && (s.router = r);
              });
            } else {
              return false;
            }
          });
        });
        res.json({subnets: subnets});
      }
    });
  },
  getSubnetDetails: function (req, res, next) {
    var networkId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.neutron.showSubnetDetails(networkId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/subnets', this.getSubnetList.bind(this));
    this.app.get('/api/v1/subnets/:id', this.getSubnetDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  extend(Subnet.prototype, prototype);
  if (extension) {
    extend(Subnet.prototype, extension);
  }
  var instance = new Subnet(app, Neutron);
  instance.initRoutes();
};
