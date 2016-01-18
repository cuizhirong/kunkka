var extend = require('extend');
var async = require('async');
var Glance = require('glance');
var Nova = require('nova');
var Neutron = require('neutron');

function Instance (app, nova, glance, neutron) {
  this.app = app;
  this.nova = nova;
  this.glance = glance;
  this.neutron = neutron;
}

var prototype = {
  getInstanceList: function (req, res, next) {
    var projectId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.nova.listServers(projectId, token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
      function (callback) {
        that.nova.listFlavors(projectId, token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
      function (callback) {
        that.glance.listImages(token, region, function (err, payload) {
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
        res.status(500).send(err);
      } else {
        var instances = results[0].servers;
        var flavors = results[1].flavors;
        var images = results[2].images;
        var floatingips = results[3].floatingips;
        instances.forEach(function (instance) {
          flavors.some(function (flavor) {
            return flavor.id === instance.flavor.id && (instance.flavor = flavor);
          });
          images.some(function (image) {
            return image.id === instance.image.id && (instance.image = image);
          });
          var _floatingip;
          instance.addresses.private.some(function (addr) {
            return (addr['OS-EXT-IPS:type'] === 'floating') && (_floatingip = addr.addr);
          });
          floatingips.some(function (floatingip) {
            return floatingip.floating_ip_address === _floatingip && (instance.floatingip = floatingip);
          });
        });
        res.json({servers: instances});
      }
    });
  },
  getInstanceDetail: function (req, res, next) {
    var projectId = req.params.project;
    var serverId = req.params.server;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.showServerDetail(projectId, serverId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/servers/detail', this.getInstanceList.bind(this));
    this.app.get('/api/v1/:project/servers/:server', this.getInstanceDetail.bind(this));
  }
};

module.exports = function (app, extension) {
  extend(Instance.prototype, prototype);
  if (extension) {
    extend(Instance.prototype, extension);
  }
  var instance = new Instance(app, Nova, Glance, Neutron);
  instance.initRoutes();
};
