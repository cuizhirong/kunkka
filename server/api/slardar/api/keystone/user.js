'use strict';

var Base = require('../base.js');

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
    let limit = this.query.limit ? parseInt(this.query.limit, 10) : 0;
    let page = this.query.page ? parseInt(this.query.page, 10) : 1;
    this.__users( (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let users = payload.users;
        let link = '/api/v1/users';
        let totalPage = 1;
        let theLimit = limit ? ('&limit=' + limit) : '';
        let obj = {
          users: users,
          users_links: []
        };
        if (limit > 0) {
          totalPage = Math.ceil(users.length / limit);
          obj.users = users.slice((page - 1) * limit, page * limit);
          if (page > 1) {
            obj.users_links.push({
              href: link + '?page=' + (page - 1) + theLimit,
              rel: 'prev'
            });
          }
          if (totalPage > page) {
            obj.users_links.push({
              href: link + '?page=' + (page + 1) + theLimit,
              rel: 'next'
            });
          }
        }
        res.json({
          users: obj.users,
          users_links: obj.users_links
        });
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
