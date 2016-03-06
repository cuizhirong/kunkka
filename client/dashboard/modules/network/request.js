var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb) {
    return request.get({
      url: '/api/v1/networks'
    }).then(function(data) {
      cb(data);
    });
  }
};
