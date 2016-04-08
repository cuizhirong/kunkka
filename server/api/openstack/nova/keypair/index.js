'use strict';

var Base = require('../../base.js');

function Keypair (app) {
  this.app = app;
  this.arrService = ['nova'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Keypair.prototype = {
  getKeypairList: function (req, res, next) {
    this.projectId = req.params.projectId;
    this.region = req.headers.region;
    this.token = req.session.user.token;
    this.__keypairs( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        var keypairs = payload;
        this.orderByCreatedTime(keypairs.keypairs);
        res.json(keypairs);
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/keypairs/detail', this.getKeypairList.bind(this));
    });
  }
};

module.exports = function (app, extension) {
  Object.assign(Keypair.prototype, Base.prototype);
  if (extension) {
    Object.assign(Keypair.prototype, extension);
  }
  var instance = new Keypair(app);
  instance.initRoutes();
};
