'use strict';

const Base = require('../base.js');
const paginate = require('helpers/paginate.js');

// due to User is reserved word
function User (app) {
  this.app = app;
  this.arrService = ['keystone'];
  this.arrServiceObject = [];
  Base.call(this, this.arrService, this.arrServiceObject);
}

User.prototype = {
  getUserList: function (req, res, next) {
    this.getVars(req);
    this.__users( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let obj = paginate('users', payload.users, '/api/v1/users', this.query.page, this.query.limit);
        res.json({
          users: obj.users,
          users_links: obj.users_links
        });
        payload = null;
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes( () => {
      this.app.get('/api/v1/users', this.getUserList.bind(this));
    });
  }
};

Object.assign(User.prototype, Base.prototype);

module.exports = User;
