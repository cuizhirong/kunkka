const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['ipsecpolicy'], forced).then((res) => {
      return res.ipsecpolicy;
    });
  },
  deletePolicy: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/neutron/v2.0/vpn/ipsecpolicies/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  createPolicy: function(data) {
    return fetch.post({
      url: '/proxy/neutron/v2.0/vpn/ipsecpolicies',
      data: data
    }).then(function(res) {
      return res;
    });
  }
};
