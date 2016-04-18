'use strict';

var Base = require('../base.js');

function Keypair (app) {
  this.app = app;
  this.arrService = ['nova'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Keypair.prototype = {
  getKeypairList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    this.__keypairs( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        var keypairs = [];
        payload.keypairs.forEach(function (k) {
          keypairs.push(k.keypair);
        });
        this.orderByCreatedTime(keypairs);
        res.json({'keypairs': keypairs});
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/keypairs/detail', this.getKeypairList.bind(this));
    });
  }
};

Object.assign(Keypair.prototype, Base.prototype);

module.exports = Keypair;
