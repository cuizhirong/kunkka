'use strict';

var Base = require('../base.js');
var driver = new Base('nova');

driver.getQuota = function (projectId, targetId, token, region, callback, query) {
  let pid = targetId ? targetId : projectId;
  return driver.getMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/os-quota-sets/' + pid,
    token,
    callback,
    query
  );
};

driver.updateQuota = function (projectId, targetId, token, region, callback, theBody) {
  return driver.putMethod(
    driver.remote[region] + '/v2.1/' + projectId + '/os-quota-sets/' + targetId,
    token,
    callback,
    theBody
  );
};

module.exports = driver;
