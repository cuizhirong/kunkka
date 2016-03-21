var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getRouterList: function() {
    return fetch.get({
      url: '/api/v1/routers'
    }).then(function(data) {
      return data.routers;
    });
  }
};
