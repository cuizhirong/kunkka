var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['resourcetype'], forced).then(function(data) {
      let resourcetypes = [];
      data.resourcetype.forEach((type, index) => {
        resourcetypes.push({
          type: type
        });
      });
      return resourcetypes;
    });
  },
  getSingle: function(name) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/resource_types/' + name
    });
  }
};
