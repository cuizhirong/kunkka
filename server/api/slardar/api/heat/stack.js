'use strict';

const async = require('async');
const Base = require('../base.js');

function Stack (app) {
  this.app = app;
  Base.call(this);
}

Stack.prototype = {
  createStack: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    objVar.stack = req.body.stack;
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
      },
      // Create stack task.
      (token, cb) => {
        objVar.token = token;
        this.__createStack.call(this, objVar, cb);
      }
    ], (err, data) => {
      if (typeof res === 'function') {
        return res(err, data);
      }
      if (err) {
        return this.handleError(err, req, res, next);
      } else {
        return res.json(data);
      }
    });
  },
  getStackList: function (req, res, next) {
    let objVar = this.getVars(req, ['projectId']);
    this.__stacks(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let stacks = payload.stacks;
        // this.orderByCreatedTime(stacks);
        res.json({stacks: stacks});
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.post('/api/v1/:projectId/stacks', this.createStack.bind(this));
      this.app.get('/api/v1/:projectId/stacks', this.getStackList.bind(this));
    });
  }
};

Object.assign(Stack.prototype, Base.prototype);

module.exports = Stack;
