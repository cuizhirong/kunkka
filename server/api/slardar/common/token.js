'use strict';

const async = require('async');
const Base = require('../api/base.js');

function Token(app) {
  this.app = app;
  Base.call(this);
}

Token.prototype = {
  adminGetOtherProjectToken: function(req, callback) {
    let objVar = this.getVars(req, ['projectId']);
    async.waterfall([
      // Get admin role ID.
      (cb) => {
        this.__roles.call(this, {
          token: objVar.token
        }, (err, response) => {
          if (err) {
            cb(err);
          } else {
            cb(null, response.roles[0].id);
          }
        }, {
          name: 'admin'
        });
      },
      // Check if admin is in the project.
      (roleId, cb) => {
        this.__checkRole.call(this, {
          projectId: objVar.projectId,
          userId: req.session.user.userId,
          roleId: roleId,
          token: objVar.token
        }, (err, response) => {
          if (err) {
            cb(null, roleId);
          } else {
            cb(null, null);
          }
        });
      },
      // Join in project.
      (roleId, cb) => {
        if (roleId === null) {
          return cb(null);
        }
        this.__joinProject.call(this, {
          projectId: objVar.projectId,
          userId: req.session.user.userId,
          roleId: roleId,
          token: objVar.token
        }, (err, response) => {
          cb(err);
        });
      },
      // Get token of relative project.
      (cb) => {
        this.__scopedAuth.call(this, {
          projectId: objVar.projectId,
          token: objVar.token
        }, (err, response) => {
          if (err) {
            cb(err);
          } else {
            cb(null, response.header['x-subject-token']);
          }
        });
      }
    ], callback);
  }
};

Object.assign(Token.prototype, Base.prototype);

module.exports = Token;
