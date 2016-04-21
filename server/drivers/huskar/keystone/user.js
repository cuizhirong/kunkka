'use strict';

var keystoneRemote = require('config')('remote').keystone;
var Base = require('../base.js');
var driverUser = new Base('user');

driverUser.listUsers = function (token, callback, query) {
  return driverUser.getMethod(
    keystoneRemote + '/v3/users',
    token,
    callback,
    query
  );
};

module.exports = driverUser;
