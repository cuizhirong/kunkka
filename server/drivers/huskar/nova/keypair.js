'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.listKeypairs = function (projectId, token, remote, callback, query) {
  return driver.getMethod(
    remote + '/v2.1/' + projectId + '/os-keypairs',
    token,
    callback,
    query
  );
};

/*** Promise ***/

driver.listKeypairsAsync = function (projectId, token, remote, query) {
  return driver.getMethodAsync(
    remote + '/v2.1/' + projectId + '/os-keypairs',
    token,
    query
  );
};


module.exports = driver;
