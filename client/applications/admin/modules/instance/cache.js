var fetch = require('client/applications/admin/cores/fetch');

module.exports = {
  getImageType: function() {
    return fetch.get({
      url: '/proxy/glance/v2/images?visibility=public'
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
