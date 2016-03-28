var async = require('async');
var Driver = require('openstack_server/drivers');
var Cinder = Driver.cinder;
var Nova = Driver.nova;
var Base = require('openstack_server/api/base.js');

function Volume (app, cinder, nova) {
  var that = this;
  this.app = app;
  this.cinder = cinder;
  this.nova = nova;
  this.arrAsyncTarget = ['snapshots', 'servers'];
  this.arrAsync = [
    function (callback) {
      that.cinder.snapshot.listSnapshots(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.server.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makeVolume: function (volume, obj) {
    delete volume.links;
    volume.attachments.forEach(function (attachment) {
      obj.servers.some(function (server) {
        if (server.id === attachment.server_id) {
          delete server.links;
          delete server.flavor.links;
          delete server.image.links;
          attachment.server = server;
          return true;
        } else {
          return false;
        }
      });
    });
    volume.snapshots = [];
    obj.snapshots.forEach(function(s){
      if (s.volume_id === volume.id) {
        volume.snapshots.push(s);
      }
    });
  },
  getVolumeList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.volume.listVolumes(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['volumes'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.orderByCreatedTime(obj.volumes);
        obj.volumes.forEach(function (volume) {
          that.makeVolume(volume, obj);
        });
        res.json({volumes: obj.volumes});
      }
    });
  },
  getVolumeDetails: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.volumeId = req.params.volumeId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.volume.showVolumeDetails(that.projectId, that.volumeId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['volume'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.makeVolume(obj.volume, obj);
        res.json({volume: obj.volume});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/volumes/detail', this.getVolumeList.bind(this));
    this.app.get('/api/v1/:projectId/volumes/:volumeId', this.getVolumeDetails.bind(this));
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
