var request = require('client/dashboard/cores/request');

module.exports = {
  getList: function(cb) {
    return request.get({
      url: '/api/v1/subnets'
    }).then(function(data) {
      cb(data);
    });
  }
};
