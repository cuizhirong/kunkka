'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.getQuota = function (projectId, targetId, token, remote, callback, query) {
  let pid = targetId ? targetId : projectId;
  return driver.getMethod(
    remote + '/v2/' + projectId + '/os-quota-sets/' + pid,
    token,
    callback,
    query
  );
};

driver.updateQuota = function (projectId, targetId, token, remote, callback, theBody) {
  return driver.putMethod(
    remote + '/v2/' + projectId + '/os-quota-sets/' + targetId,
    token,
    callback,
    theBody
  );
};

module.exports = driver;
