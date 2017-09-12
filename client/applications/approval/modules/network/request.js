const storage = require('client/applications/approval/cores/storage');
const fetch = require('client/applications/approval/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['network', 'subnet'], forced).then(function(data) {
      return data.network.filter((n) => {
        if (n['router:external'] && n.tenant_id !== HALO.user.projectId) {
          return false;
        }
        return true;
      });
    });
  },
  editNetworkName: function(item, newName) {
    let data = {};
    data.network = {};
    data.network.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/networks/' + item.id,
      data: data
    });
  },
  deleteNetworks: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/networks/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createApplication: function(data) {
    return fetch.post({
      url: '/api/apply',
      data: data
    });
  },
  deleteSubnet: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/subnets/' + item.id
    });
  }
};
