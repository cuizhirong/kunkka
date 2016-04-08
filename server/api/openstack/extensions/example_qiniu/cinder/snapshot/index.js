'use strict';

/* EXAMPLE */

const snapshot = {};

snapshot.addRoutes = function (app) {
  app.get('/api/v1/snapshot/version', function (req, res) {
    res.status(200).json({'version': 2.1});
  });
};

// snapshot.makeSnapshot = function (snapshot, obj) {
//   return snapshot['ext:test'] = {'TEST': 'this is a test for extension.'};
// };

module.exports = snapshot;
