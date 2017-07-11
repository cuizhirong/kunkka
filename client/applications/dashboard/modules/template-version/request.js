var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  getList: function(forced) {
    return storage.getList(['templateversion'], forced).then(function(data) {
      return data.templateversion.map((version, index) => {
        return {
          type: version.type,
          version: version.version
        };
      });
    });
  },
  getSingle: function(item) {
    return fetch.get({
      url: '/proxy/heat/v1/' + HALO.user.projectId + '/template_versions/' + item.version + '/functions'
    });
  }
};
