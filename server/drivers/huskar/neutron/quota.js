'use strict';

var Base = require('../base.js');
var driver = new Base('neutron');

driver.getQuota = function (projectId, targetId, token, region, callback, query) {
  let pid = targetId ? ('/' + targetId) : ('/' + projectId);
  return driver.getMethod(
    driver.remote[region] + '/v2.0/quotas' + pid,
    token,
    callback,
    query
  );
};

driver.updateQuota = function (projectId, targetId, token, region, callback, theBody) {
  return driver.putMethod(
    driver.remote[region] + '/v2.0/quotas/' + targetId,
    token,
    callback,
    theBody
  );
};

module.exports = driver;
