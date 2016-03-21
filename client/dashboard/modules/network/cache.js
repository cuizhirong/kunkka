var fetch = require('client/dashboard/cores/fetch');

module.exports = {
  getNetworkList: function() {
    return fetch.get({
      url: '/api/v1/networks'
    }).then(function(data) {
      return data.networks;
    });
  }
};
