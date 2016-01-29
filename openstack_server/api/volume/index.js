var async = require('async');
var Cinder = require('openstack_server/drivers/cinder');
var Nova = require('openstack_server/drivers/nova');

function Volume (app, cinder, nova) {
  this.app = app;
  this.cinder = cinder;
  this.nova = nova;
}

var prototype = {
  getVolumeList: function (req, res, next) {
    var projectId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.listVolumes(projectId, token, region, function (err, payload) {
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
        var volumes = results[0].volumes;
        var instances = results[1].servers;
        volumes.forEach(function (volume) {
          delete volume.links;
          volume.attachments.forEach(function (attachment) {
            instances.some(function (instance) {
              instance.links && (delete instance.links) && (delete instance.flavor.links) && (delete instance.image.links);
              return instance.id === attachment.server_id && (attachment.server = instance);
            });
          });
        });
        res.json({volumes: volumes});
      }
    });
  },
  getVolumeDetails: function (req, res, next) {
    var projectId = req.params.project;
    var volumeId = req.params.volume;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.cinder.showVolumeDetails(projectId, volumeId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.send(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/volumes/detail', this.getVolumeList.bind(this));
    this.app.get('/api/v1/:project/volumes/:volume', this.getVolumeDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Volume.prototype, prototype);
  if (extension) {
    Object.assign(Volume.prototype, extension);
  }
  var volume = new Volume(app, Cinder, Nova);
  volume.initRoutes();
};
