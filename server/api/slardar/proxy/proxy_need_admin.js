'use strict';

const co = require('co');
const adminLogin = require('../common/adminLogin');

const middleware = (req, res, next) => {
  if (req.session.user.isAdmin) {
    next();
  } else {
    co(function* () {
      const adminToken = yield adminLogin();
      req.tempAdminToken = adminToken.token;
      next();
    });
  }
};

module.exports = app => {
  app.get('/proxy/neutron/v2.0/routers/:routerID/l3-agents.json', middleware);
};
