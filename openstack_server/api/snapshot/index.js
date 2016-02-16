var async = require('async');
var Cinder = require('openstack_server/drivers/cinder');
var Glance = require('openstack_server/drivers/glance');
var Base = require('../base');

function Snapshot (app, cinder, glance) {
  var that = this;
  this.app = app;
  this.cinder = cinder;
  this.glance = glance;
  this.arrAsync = [];
  this.arrAsyncTarget = ['volumes'];
  this.arrAsyncTarget.forEach(function(ele){
    that.arrAsync.push(function (callback) {
      that.cinder['list' + ele.charAt(0).toUpperCase() + ele.substr(1)](that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    });
  });
}

var makeSnapshot = function (snapshot, obj) {
  obj.volumes.some(function (v) {
    v.links && (delete v.links);
    return v.id === snapshot.volume_id && (snapshot.volume = v);
  });
};

var prototype = {
  getSnapshotList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.listSnapshots(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
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
          makeSnapshot(snapshot, obj);
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
        that.cinder.showSnapshotDetails(that.projectId, that.snapshotId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        var obj = {};
        ['snapshot'].concat(that.arrAsyncTarget).forEach(function (e, index) {
          obj[e] = results[index][e];
        });
        makeSnapshot(obj.snapshot, obj);
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
        that.glance.listImages(that.token, that.region, that.asyncHandler.bind(this, callback));
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
        that.glance.showImageDetails(that.imageId, that.token, that.region, that.asyncHandler.bind(this, callback));
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
    this.app.get('/api/v1/:projectId/snapshots', this.getSnapshotList.bind(this));
    this.app.get('/api/v1/:projectId/snapshots/:snapshotId', this.getSnapshotDetails.bind(this));
    this.app.get('/api/v1/instanceSnapshots', this.getInstanceSnapshotList.bind(this));
    this.app.get('/api/v1/instanceSnapshots/:snapshotId', this.getInstanceSnapshotDetails.bind(this));
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
