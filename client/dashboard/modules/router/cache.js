var request = require('client/dashboard/cores/request');

module.exports = {
  getRouterList: function() {
    return request.get({
      url: '/api/v1/routers'
    }).then(function(data) {
      return data.images;
    });
  }
};
