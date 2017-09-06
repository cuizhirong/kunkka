var fetch = require('client/applications/admin/cores/fetch');

module.exports = {
  getImageType: function() {
    return fetch.get({
      url: '/proxy-search/glance/v2/images'
    });
  },
  getFlavorType: function() {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/flavors'
    });
  },
  getHostType: function() {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/os-hypervisors/detail'
    });
  }
};
