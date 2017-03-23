'use strict';

const Base = require('../base.js');
const driver = new Base();

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

driver.getDomainAsync = (token, remote, domainId) => {
  return driver.getMethodAsync(
    `${remote}/v3/domains/${domainId}`,
    token
  );
};

module.exports = driver;
