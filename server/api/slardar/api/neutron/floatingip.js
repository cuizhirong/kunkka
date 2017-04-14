'use strict';

const async = require('async');
const Base = require('../base.js');

function Floatingip (app) {
  this.app = app;
  this.arrServiceObject = ['routers', 'ports', 'servers'];
  Base.call(this, this.arrServiceObject);
}

Floatingip.prototype = {
  makeFloatingip: function (fip, obj) {
    fip.association = {};
    if (fip.port_id) {
      obj.ports.some(function (p) {
        if (p.id === fip.port_id) {
          if (p.device_owner === 'compute:nova' || p.device_owner === 'compute:None') {
            obj.servers.some(function (s) {
              return p.device_id === s.id && (fip.association = { type: 'server', device: s });
            });
          } else if (p.device_owner === 'network:router_gateway') {
            obj.routers.some(function (r) {
              return p.device_id === r.id && (fip.association = { type: 'router', device: r });
            });
          }
        }
      });
    }
  },
  getFloatingipList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    async.parallel(
      [this.__floatingips.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['floatingips'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.orderByCreatedTime(obj.floatingips);
          obj.floatingips.forEach( fip => {
            this.makeFloatingip(fip, obj);
          });
          res.json({floatingips: obj.floatingips});
        }
      }
    );
  },
  getFloatingipDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'floatingipId']);
    async.parallel(
      [this.__floatingipDetail.bind(this, objVar)].concat(this.arrAsync(objVar)),
      (err, results) => {
        if (err) {
          this.handleError(err, req, res, next);
        } else {
          let obj = {};
          ['floatingip'].concat(this.arrServiceObject).forEach( (e, index) => {
            obj[e] = results[index][e];
          });
          this.makeFloatingip(obj.floatingip, obj);
          res.json({floatingip: obj.floatingip});
        }
      }
    );
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/floatingips', this.getFloatingipList.bind(this));
      this.app.get('/api/v1/:projectId/floatingips/:floatingipId', this.getFloatingipDetails.bind(this));
    });
  }
};

Object.assign(Floatingip.prototype, Base.prototype);

module.exports = Floatingip;
