'use strict';

const Promise = require('bluebird');
const base = require('../base');
const logModel = require('../../models').loginlog;

const findAllByFields = function (fields) {
  let obj = {where: {}};
  if (fields.limit) {
    obj.limit = fields.limit;
  }
  if (fields.page) {
    obj.offset = (fields.page - 1) * fields.limit;
  }

  obj.order = [
    ['updatedAt', 'DESC']
  ];

  return Promise.props({
    rows:logModel.findAll(obj),
    count: logModel.count({})
  });
};

function User(app) {
  this.app = app;
}

User.prototype = {
  listLog: function (req, res, next) {
    let limit = req.query.limit;
    let page = req.query.page;
    let fields = {};
    if (limit) {
      fields.limit = parseInt(limit, 10);
      if (page) {
        fields.page = parseInt(page, 10);
      } else {
        fields.page = 1;
      }
    }
    findAllByFields(fields).then(result => {
      let data = {
        log: result.rows,
        count: result.count
      };
      if (limit) {
        data.next = (result.count / limit) > fields.page ? (fields.page + 1) : null;
        data.prev = fields.page === 1 ? null : (page - 1);
      }
      res.json(data);
    });
  },

  initRoutes: function () {
    this.app.get(
      '/api/admin/log/login',
      base.middleware.checkAdmin,
      this.listLog.bind(this)
    );
  }
};

module.exports = User;
