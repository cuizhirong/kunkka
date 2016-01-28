var async = require('async');
var Glance = require('openstack_server/drivers/glance');
var Nova = require('openstack_server/drivers/nova');
var Neutron = require('openstack_server/drivers/neutron');

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
          var _floatingips = [];
          var _fixedIps = [];
          Object.keys(instance.addresses).forEach(function (el) {
            instance.addresses[el].forEach(function (e) {
              if (e.version === 4 && e['OS-EXT-IPS:type'] === 'fixed') {
                _fixedIps.push(e.addr);
              } else if (e.version === 4 && e['OS-EXT-IPS:type'] === 'floating') {
                _floatingips.push(e.addr);
              }
            });
          });
          instance.fixed_ips = _fixedIps;
          instance.floatingips = [];
          floatingips.some(function (floatingip) {
            return _floatingips.indexOf(floatingip.floating_ip_address) > -1 && (instance.floatingips.push(floatingip));
          });
        });
        res.json({servers: instances});
      }
    });
  },
  getInstanceDetails: function (req, res, next) {
    var projectId = req.params.project;
    var serverId = req.params.server;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.showServerDetails(projectId, serverId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  getVNCConsole: function (req, res, next) {
    var projectId = req.params.project;
    var serverId = req.params.server;
    var region = req.headers.region;
    var token = req.session.user.token;
    this.nova.getVNCConsole(projectId, serverId, token, region, function (err, payload) {
      if (err) {
        return res.status(err.status).json(err);
      } else {
        res.json(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/servers/detail', this.getInstanceList.bind(this));
    this.app.get('/api/v1/:project/servers/:server', this.getInstanceDetails.bind(this));
    this.app.post('api/v1/:project/servers/:server/action/vnc', this.getVNCConsole.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Instance.prototype, prototype);
  if (extension) {
    Object.assign(Instance.prototype, extension);
  }
  var instance = new Instance(app, Nova, Glance, Neutron);
  instance.initRoutes();
};
