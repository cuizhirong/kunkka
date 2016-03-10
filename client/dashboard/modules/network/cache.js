var request = require('client/dashboard/cores/request');

module.exports = {
  getNetworkList: function() {
    return request.get({
      url: '/api/v1/networks'
    }).then(function(data) {
      return data.images;
    });
  }
};
