'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listDomains = (token, remote, query, callback) => {
  return driver.getMethod(
    `${remote}/v3/domains`,
    token,
    callback,
    query
  );
};

module.exports = driver;
