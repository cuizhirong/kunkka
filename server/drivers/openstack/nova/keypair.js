'use strict';

var novaRemote = require('config')('remote').nova;
var Base = require('../base.js');
var driverKeypair = new Base('keypair');

driverKeypair.listKeypairs = function (projectId, token, region, callback, query) {
  return driverKeypair.getMethod(
    novaRemote[region] + '/v2.1/' + projectId + '/os-keypairs',
    token,
    callback,
    query
  );
};

module.exports = driverKeypair;
