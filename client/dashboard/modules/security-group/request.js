var request = require('client/dashboard/cores/request');

module.exports = {
  listRouters: function() {
    //fix me when api is updated
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/security'
    });
  }

};
