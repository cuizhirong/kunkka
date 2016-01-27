var request = require('client/dashboard/cores/request');

module.exports = {
  listRouters: function() {
    return request.get({
      url: '/api/v1/routers'
    });
  }

};
