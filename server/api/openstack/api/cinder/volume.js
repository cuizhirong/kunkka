'use strict';

var async = require('async');
var Base = require('../base.js');

function Volume (app) {
  this.app = app;
  this.arrService = ['cinder', 'nova'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Volume.prototype = {
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
    this.getVars(req, ['projectId']);
    async.parallel([
      this.__volumes.bind(this),
      this.__snapshots.bind(this),
      this.__servers.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['volumes', 'snapshots', 'servers'].forEach((e, index) => {
            obj[e] = results[index][e];
          });
          this.orderByCreatedTime(obj.volumes);
          obj.volumes.forEach( volume => {
            this.makeVolume(volume, obj);
          });
          res.json({volumes: obj.volumes});
        }
      }
    );
  },
  getVolumeDetails: function (req, res, next) {
    this.getVars(req, ['projectId', 'volumeId']);
    async.parallel([
      this.__volumeDetail.bind(this),
      this.__snapshots.bind(this),
      this.__servers.bind(this)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          var obj = {};
          ['volume', 'snapshots', 'servers'].forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeVolume(obj.volume, obj);
          res.json({volume: obj.volume});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/volumes/detail', this.getVolumeList.bind(this));
      this.app.get('/api/v1/:projectId/volumes/:volumeId', this.getVolumeDetails.bind(this));
    });
  }
};

Object.assign(Volume.prototype, Base.prototype);

module.exports = Volume;
