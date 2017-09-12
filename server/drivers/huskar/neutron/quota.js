'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.getQuota = function (projectId, targetId, token, remote, callback, query) {
  let pid = targetId ? ('/' + targetId) : ('/' + projectId);
  return driver.getMethod(
    remote + '/v2.0/quotas' + pid,
    token,
    callback,
    query
  );
};

driver.updateQuota = function (projectId, targetId, token, remote, callback, theBody) {
  return driver.putMethod(
    remote + '/v2.0/quotas/' + targetId,
    token,
    callback,
    theBody
  );
};

/*** Promise ***/

driver.getQuotaAsync = function (projectId, targetId, token, remote, query) {
  let pid = targetId ? ('/' + targetId) : ('/' + projectId);
  return driver.getMethodAsync(
    remote + '/v2.0/quotas' + pid,
    token,
    query
  );
};

driver.updateQuotaAsync = function (projectId, targetId, token, remote, theBody) {
  return driver.putMethodAsync(
    remote + '/v2.0/quotas/' + targetId,
    token,
    theBody
  );
};

module.exports = driver;
