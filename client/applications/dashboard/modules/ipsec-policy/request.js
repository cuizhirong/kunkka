var storage = require('client/applications/dashboard/cores/storage');
var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['ipsecpolicy'], forced).then((res) => {
      return res.ipsecpolicy;
    });
  },
  deletePolicy: function(items) {
    var deferredList = [];
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
