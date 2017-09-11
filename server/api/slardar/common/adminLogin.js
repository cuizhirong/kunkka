'use strict';

const co = require('co');

const SlardarBase = require('../api/base');
const config = require('config');
const domain = config('domain') || 'Default';
const adminUsername = config('admin_username');
const adminPassword = config('admin_password');
const adminProjectId = config('admin_projectId');
const setRemote = require('./setRemote');

module.exports = function (callback) {
  if (callback && typeof callback === 'function') {
    SlardarBase.prototype.__scopedAuthByPassword({
      username: adminUsername,
      password: adminPassword,
      domain: domain,
      projectId: adminProjectId
    }, (err, response) => {
      if (err) {
        callback(err);
      } else {
        callback(null, {
          token: response.header['x-subject-token'],
          response: response,
          remote: setRemote(response.body.token.catalog)
        });
      }
    });
  } else {
    return new Promise((resolve, reject) => {
      co(function *() {
        const scopedAuthObj = yield SlardarBase.prototype.__scopedAuthByPasswordAsync({
          username: adminUsername,
          password: adminPassword,
          projectId: adminProjectId,
          domain: domain
        });
        const tokenObj = {
          token: scopedAuthObj.header['x-subject-token'],
          response: scopedAuthObj,
          remote: setRemote(scopedAuthObj.body.token.catalog)
        };
        resolve(tokenObj);
      }).catch(reject);
    });
  }
};
