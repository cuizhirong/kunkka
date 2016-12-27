'use strict';

const co = require('co');

const SlardarBase = require('../api/base');

const config = require('config');
const domain = config('domain') || 'Default';
const adminUsername = config('admin_username');
const adminPassword = config('admin_password');
const adminProjectId = config('admin_projectId');

function setRemote(catalog) {
  let remote = {};
  let oneRemote;
  for (let i = 0, l = catalog.length, service = catalog[0]; i < l; i++, service = catalog[i]) {
    if (!remote[service.name]) {
      remote[service.name] = oneRemote = {};
    }
    for (let j = 0, m = service.endpoints.length, endpoint = service.endpoints[0]; j < m; j++, endpoint = service.endpoints[j]) {
      if (endpoint.interface === 'public') {
        oneRemote[endpoint.region_id] = endpoint.url.split('/').slice(0, 3).join('/');
      }
    }
  }
  return remote;
}

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
      }).catch(e => {
        reject(e);
      });
    });
  }
};
