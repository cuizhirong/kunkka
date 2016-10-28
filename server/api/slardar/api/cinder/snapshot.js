'use strict';

const async = require('async');
const Base = require('../base.js');

function Snapshot (app) {
  this.app = app;
  Base.call(this);
}

Snapshot.prototype = {
  makeSnapshot: function (snapshot, obj) {
    obj.volumes.some(function (v) {
      v.links && (delete v.links);
      return v.id === snapshot.volume_id && (snapshot.volume = v);
    });
  },
  getSnapshotList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel([
      this.__snapshots.bind(this, objVar),
      this.__volumes.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
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
  getSnapshotListByOwner: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel([
      this.__snapshots.bind(this, objVar),
      this.__volumes.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['snapshots', 'volumes'].forEach(function (e, index) {
            obj[e] = results[index][e];
          });
          obj.snapshots = obj.snapshots.filter(snapshot => snapshot.metadata.owner === req.session.user.username);
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
    let objVar = this.getVars(req, ['projectId', 'snapshotId']);
    async.parallel([
      this.__snapshotDetail.bind(this, objVar),
      this.__volumes.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
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
      this.app.get('/api/v1/:projectId/snapshots/detail/owner', this.getSnapshotListByOwner.bind(this));
      this.app.get('/api/v1/:projectId/snapshots/:snapshotId', this.getSnapshotDetails.bind(this));
    });
  }
};

Object.assign(Snapshot.prototype, Base.prototype);

module.exports = Snapshot;
