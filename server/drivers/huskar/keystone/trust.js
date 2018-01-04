'use strict';

const Base = require('../base.js');
const driver = new Base();


/*** Promise ***/
driver.listTrustsAsync = function (token, remote, query) {
  return driver.getMethodAsync(
    `${remote}/v3/OS-TRUST/trusts`,
    token,
    query
  );
};
driver.getTrustAsync = function (token, remote, trustId) {
  return driver.getMethodAsync(
    `${remote}/v3/OS-TRUST/trusts/${trustId}`,
    token
  );
};

driver.deleteTrustAsync = function (token, remote, trustId) {
  return driver.delMethodAsync(
    `${remote}/v3/OS-TRUST/trusts/${trustId}`,
    token
  );
};

driver.createTrustAsync = function (token, remote, payload) {
  return driver.postMethodAsync(
    `${remote}/v3/OS-TRUST/trusts`,
    token,
    payload
  );
};


driver.scopedAuthByTrustAsync = function (token, trustId, remote) {
  return driver.postMethodAsync(
    remote + '/v3/auth/tokens',
    null,
    {
      auth: {
        identity: {
          methods: [
            'token'
          ],
          token:{
            id: token
          }
        },
        scope: {
          'OS-TRUST:trust': {
            id: trustId
          }
        }
      }
    }
  );
};

module.exports = driver;
