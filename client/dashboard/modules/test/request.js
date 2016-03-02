var request = require('client/dashboard/cores/request');

module.exports = {
  listInstances: function(cb) {
    return request.get({
      url: '/api/v1/images'
    }).then(function(data) {
      cb(data);
    });
  }

};
