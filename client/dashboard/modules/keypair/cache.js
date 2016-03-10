var request = require('client/dashboard/cores/request');

module.exports = {
  getKeypairList: function() {
    return request.get({
      url: '/api/v1/' + HALO.user.projectId + '/keypairs/detail'
    }).then(function(data) {
      return data.keypairs;
    });
  }

};
