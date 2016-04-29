'use strict';

const Base = require('../base.js');

function Keypair (app) {
  this.app = app;
  Base.call(this);
}

Keypair.prototype = {
  getKeypairList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    this.__keypairs(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let keypairs = [];
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
