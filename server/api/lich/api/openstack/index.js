'use strict';

const async = require('async');

const Instance = require('api/slardar/api/nova/server');
const Volume = require('api/slardar/api/cinder/volume');
const Snapshot = require('api/slardar/api/cinder/snapshot');
const Image = require('api/slardar/api/glance/image');
const flow = require('config')('approval_flow');
const flowReverse = JSON.parse(JSON.stringify(flow)).reverse(); //high->low
const roleHelper = require('helpers/role_helper');

function Openstack(app) {
  this.app = app;
  const _instance = new Instance(app);
  const _volume = new Volume(app);
  const _snapshot = new Snapshot(app);
  const _image = new Image(app);

  _instance.getInstanceListByOwner = function(req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel(
      [
        this.__servers.bind(this, objVar),
        this.__subnets.bind(this, objVar),
        this.__floatingips.bind(this, objVar),
        this.__ports.bind(this, objVar)
      ].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['servers', 'subnets', 'floatingips', 'ports'].concat(this.arrServiceObject).forEach((e, index) => {
            obj[e] = results[index][e];
          });
          let roleIndex = roleHelper.getEffectiveRole(req.session.user.roles, flowReverse).index;
          if (roleIndex === 0) {
            obj.servers = obj.servers.filter(server => server.metadata ? server.metadata.owner === req.session.user.username : false);
          }
          this.orderByCreatedTime(obj.servers);
          obj.servers.forEach(server => {
            this.makeServer(server, obj);
          });
          res.json({
            servers: obj.servers
          });
        }
      }
    );
  };

  _volume.getVolumeListByOwner = function(req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel(
      [
        this.__volumes.bind(this, objVar),
        this.__snapshots.bind(this, objVar),
        this.__servers.bind(this, objVar)
      ],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['volumes', 'snapshots', 'servers'].forEach((e, index) => {
            obj[e] = results[index][e];
          });
          let roleIndex = roleHelper.getEffectiveRole(req.session.user.roles, flowReverse).index;
          if (roleIndex === 0) {
            obj.volumes = obj.volumes.filter(volume => volume.metadata ? volume.metadata.owner === req.session.user.username : false);
          }
          this.orderByCreatedTime(obj.volumes);
          obj.volumes.forEach(volume => {
            this.makeVolume(volume, obj);
          });
          res.json({
            volumes: obj.volumes
          });
        }
      }
    );
  };

  _snapshot.getSnapshotListByOwner = function(req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel(
      [
        this.__snapshots.bind(this, objVar),
        this.__volumes.bind(this, objVar)
      ],
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['snapshots', 'volumes'].forEach(function(e, index) {
            obj[e] = results[index][e];
          });
          let roleIndex = roleHelper.getEffectiveRole(req.session.user.roles, flowReverse).index;
          if (roleIndex === 0) {
            obj.snapshots = obj.snapshots.filter(snapshot => snapshot.metadata.owner === req.session.user.username);
          }
          this.orderByCreatedTime(obj.snapshots);
          obj.snapshots.forEach(snapshot => {
            this.makeSnapshot(snapshot, obj);
          });
          res.json({
            snapshots: obj.snapshots
          });
        }
      }
    );
  };

  _image.getImageListByOwner = function(req, res, next) {
    let objVar = this.getVars(req);
    let images;
    this.__images(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        images = payload.images;
        let roleIndex = roleHelper.getEffectiveRole(req.session.user.roles, flowReverse).index;
        if (roleIndex) {
          images = images.filter(image => image.visibility === 'private' ? image.meta_owner === req.session.user.username : true);
        }
        this.orderByCreatedTime(images);
        res.json({
          images: images
        });
      }
    });
  };

  app.get('/api/v1/:projectId/servers/detail/owner', _instance.getInstanceListByOwner.bind(_instance));
  app.get('/api/v1/:projectId/volumes/detail/owner', _volume.getVolumeListByOwner.bind(_volume));
  app.get('/api/v1/:projectId/snapshots/detail/owner', _snapshot.getSnapshotListByOwner.bind(_snapshot));
  app.get('/api/v1/images/owner', _image.getImageListByOwner.bind(_image));
}

module.exports = Openstack;
