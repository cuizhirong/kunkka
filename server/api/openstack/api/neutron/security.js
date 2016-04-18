'use strict';

var Base = require('../base.js');

// due to Security is reserved word
function Security (app, neutron) {
  this.app = app;
  this.arrService = ['neutron'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

Security.prototype = {
  getSecurityList: function (req, res, next) {
    this.getVars(req, ['projectId']);
    this.__security_groups( (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        this.orderByCreatedTime(payload.security_groups);
        res.json(payload);
      }
    });
  },
  getSecurityDetails: function (req, res, next) {
    this.getVars(req, ['projectId', 'securityId']);
    this.__security_groupDetail( (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        res.json(payload);
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/:projectId/security', this.getSecurityList.bind(this));
      this.app.get('/api/v1/:projectId/security/:securityId', this.getSecurityDetails.bind(this));
    });
  }
};

Object.assign(Security.prototype, Base.prototype);

module.exports = Security;
