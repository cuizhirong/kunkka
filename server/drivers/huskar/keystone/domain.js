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

/*** Promise ***/
driver.listDomainsAsync = (token, remote, query) => {
  return driver.getMethodAsync(
    `${remote}/v3/domains`,
    token,
    query
  );
};

module.exports = driver;
