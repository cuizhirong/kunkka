var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['network', 'subnet'], forced).then(function(data) {
      return data.network.filter((n) => {
        if (n['router:external']) {
          return false;
        }
        return true;
      });
    });
  },
  editNetworkName: function(item, newName) {
    var data = {};
    data.network = {};
    data.network.name = newName;

    return fetch.put({
      url: '/proxy/neutron/v2.0/networks/' + item.id,
      data: data
    });
  },
  deleteNetworks: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/networks/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createNetwork: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/networks',
      data: {
        network: data
      }
    });
  },
  createSubnet: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/subnets',
      data: {
        subnet: data
      }
    });
  },
  deleteSubnet: function(item) {
    return fetch.delete({
      url: '/proxy/neutron/v2.0/subnets/' + item.id
    });
  }
};
