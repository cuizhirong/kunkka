const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getImageList: function() {
    return fetch.get({
      url: '/api/v1/images'
      //url: '/proxy-search/glance/v2/images'
    }).then(function(data) {
      return data.images;
    });
  }
};
