'use strict';

var async = require('async');
var Base = require('../../base.js');

function Snapshot (app) {
  this.app = app;
  this.arrService = ['cinder', 'glance'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Snapshot.prototype = {
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
    async.parallel([
      this.__snapshots.bind(this),
      this.__volumes.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['snapshots', 'volumes'].forEach(function (e, index) {
            obj[e] = results[index][e];
          });
          this.orderByCreatedTime(obj.snapshots);
          obj.snapshots.forEach( snapshot => {
            this.makeSnapshot(snapshot, obj);
          });
          res.json({snapshots: obj.snapshots});
        }
      }
    );
  },
  getSnapshotDetails: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.snapshotId = req.params.snapshotId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      this.__snapshotDetail.bind(this),
      this.__volumes.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['snapshot', 'volumes'].forEach((e, index) => {
            obj[e] = results[index][e];
          });
          this.makeSnapshot(obj.snapshot, obj);
          res.json({snapshot: obj.snapshot});
        }
      }
    );
  },
  getInstanceSnapshotList: function (req, res, next) {
    this.region = req.headers.region;
    this.token = req.session.user.token;
    async.parallel([
      this.__images.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var images = results[0].images;
          var re = [];
          images.forEach( image => {
            if ( image.image_type === 'snapshot' ) {
              re.push(image);
            }
          });
          res.json({images: re});
        }
      }
    );
  },
  getInstanceSnapshotDetails: function (req, res, next) {
    this.imageId = req.params.snapshotId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    async.parallel([
      this.__imageDetail.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          res.json({image: results[0]});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/snapshots/detail', this.getSnapshotList.bind(this));
      this.app.get('/api/v1/:projectId/snapshots/:snapshotId', this.getSnapshotDetails.bind(this));
      this.app.get('/api/v1/instanceSnapshots', this.getInstanceSnapshotList.bind(this));
      this.app.get('/api/v1/instanceSnapshots/:snapshotId', this.getInstanceSnapshotDetails.bind(this));
    });
  }
};


module.exports = function (app, extension) {
  Object.assign(Snapshot.prototype, Base.prototype);
  if (extension) {
    Object.assign(Snapshot.prototype, extension);
  }
  var snapshot = new Snapshot(app);
  snapshot.initRoutes();
};
