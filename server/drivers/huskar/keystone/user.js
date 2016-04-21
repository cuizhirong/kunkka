'use strict';

var Base = require('../base.js');
var driver = new Base('keystone');

driver.listUsers = function (token, callback, query) {
  return driver.getMethod(
    driver.remote + '/v3/users',
    token,
    callback,
    query
  );
};

module.exports = driver;
