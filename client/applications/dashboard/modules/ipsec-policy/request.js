var fetch = require('client/applications/dashboard/cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getList: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/vpn/ipsecpolicies'
    }).then((res) => {
      res.ipsecpolicies.forEach((item) => {
        item.sa_lifetime = item.lifetime.value + ' s';
      });
      return res;
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
