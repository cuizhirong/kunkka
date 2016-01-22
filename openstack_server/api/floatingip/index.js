var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');
var Nova = require('openstack_server/drivers/nova');

function Floatingip (app, neutron, nova) {
  this.app = app;
  this.neutron = neutron;
  this.nova = nova;
}

var prototype = {
  getFloatingipList: function (req, res, next) {
    var token = req.session.user.token;
    var region = req.headers.region;
    var projectId = req.params.projectId;
    var that = this;
    async.parallel([
      function (callback) {
        that.neutron.listFloatingips(token, region, function (err, payload) {
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
      },
      function (callback) {
        that.nova.listServers(projectId, token, region, function (err, payload) {
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
        var floatingips = results[0].floatingips;
        var routers = results[1].routers;
        var ports = results[2].ports;
        var servers = results[3].servers;
        floatingips.forEach(function (f) {
          if (f.router_id) {
            routers.some(function (r) {
              return r.id === f.router_id && (f.router = r);
            });
          }
          if (f.port_id) {
            ports.some(function (p) {
              return p.id === f.port_id && p.device_owner === 'compute:None' && (f.port = p);
            });
            if (f.port) {
              servers.some(function (s) {
                return s.id === f.port.device_id && (f.server = s);
              });
            }
          }
        });
        res.json({floatingips: floatingips});
      }
    });
  },
  getFloatingipDetails: function (req, res, next) {
    var floatingipId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.neutron.showFloatingipDetails(floatingipId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/floatingips', this.getFloatingipList.bind(this));
    this.app.get('/api/v1/floatingips/:id', this.getFloatingipDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Floatingip.prototype, prototype);
  if (extension) {
    Object.assign(Floatingip.prototype, extension);
  }
  var instance = new Floatingip(app, Neutron, Nova);
  instance.initRoutes();
};
