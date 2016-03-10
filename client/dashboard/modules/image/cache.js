var request = require('client/dashboard/cores/request');

module.exports = {
  getImageList: function() {
    return request.get({
      url: '/api/v1/images'
    }).then(function(data) {
      return data.images;
    });
  }
};
