'use strict';

const Base = require('../base.js');

// due to Security is reserved word
function Security (app, neutron) {
  this.app = app;
  Base.call(this);
}

Security.prototype = {
  getSecurityList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    this.__security_groups(objVar, (err, payload) => {
      if (err) {
        res.status(err.status).json(err);
      } else {
        this.orderByCreatedTime(payload.security_groups);
        res.json(payload);
      }
    });
  },
  getSecurityDetails: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId', 'securityId']);
    this.__security_groupDetail(objVar, (err, payload) => {
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
