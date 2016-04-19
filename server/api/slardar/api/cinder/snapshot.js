'use strict';

var async = require('async');
var Base = require('../base.js');

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
    this.getVars(req, ['projectId']);
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
    this.getVars(req, ['projectId', 'snapshotId']);
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
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/snapshots/detail', this.getSnapshotList.bind(this));
      this.app.get('/api/v1/:projectId/snapshots/:snapshotId', this.getSnapshotDetails.bind(this));
    });
  }
};

Object.assign(Snapshot.prototype, Base.prototype);

module.exports = Snapshot;
