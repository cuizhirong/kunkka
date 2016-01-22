var async = require('async');
var Cinder = require('openstack_server/drivers/cinder');

function Snapshot (app, cinder) {
  this.app = app;
  this.cinder = cinder;
}

var prototype = {
  getSnapshotList: function (req, res, next) {
    var projectId = req.params.id;
    var region = req.headers.region;
    var token = req.session.user.token;
    var that = this;
    async.parallel([
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
        that.cinder.listVolumes(projectId, token, region, function (err, payload) {
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
        var snapshots = results[0].snapshots;
        var volumes = results[1].volumes;
        snapshots.forEach(function (s) {
          volumes.some(function (v) {
            return v.id === s.volume_id && (s.volume = v);
          });
        });
        res.json({snapshots: snapshots});
      }
    });
  },
  getSnapshotDetails: function (req, res, next) {
    var projectId = req.params.project;
    var snapshotId = req.params.snapshot;
    var token = req.session.user.token;
    var region = req.headers.region;
    this.cinder.showSnapshotDetails(projectId, snapshotId, token, region, function (err, payload) {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.send(payload.body);
      }
    });
  },
  initRoutes: function () {
    this.app.get('/api/v1/:id/snapshots/detail', this.getSnapshotList.bind(this));
    this.app.get('/api/v1/:project/snapshots/:snapshot', this.getSnapshotDetails.bind(this));
  }
};

module.exports = function (app, extension) {
  Object.assign(Snapshot.prototype, prototype);
  if (extension) {
    Object.assign(Snapshot.prototype, extension);
  }
  var volume = new Snapshot(app, Cinder);
  volume.initRoutes();
};
