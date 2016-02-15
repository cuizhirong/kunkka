var async = require('async');
var Cinder = require('openstack_server/drivers/cinder');
var Nova = require('openstack_server/drivers/nova');
var Base = require('../base');

function Volume (app, cinder, nova) {
  this.app = app;
  this.cinder = cinder;
  this.nova = nova;
}

var getInstance = function (volume, instances) {
  delete volume.links;
  volume.attachments.forEach(function (attachment) {
    instances.some(function (instance) {
      if (instance.id === attachment.server_id) {
        delete instance.links;
        delete instance.flavor.links;
        delete instance.image.links;
        attachment.server = instance;
        return true;
      } else {
        return false;
      }
    });
  });
};

var getSnapshot = function (volume, snapshots) {
  volume.snapshots = [];
  snapshots.forEach(function(s){
    if (s.volume_id === volume.id) {
      volume.snapshots.push(s);
    }
  });
};

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
        that.cinder.listSnapshots(projectId, token, region, function (err, payload) {
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
        that.handleError(err, req, res, next);
      } else {
        var volumes = results[0].volumes;
        var snapshots = results[1].snapshots;
        var instances = results[2].servers;
        volumes.forEach(function (volume) {
          getInstance(volume, instances);
          getSnapshot(volume, snapshots);
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
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.showVolumeDetails(projectId, volumeId, token, region, function (err, payload) {
          if (err) {
            callback(err);
          } else {
            callback(null, payload.body);
          }
        });
      },
      function (callback) {
        that.cinder.listSnapshots(projectId, token, region, function (err, payload) {
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
        var volume = results[0].volume;
        var snapshots = results[1].snapshots;
        var instances = results[2].servers;
        getInstance(volume, instances);
        getSnapshot(volume, snapshots);
        res.json({volume: volume});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/volumes/detail', this.getVolumeList.bind(this));
    this.app.get('/api/v1/:project/volumes/:volume', this.getVolumeDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Volume.prototype, Base.prototype);
  Object.assign(Volume.prototype, prototype);
  if (extension) {
    Object.assign(Volume.prototype, extension);
  }
  var volume = new Volume(app, Cinder, Nova);
  volume.initRoutes();
};
