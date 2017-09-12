const fetch = require('client/applications/approval/cores/fetch');

module.exports = {
  getKeypairList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/keypairs/detail'
    }).then(function(data) {
      return data.keypairs;
    });
  }

};
