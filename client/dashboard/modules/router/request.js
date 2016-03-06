var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb) {
    return request.get({
      url: '/api/v1/routers'
    }).then(function(data) {
      cb(data);
    });
  }
};
