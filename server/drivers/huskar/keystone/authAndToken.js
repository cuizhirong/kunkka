'use strict';

const Base = require('../base.js');
const driver = new Base();

driver.unscopedAuth = function (username, password, domain, remote, callback) {
  return driver.postMethod(
    remote + '/v3/auth/tokens',
    null,
    callback,
    {
      'auth': {
        'scope': {
          'unscoped': {}
        },
        'identity': {
          'methods': [
            'password'
          ],
          'password': {
            'user': {
              'name': username,
              'domain': {
                'name': domain
              },
              'password': password
            }
          }
        }
      }
    }
  );
};

driver.scopedAuth = function (projectId, token, remote, callback) {
  return driver.postMethod(
    remote + '/v3/auth/tokens',
    token,
    callback,
    {
      'auth': {
        'scope': {
          'project': {
            'id': projectId
          }
        },
        'identity': {
          'token': {
            'id': token
          },
          'methods': [
            'token'
          ]
        }
      }
    }
  );
};

driver.scopedAuthByPassword = function (username, password, domain, projectId, remote, callback) {
  return driver.postMethod(
    remote + '/v3/auth/tokens',
    null,
    callback,
    {
      'auth': {
        'identity': {
          'methods': [
            'password'
          ],
          'password': {
            'user': {
              'name': username,
              'password': password,
              'domain': {
                'name': domain
              }
            }
          }
        },
        'scope': {
          'project': {
            'id': projectId
          }
        }
      }
    }
  );
};

/*** Promise ***/
driver.unscopedAuthAsync = function (username, password, domain, remote) {
  return driver.postMethodAsync(
    remote + '/v3/auth/tokens',
    null,
    {
      'auth': {
        'scope': {
          'unscoped': {}
        },
        'identity': {
          'methods': [
            'password'
          ],
          'password': {
            'user': {
              'name': username,
              'domain': {
                'name': domain
              },
              'password': password
            }
          }
        }
      }
    }
  );
};

driver.scopedAuthAsync = function (projectId, token, remote) {
  return driver.postMethodAsync(
    remote + '/v3/auth/tokens',
    token,
    {
      'auth': {
        'scope': {
          'project': {
            'id': projectId
          }
        },
        'identity': {
          'token': {
            'id': token
          },
          'methods': [
            'token'
          ]
        }
      }
    }
  );
};

driver.scopedAuthByPasswordAsync = function (username, password, domain, projectId, remote) {
  return driver.postMethodAsync(
    remote + '/v3/auth/tokens',
    null,
    {
      'auth': {
        'identity': {
          'methods': [
            'password'
          ],
          'password': {
            'user': {
              'name': username,
              'password': password,
              'domain': {
                'name': domain
              }
            }
          }
        },
        'scope': {
          'project': {
            'id': projectId
          }
        }
      }
    }
  );
};

module.exports = driver;
