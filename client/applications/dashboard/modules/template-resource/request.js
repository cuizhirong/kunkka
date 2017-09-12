const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['resourcetype'], forced).then(function(data) {
      return data.resourcetype.map((type, index) => {
        return {type: type};
      });
    });
  },
  getSingle: function(name) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/resource_types/' + name
    });
  }
};
