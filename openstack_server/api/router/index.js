var async = require('async');
var Neutron = require('openstack_server/drivers/neutron');

function Router (app, neutron) {
  this.app = app;
  this.neutron = neutron;
}

var prototype = {
  getRouterList: function (req, res, next) {
    var token = req.session.user.token;
    var region = req.headers.region;
    var that = this;
    async.parallel([
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
        that.neutron.listFloatingips(token, region, function (err, payload) {
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
        var routers = results[0].routers;
        var floatingips = results[1].floatingips;
        floatingips.forEach(function (f) {
          if (f.router_id) {
            routers.some(function (r) {
              return r.id === f.router_id && (r.floatingip = f.floating_ip_address);
            });
          }
        });
        res.json({routers: routers});
      }
    });
  },
  getRouterDetails: function (req, res, next) {
    var networkId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.neutron.showRouterDetails(networkId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/routers', this.getRouterList.bind(this));
    this.app.get('/api/v1/routers/:id', this.getRouterDetails.bind(this));
  }
};
module.exports = function (app, extension) {
  Object.assign(Router.prototype, prototype);
  if (extension) {
    Object.assign(Router.prototype, extension);
  }
  var instance = new Router(app, Neutron);
  instance.initRoutes();
};
