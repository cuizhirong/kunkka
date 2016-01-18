var async = require('async');
var extend = require('extend');
var Cinder = require('cinder');
var Nova = require('nova');

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
          volume.attachments.forEach(function (attachment) {
            instances.some(function (instance) {
              return instance.id === attachment.server_id && (attachment.server = instance);
            });
          });
        });
        res.json({volumes: volumes});
      }
    });
  },
  getVolumeDetail: function (req, res, next) {
    var projectId = req.params.project;
    var volumeId = req.params.volume;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.cinder.showVolumeDetail(projectId, volumeId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.send(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/volumes/detail', this.getVolumeList.bind(this));
    this.app.get('/api/v1/:project/volumes/:volume', this.getVolumeDetail.bind(this));
  }
};

module.exports = function (app, extension) {
  extend(Volume.prototype, prototype);
  if (extension) {
    extend(Volume.prototype, extension);
  }
  var volume = new Volume(app, Cinder, Nova);
  volume.initRoutes();
};
