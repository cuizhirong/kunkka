var async = require('async');
var Driver = require('openstack_server/drivers');
var Cinder = Driver.cinder;
var Glance = Driver.glance;
var Base = require('openstack_server/api/base.js');

function Snapshot (app, cinder, glance) {
  var that = this;
  this.app = app;
  this.cinder = cinder;
  this.glance = glance;
  this.arrAsyncTarget = ['volumes'];
  this.arrAsync = [
    function (callback) {
      that.cinder.volume.listVolumes(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
}

var prototype = {
  makeSnapshot: function (snapshot, obj) {
    obj.volumes.some(function (v) {
      v.links && (delete v.links);
      return v.id === snapshot.volume_id && (snapshot.volume = v);
    });
  },
  getSnapshotList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.snapshot.listSnapshots(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback), req.query);
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['snapshots'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        obj.snapshots.forEach(function (snapshot) {
          that.makeSnapshot(snapshot, obj);
        });
        res.json({snapshots: obj.snapshots});
      }
    });
  },
  getSnapshotDetails: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.snapshotId = req.params.snapshotId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.snapshot.showSnapshotDetails(that.projectId, that.snapshotId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['snapshot'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        that.makeSnapshot(obj.snapshot, obj);
        res.json({snapshot: obj.snapshot});
      }
    });
  },
  getInstanceSnapshotList: function (req, res, next) {
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.glance.image.listImages(that.token, that.region, that.asyncHandler.bind(this, callback));
      }],
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var images = results[0].images;
        var re = [];
        images.forEach(function(image) {
          if ( image.image_type === 'snapshot' ) {
            re.push(image);
          }
        });
        res.json({images: re});
      }
    });
  },
  getInstanceSnapshotDetails: function (req, res, next) {
    this.imageId = req.params.snapshotId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.glance.image.showImageDetails(that.imageId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }],
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json({image: results[0]});
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:projectId/snapshots/detail', this.getSnapshotList.bind(this));
    this.app.get('/api/v1/:projectId/snapshots/:snapshotId', this.getSnapshotDetails.bind(this));
    this.app.get('/api/v1/instanceSnapshots', this.getInstanceSnapshotList.bind(this));
    this.app.get('/api/v1/instanceSnapshots/:snapshotId', this.getInstanceSnapshotDetails.bind(this));
    this.operate = this.originalOperate.bind(this, this.cinder.snapshot);
    this.generateActionApi(this.cinder.snapshot.metadata, this.operate);
  }
};

module.exports = function (app, extension) {
  Object.assign(Snapshot.prototype, Base.prototype);
  Object.assign(Snapshot.prototype, prototype);
  if (extension) {
    Object.assign(Snapshot.prototype, extension);
  }
  var snapshot = new Snapshot(app, Cinder, Glance);
  snapshot.initRoutes();
};
