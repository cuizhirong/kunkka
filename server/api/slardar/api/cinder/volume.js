'use strict';

const async = require('async');
const Base = require('../base.js');

function Volume (app) {
  this.app = app;
  Base.call(this);
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
    if (volume.bootable === 'true' && volume.attachments.length === 0) {
      obj.servers.some(server => {
        server['os-extended-volumes:volumes_attached'].forEach(e => {
          return e.id === volume.id && (volume.attachments.push({server_id: server.id}));
        });
      });
    }
  },
  getVolumeList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel([
      this.__volumes.bind(this, objVar),
      this.__snapshots.bind(this, objVar),
      this.__servers.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
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
  getVolumeListByOwner: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel([
      this.__volumes.bind(this, objVar),
      this.__snapshots.bind(this, objVar),
      this.__servers.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['volumes', 'snapshots', 'servers'].forEach((e, index) => {
            obj[e] = results[index][e];
          });
          obj.volumes = obj.volumes.filter(volume => volume.metadata ? volume.metadata.owner === req.session.user.username : false);
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
    let objVar = this.getVars(req, ['projectId', 'volumeId']);
    async.parallel([
      this.__volumeDetail.bind(this, objVar),
      this.__snapshots.bind(this, objVar),
      this.__servers.bind(this, objVar)],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
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
      this.app.get('/api/v1/:projectId/volumes/detail/owner', this.getVolumeListByOwner.bind(this));
      this.app.get('/api/v1/:projectId/volumes/:volumeId', this.getVolumeDetails.bind(this));
    });
  }
};

Object.assign(Volume.prototype, Base.prototype);

module.exports = Volume;
