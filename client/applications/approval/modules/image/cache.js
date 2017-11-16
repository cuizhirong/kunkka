const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getImageList: function() {
    return fetch.get({
      url: '/api/v1/images/owner'
    }).then(function(data) {
      return data.images;
    });
  }
};
