var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getFloatingipList: function() {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/floatingips'
    }).then(function(data) {
      return data.floatingips;
    });
  }
};
