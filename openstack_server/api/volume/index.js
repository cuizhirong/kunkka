var async = require('async');
var Cinder = require('openstack_server/drivers/cinder');
var Nova = require('openstack_server/drivers/nova');
var Base = require('../base');

function Volume (app, cinder, nova) {
  var that = this;
  this.app = app;
  this.cinder = cinder;
  this.nova = nova;
  this.arrAsyncTarget = ['snapshots', 'servers'];
  this.arrAsync = [
    function (callback) {
      that.cinder.listSnapshots(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    },
    function (callback) {
      that.nova.listServers(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
    }
  ];
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

// default method is post!!!
var apiAction = {
  'createSnapshot' : { type: 'createsnapshot' },
  'attachInstance' : { type: 'attach' },
  'detachInstance' : { type: 'detach' },
  'extendSize'     : { type: 'resize' },
  'readOnly'       : { type: 'readonly' },
  'readWrite'      : { type: 'rw' },
  'delete'         : { type: 'delete', method: 'delete' }
};

var prototype = {
  getVolumeList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.listVolumes(that.projectId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync),
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
    this.projectId = req.params.projectId;
    this.volumeId = req.params.volumeId;
    this.token = req.session.user.token;
    this.region = req.headers.region;
    var that = this;
    async.parallel([
      function (callback) {
        that.cinder.showVolumeDetails(that.projectId, that.volumeId, that.token, that.region, that.asyncHandler.bind(this, callback));
      }
    ].concat(that.arrAsync),
    function (err, results) {
      if (err) {
        that.handleError(err, req, res, next);
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
  operate: function (action, req, res, next) {
    var that = this;
    var region = req.headers.region;
    var token = req.session.user.token;
    var paramObj = this.paramChecker(this.cinder, action, req, res);
    paramObj.project_id = req.params.projectId;
    if (req.params.volumeId) {
      paramObj.volume_id = req.params.volumeId;
    }

    this.cinder.action(token, region, function (err, payload) {
      if (err) {
        that.handleError(err, req, res, next);
      } else {
        res.json(payload.body);
      }
    }, action, paramObj);
  },
  initRoutes: function () {
    var that = this;
    this.app.get('/api/v1/:projectId/volumes/detail', this.getVolumeList.bind(this));
    this.app.get('/api/v1/:projectId/volumes/:volumeId', this.getVolumeDetails.bind(this));
    this.app.post('/api/v1/:projectId/volumes/action/create', this.operate.bind(this, 'create'));
    Object.keys(apiAction).forEach(function (action) {
      var api = apiAction[action];
      var method = api.method ? api.method : 'post';
      that.app[method]('/api/v1/:projectId/volumes/:volumeId/action/' + api.type, that.operate.bind(that, action));
    });
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
